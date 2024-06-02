import React, { useEffect, useState, useContext } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTask from '../components/AddTask';
import TaskList from '../components/TaskList';
import moment from 'moment-timezone';
import { syncTasksWithServer, deleteTaskOffline } from '../components/taskStorage';
import { getAuthToken } from '../(auth)/auth';
import NetInfo from '@react-native-community/netinfo';
import FontSizeContext from '../components/FontSizeContext';
import { clearOfflineTasks } from '../components/clearOfflineTasks'; 
import {REACT_APP_API_BASE_URL} from '@env';

const CalendarTask = () => {
  const { fontSize } = useContext(FontSizeContext);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const today = moment().tz('Australia/Sydney').format('YYYY-MM-DD');

  useEffect(() => {
    fetchUserId();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        clearOfflineTasks().then(() => {
          syncTasksWithServer(); 
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();

      const interval = setInterval(() => {
        syncTasksWithServer().then(fetchTasks);
      }, 60000); 

      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const authToken = await getAuthToken();
  
      if (!authToken) {
        // Alert.alert('Error', 'No authentication token found, unable to fetch user ID');
        return;
      }
  
      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/get-current-user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
  
      if (response.ok) {
        const jsonResponse = await response.json();
        setUserId(jsonResponse.user.id);
      } else {
        // Alert.alert('Error', `Failed to fetch user ID: ${response.statusText}`);
      }
    } catch (error) {
      // Alert.alert('Error', `Error fetching user ID: ${error.message}`);
    }
  };
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const authToken = await getAuthToken();
  
      if (!authToken) {
        // Alert.alert('Error', 'No authentication token found, unable to fetch tasks');
        setLoading(false);
        return;
      }
  
      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
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
          Object.keys(formattedItems).forEach(date => {
            formattedItems[date].sort((a, b) => a.completed - b.completed);
          });
          setItems(formattedItems);
  
          setSelectedDate(today);
          setTasksForSelectedDate(formattedItems[today] || []);
        } 
      } else {
        const textResponse = await response.text();
        Alert.alert('Error', `Server response not JSON: ${textResponse}`);
      }
    } catch (error) {
      // Alert.alert('Error', `Error fetching tasks: ${error.message}`);
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
        Alert.alert('Error', 'No authentication token found, unable to update task');
        return;
      }

      const response = await fetch('http://localhost:3000/users/update-task', {
        method: 'PUT',
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
          Alert.alert('Error', `Failed to update task: ${jsonResponse.message}`);
          rollbackTaskState(id, !newState);
        }
      } else {
        const textResponse = await response.text();
        Alert.alert('Error', `Server response not JSON: ${textResponse}`);
        rollbackTaskState(id, !newState);
      }
    } catch (error) {
      Alert.alert('Error', `Network error: ${error.message}`);
      rollbackTaskState(id, !newState);
    }
  };

  const deleteTask = async id => {
    try {
      await deleteTaskOffline(id);
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
      await syncTasksWithServer();
    } catch (error) {
      Alert.alert('Error', `Error deleting task: ${error.message}`);
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

  const renderEmptyData = () => (
    <View className="mt-5 items-center">
      <Text style={[styles.text, { fontSize }]}
      className="text-gray-500">No tasks for selected date.</Text>
    </View>
  );

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
                textDayFontSize: 17,
                textMonthFontSize: 18 ,
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
                  deleteTask={deleteTask}
                  setTasks={setItems}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {},
});

export default CalendarTask;
