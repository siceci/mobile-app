import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTask from '../components/AddTask';
import EditTask from '../components/EditTask';
import moment from 'moment-timezone';
import eventEmitter from '../components/eventEmitter';  // Import the custom event emitter

const Home = () => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [tasksForToday, setTasksForToday] = useState([]);
  const today = moment().tz('Australia/Sydney').format('YYYY-MM-DD');

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  useEffect(() => {
    const handleTaskUpdate = (updatedTasks) => {
      setItems(updatedTasks);
      setTasksForToday(updatedTasks[today] || []);
    };

    // Listen for task updates
    eventEmitter.on('tasksUpdated', handleTaskUpdate);

    // Clean up the event listener
    return () => {
      eventEmitter.off('tasksUpdated', handleTaskUpdate);
    };
  }, [today]);

  const fetchUserId = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/get-current-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch('http://localhost:3000/users/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
          setTasksForToday(formattedItems[today] || []);

          // Emit the event to notify other components
          eventEmitter.emit('tasksUpdated', formattedItems);
        } else {
          console.log('Failed to fetch tasks:', jsonResponse.message);
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
    eventEmitter.emit('tasksUpdated', updatedItems);

    try {
      const response = await fetch('http://localhost:3000/users/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: id,
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
      const response = await fetch('http://localhost:3000/users/delete-task', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: id }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Task deleted successfully:', jsonResponse);
          const newItems = { ...items };
          Object.keys(newItems).forEach(date => {
            newItems[date] = newItems[date].filter(item => item.id !== id);
            if (newItems[date].length === 0) {
              delete newItems[date];
            }
          });
          setItems(newItems);
          setTasksForToday(newItems[today] || []);
          eventEmitter.emit('tasksUpdated', newItems);
        } else {
          console.error('Failed to delete task:', jsonResponse.message);
        }
      } else {
        const textResponse = await response.text();
        console.error('Server response not JSON:', textResponse);
      }
    } catch (error) {
      console.error('Network error:', error);
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
    eventEmitter.emit('tasksUpdated', rolledBackItems);
  };

  const updateTask = updatedTask => {
    const date = moment(updatedTask.date).tz('Australia/Sydney').format('YYYY-MM-DD');
    const newItems = { ...items };
    if (!newItems[date]) {
      newItems[date] = [];
    }
    newItems[date] = newItems[date].map(item => (item.id === updatedTask.id ? { ...updatedTask, id: updatedTask.id, name: updatedTask.description, completed: updatedTask.completed } : item));
    setItems(newItems);

    if (date === today) {
      setTasksForToday(newItems[date] || []);
    }

    setTaskToEdit(null);
    eventEmitter.emit('tasksUpdated', newItems);
  };

  const renderItem = ({ item }) => (
    <View className={`flex-row p-3 items-center h-14 justify-between ml-4 mr-4 ${item.completed ? 'bg-green-100' : 'bg-red-100'}`}>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
          <Icon name={item.completed ? 'check-square-o' : 'square-o'} size={25} color={item.completed ? 'gray' : 'green'} />
        </TouchableOpacity>
        <Text className={`ml-2 text-base ${item.completed ? 'text-gray-500' : 'text-black'}`}>{item.name}</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => setTaskToEdit(item)}>
          <Icon name="edit" size={25} color={item.completed ? 'gray' : '#3b82f6'} style={{ marginLeft: 10, marginBottom: -4 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Icon name="trash" size={25} color={item.completed ? 'gray' : '#f43f5e'} style={{ marginLeft: 15 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyData = () => (
    <View className="mt-5 items-center">
      <Text className="text-lg text-gray-500">No tasks for today.</Text>
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
    if (date === today) {
      setTasksForToday(newItems[today] || []);
    }
    eventEmitter.emit('tasksUpdated', newItems);
  };

  return (
    <SafeAreaView className="bg-orange-50 h-full">
      {loading ? (
        <ActivityIndicator size="large" className="text-blue-500 mt-5" />
      ) : (
        <>
          <Text className="text-2xl font-bold ml-6 mt-12 mb-3">
            Today's Tasks {' '}
            <Text className="text-emerald-600 font-extrabold">{moment(today).format('DD-MMM-YYYY')}</Text>
          </Text>
          {tasksForToday.length > 0 ? (
            <FlatList
              data={tasksForToday}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyData}
            />
          ) : (
            renderEmptyData()
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

export default Home;
