import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import { Alert } from 'react-native';
import { getAuthToken } from '../(auth)/auth';
import {REACT_APP_API_BASE_URL} from '@env';

let isSyncing = false;

export const storeTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem('tasks', jsonValue);
  } catch (e) {
    console.error('Error storing tasks:', e);
    Alert.alert('Error', 'Failed to store tasks.');
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('tasks');
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error loading tasks:', e);
    Alert.alert('Error', 'Failed to load tasks.');
    return {};
  }
};

export const addTaskOffline = async (newTask) => {
  const currentTasks = await loadTasks();
  const taskDate = moment(newTask.date).tz('Australia/Sydney').format('YYYY-MM-DD');

  if (!currentTasks[taskDate]) {
    currentTasks[taskDate] = [];
  }

  const taskExists = currentTasks[taskDate].some(
    (task) => task.description === newTask.description && task.date === newTask.date
  );

  if (!taskExists) {
    newTask.pendingSync = true;
    newTask.syncAction = 'add';
    currentTasks[taskDate].unshift(newTask);
    await storeTasks(currentTasks);
  }

  return currentTasks;
};

export const deleteTaskOffline = async (taskId) => {
  const currentTasks = await loadTasks();

  for (const taskDate in currentTasks) {
    currentTasks[taskDate] = currentTasks[taskDate].map(task => {
      if (task.id === taskId) {
        return { ...task, pendingSync: true, syncAction: 'delete' };
      }
      return task;
    });
  }

  await storeTasks(currentTasks);
  return currentTasks;
};

// export const toggleTaskCompletionOffline = async (taskId) => {
//   const currentTasks = await loadTasks();

//   for (const taskDate in currentTasks) {
//     currentTasks[taskDate] = currentTasks[taskDate].map(task => {
//       if (task.id === taskId) {
//         const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
//         return { ...task, status: newStatus, pendingSync: true, syncAction: 'update' };
//       }
//       return task;
//     });
//   }

//   await storeTasks(currentTasks);
//   return currentTasks;
// };

export const syncTasksWithServer = async () => {
  if (isSyncing) {
    console.log('Task sync already in progress, skipping this call');
    return;
  }

  isSyncing = true;

  const tasks = await loadTasks();
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log('No network connection, cannot sync tasks');
    isSyncing = false;
    return;
  }

  console.log('Network connected, starting task sync');
  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('No auth token found, cannot sync tasks');
    // Alert.alert('Error', 'User not authenticated');
    isSyncing = false;
    return;
  }

  let tasksUpdated = false;
  const updatedTasks = { ...tasks };

  for (const taskDate in updatedTasks) {
    const taskList = updatedTasks[taskDate];
    for (const task of taskList) {
      if (task.pendingSync) {
        switch (task.syncAction) {
          case 'delete':
            try {
              console.log(`Deleting task: ${JSON.stringify(task)}`);
              const response = await fetch(`${REACT_APP_API_BASE_URL}/users/delete-task`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ taskId: task.id }),
              });

              if (response.ok) {
                console.log('Task deleted:', task);
                taskList.splice(taskList.indexOf(task), 1);
                tasksUpdated = true;
              } else {
                const responseText = await response.text();
                // console.error('Task deletion failed:', responseText);
                // Alert.alert('Error', `Task deletion failed: ${responseText}`);
              }
            } catch (error) {
              // console.error('Task deletion failed:', error);
              // Alert.alert('Error', `Task deletion failed: ${error.message}`);
            }
            break;

          case 'add':
            try {
              console.log(`Adding task: ${JSON.stringify(task)}`);
              const response = await fetch(`${REACT_APP_API_BASE_URL}/users/add-task`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(task),
              });

              if (response.ok) {
                console.log('Task added:', task);
                Alert.alert('Task sync to server');
                task.pendingSync = false;
                task.syncAction = '';
                tasksUpdated = true;
              } else {
                const responseText = await response.text();
                // console.error('Task addition failed:', responseText);
                // Alert.alert('Error', `Task addition failed: ${responseText}`);
              }
            } catch (error) {
              // console.error('Task addition failed:', error);
              // Alert.alert('Error', `Task addition failed: ${error.message}`);
            }
            break;

          case 'update':
            try {
              console.log(`Updating task: ${JSON.stringify(task)}`);
              const response = await fetch(`${REACT_APP_API_BASE_URL}/users/update-task`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ taskId: task.id, newStatus: task.status }),
              });

              if (response.ok) {
                console.log('Task updated:', task);
                task.pendingSync = false;
                task.syncAction = '';
                tasksUpdated = true;
              } else {
                const responseText = await response.text();
                console.error('Task update failed:', responseText);
                Alert.alert('Error', `Task update failed: ${responseText}`);
              }
            } catch (error) {
              console.error('Task update failed:', error);
              Alert.alert('Error', `Task update failed: ${error.message}`);
            }
            break;
        }
      }
    }
  }

  if (tasksUpdated) {
    await storeTasks(updatedTasks);
    console.log('All tasks updated and stored');
  } else {
    console.log('No tasks to sync');
  }

  isSyncing = false;
};
