import React, { useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from "@react-native-community/netinfo";
import { getAuthToken } from '../(auth)/auth';
import { deleteTaskOffline, syncTasksWithServer } from './taskStorage';
import FontSizeContext from '../components/FontSizeContext';
import {REACT_APP_API_BASE_URL} from '@env';

const TaskItem = ({ item, toggleTaskCompletion, handleDeleteTask }) => {
  const { fontSize } = useContext(FontSizeContext);

  return (
    <View className={`flex-row p-3 items-center justify-between ml-4 mr-4 ${item.completed ? 'bg-green-100' : 'bg-red-100'}`}>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
          <Icon name={item.completed ? 'check-square-o' : 'square-o'} size={25} color={item.completed ? 'gray' : 'green'} />
        </TouchableOpacity>
        <Text style={[styles.text, { fontSize }]} className={`ml-2 ${item.completed ? 'text-gray-500' : 'text-black'}`}>{item.name}</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Icon name="trash" size={25} color={item.completed ? 'gray' : '#f43f5e'} style={{ marginLeft: 15 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TaskList = ({ tasks, toggleTaskCompletion, deleteTask, setTasks, renderEmptyData }) => {
  const handleDeleteTask = async (taskId) => {
    const authToken = await getAuthToken();
    if (!authToken) {
      // Alert.alert('Authentication Error', 'User not authenticated');
      return;
    }

    try {
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/users/delete-task`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ taskId }),
        });

        if (response.ok) {
          deleteTask(taskId);
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message);
          await deleteTaskOffline(taskId);
        }
      } else {
        await deleteTaskOffline(taskId);
        console.log('Task deleted offline:', taskId);
      }
    } catch (error) {
      Alert.alert('Network Error', error.message);
      await deleteTaskOffline(taskId);
      console.log('Due to network error, task deleted offline:', taskId);
    }

    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      for (const date in newTasks) {
        newTasks[date] = newTasks[date].filter(task => task.id !== taskId);
        if (newTasks[date].length === 0) {
          delete newTasks[date];
        }
      }
      return newTasks;
    });

    await syncTasksWithServer();
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncTasksWithServer();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncOnStartup = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        syncTasksWithServer();
      }
    };
    syncOnStartup();
  }, []);

  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TaskItem
          item={item}
          toggleTaskCompletion={toggleTaskCompletion}
          handleDeleteTask={handleDeleteTask}
        />
      )}
      ListEmptyComponent={renderEmptyData}
    />
  );
};

const styles = StyleSheet.create({
  text: {},
});

export default TaskList;
