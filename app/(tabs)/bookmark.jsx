import React, { useEffect, useState, useContext } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTask from '../components/AddTask';
import EditTask from '../components/EditTask';
import TaskList from '../components/TaskList';
import moment from 'moment-timezone';
import { syncTasksWithServer, deleteTaskOffline } from '../components/taskStorage';
import { getAuthToken } from '../(auth)/auth';
import NetInfo from '@react-native-community/netinfo';
import FontSizeContext from '../components/FontSizeContext';
import { clearOfflineTasks } from '../components/clearOfflineTasks'; // 引入清理离线任务的函数

const Bookmark = () => {
  const { fontSize } = useContext(FontSizeContext);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const today = moment().tz('Australia/Sydney').format('YYYY-MM-DD');

  useEffect(() => {
    fetchUserId();

    // 添加 NetInfo 监听器
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        clearOfflineTasks().then(() => {
          syncTasksWithServer(); // 尝试同步任务
        });
      }
    });

    return () => unsubscribe(); // 组件卸载时取消监听器
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      syncTasksWithServer().then(fetchTasks);
    }, 60000); // 每分钟检查一次同步任务
    return () => clearInterval(interval);
  }, []);

  const fetchUserId = async () => {
    try {
      const authToken = await getAuthToken(); // 获取身份验证令牌
  
      if (!authToken) {
        console.error('没有找到身份验证令牌，无法获取用户ID');
        return;
      }
  
      const response = await fetch('http://localhost:3000/users/get-current-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // 添加身份验证头
        },
      });
  
      if (response.ok) {
        const jsonResponse = await response.json();
        setUserId(jsonResponse.user.id);
      } else {
        console.error('Failed to fetch user ID:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const authToken = await getAuthToken(); // 获取身份验证令牌
  
      if (!authToken) {
        console.error('没有找到身份验证令牌，无法获取任务');
        setLoading(false);
        return;
      }
  
      const response = await fetch('http://localhost:3000/users/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // 添加身份验证头
        },
      });
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Tasks fetched successfully:', jsonResponse);
          const formattedItems = {};
          jsonResponse.tasks.forEach(task => {
            const date = moment(task.date).tz('Australia/Sydney').format('YYYY-MM-DD');
            if (!formattedItems[date]) {
              formattedItems[date] = [];
            }
            formattedItems[date].push({ ...task, id: task.id, name: `${task.description}`, completed: task.completed });
          });
          // Sort tasks: incomplete first, completed last
          Object.keys(formattedItems).forEach(date => {
            formattedItems[date].sort((a, b) => a.completed - b.completed);
          });
          setItems(formattedItems);
  
          setSelectedDate(today);
          setTasksForSelectedDate(formattedItems[today] || []);
        } 
      } else {
        const textResponse = await response.text();
        console.error('Server response not JSON:', textResponse);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
  };
  
  const toggleTaskCompletion = async id => {
    const updatedItems = { ...items };
    let newState = null;

    Object.keys(updatedItems).forEach(date => {
      updatedItems[date] = updatedItems[date].map(item => {
        if (item.id === id) {
          newState = !item.completed;
          return { ...item, completed: newState };
        }
        return item;
      });

      updatedItems[date].sort((a, b) => a.completed - b.completed);
    });

    setItems(updatedItems);
    setTasksForSelectedDate(updatedItems[selectedDate] || []);

    try {
      const authToken = await getAuthToken();

      if (!authToken) {
        console.error('没有找到身份验证令牌，无法更新任务');
        return;
      }

      const response = await fetch('http://localhost:3000/users/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id: id,
          completed: newState,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Task updated successfully:', jsonResponse);
        } else {
          console.error('Failed to update task:', jsonResponse.message);
          rollbackTaskState(id, !newState);
        }
      } else {
        const textResponse = await response.text();
        console.error('Server response not JSON:', textResponse);
        rollbackTaskState(id, !newState);
      }
    } catch (error) {
      console.error('Network error:', error);
      rollbackTaskState(id, !newState);
    }
  };

  const deleteTask = async id => {
    try {
      await deleteTaskOffline(id); // 标记任务为待同步删除
      setItems(prevItems => {
        const newItems = { ...prevItems };
        Object.keys(newItems).forEach(date => {
          newItems[date] = newItems[date].filter(item => item.id !== id);
          if (newItems[date].length === 0) {
            delete newItems[date];
          }
        });
        if (selectedDate) {
          setTasksForSelectedDate(newItems[selectedDate] || []);
        }
        return newItems;
      });
      await syncTasksWithServer(); // 立即尝试同步任务
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const rollbackTaskState = (taskId, originalState) => {
    const rolledBackItems = { ...items };
    Object.keys(rolledBackItems).forEach(date => {
      rolledBackItems[date] = rolledBackItems[date].map(item => {
        if (item.id === taskId) {
          return { ...item, completed: originalState };
        }
        return item;
      });
    });
    setItems(rolledBackItems);
    setTasksForSelectedDate(rolledBackItems[selectedDate] || []);
  };

  const updateTask = updatedTask => {
    const date = moment(updatedTask.date).tz('Australia/Sydney').format('YYYY-MM-DD');
    const newItems = { ...items };
    if (!newItems[date]) {
      newItems[date] = [];
    }
    newItems[date] = newItems[date].map(item => (item.id === updatedTask.id ? { ...updatedTask, id: updatedTask.id, name: updatedTask.description, completed: updatedTask.completed } : item));
    setItems(newItems);

    if (selectedDate === date) {
      setTasksForSelectedDate(newItems[date] || []);
    }

    setTaskToEdit(null);
  };

  const renderEmptyData = () => (
    <View className="mt-5 items-center">
      <Text className="text-lg text-gray-500">No tasks for selected date.</Text>
    </View>
  );

  const addNewTask = newTask => {
    const date = moment(newTask.date).tz('Australia/Sydney').format('YYYY-MM-DD');
    const newItems = { ...items };
    if (!newItems[date]) {
      newItems[date] = [];
    }
    newItems[date].unshift({ ...newTask, id: newTask.id, name: `${newTask.description}`, completed: newTask.completed });
    newItems[date].sort((a, b) => a.completed - b.completed);
    setItems(newItems);
    if (selectedDate) {
      setTasksForSelectedDate(newItems[selectedDate] || []);
    }
  };

  const handleDayPress = day => {
    const selectedDay = moment(day.dateString).tz('Australia/Sydney').format('YYYY-MM-DD');
    setSelectedDate(selectedDay);
    setTasksForSelectedDate(items[selectedDay] || []);
  };

  const getMarkedDates = () => {
    const marked = { [today]: { selected: true, marked: true } };

    if (selectedDate && selectedDate !== today) {
      marked[selectedDate] = { selected: true, marked: true, selectedColor: 'red', dotColor: 'red' };
    }

    Object.keys(items).forEach(date => {
      if (!marked[date]) {
        marked[date] = { marked: true, dotColor: 'red' };
      } else {
        marked[date].dotColor = 'white';
      }
    });

    return marked;
  };

  return (
    <SafeAreaView className="bg-orange-50 h-full">
      {loading ? (
        <ActivityIndicator size="large" className="text-blue-500 mt-5" />
      ) : (
        <>
          <View className="h-87">
            <Calendar
              markedDates={getMarkedDates()}
              onDayPress={handleDayPress}
              theme={{
                calendarBackground:'#fff7ed',
                textDayFontSize: fontSize -2,
                textMonthFontSize: fontSize ,
                textDayHeaderFontSize: 14,
                textDisabledColor: '#737373',
                dayTextColor: 'black',
                todayTextColor: 'red',
                selectedDayTextColor: 'white',
                selectedDayBackgroundColor: '#10b981',
                arrowColor: 'black',
                monthTextColor: 'black',
                textMonthFontWeight: 'bold',
                textDayFontWeight: 'semibold',
                textDayHeaderFontWeight: 'bold'
              }}
            />
          </View>
          {selectedDate && (
            <>
            <View>
              <Text style={[styles.text, { fontSize }]}>
                这是书签的内容。当前字体大小为 {fontSize}。
              </Text>
            </View>
              <Text style={[styles.text, { fontSize }]}
              className="font-semibold mt-4 ml-4 mb-1">
                Tasks for {''}
                <Text className="text-rose-500 font-bold"> 
                {moment(selectedDate).format('DD-MMM-YYYY')}</Text>
              </Text>
              {tasksForSelectedDate.length > 0 ? (
                <TaskList
                  tasks={tasksForSelectedDate}
                  toggleTaskCompletion={toggleTaskCompletion}
                  setTaskToEdit={setTaskToEdit}
                  deleteTask={deleteTask}
                  setTasks={setItems} // 傳遞 setTasks 函數
                  renderEmptyData={renderEmptyData}
                />
              ) : (
                renderEmptyData()
              )}
            </>
          )}
        </>
      )}
      <View className="absolute right-5 bottom-5">
        {userId && <AddTask userId={userId} onAddTask={addNewTask} />}
      </View>
      {taskToEdit && (
        <EditTask
          task={taskToEdit}
          onUpdateTask={updateTask}
          onCancel={() => setTaskToEdit(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    // 你可以在这里添加其他样式
  },
});

export default Bookmark;
