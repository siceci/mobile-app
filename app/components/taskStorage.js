import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import { getAuthToken } from '../(auth)/auth';

let isSyncing = false;

export const storeTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem('tasks', jsonValue);
  } catch (e) {
    console.error('Error storing tasks:', e);
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('tasks');
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error loading tasks:', e);
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
    newTask.syncAction = 'add';  // 指定为新增操作
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
        return { ...task, pendingSync: true, syncAction: 'delete' };  // 指定为删除操作
      }
      return task;
    });
  }

  await storeTasks(currentTasks);
  return currentTasks;
};

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
    isSyncing = false;
    return;
  }

  let tasksUpdated = false;
  const updatedTasks = { ...tasks };

  for (const taskDate in updatedTasks) {
    const taskList = updatedTasks[taskDate];
    for (const task of taskList) {
      if (task.pendingSync) {
        if (task.syncAction === 'delete') {
          // 同步删除操作
          try {
            console.log(`Deleting task: ${JSON.stringify(task)}`);
            const response = await fetch('http://localhost:3000/users/delete-task', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify({ taskId: task.id }),
            });

            if (response.ok) {
              console.log('Task deleted:', task);
              taskList.splice(taskList.indexOf(task), 1); // 从列表中删除任务
              tasksUpdated = true;
            } else {
              const responseText = await response.text();
              console.error('Task deletion failed:', responseText);
            }
          } catch (error) {
            console.error('Task deletion failed:', error);
          }
        } else if (task.syncAction === 'add') {
          // 同步添加操作
          try {
            console.log(`Adding task: ${JSON.stringify(task)}`);
            const response = await fetch('http://localhost:3000/users/add-task', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify(task),
            });

            if (response.ok) {
              console.log('Task added:', task);
              task.pendingSync = false; // 取消待同步标记
              task.syncAction = ''; // 清空同步操作类型
              tasksUpdated = true;
            } else {
              const responseText = await response.text();
              console.error('Task addition failed:', responseText);
            }
          } catch (error) {
            console.error('Task addition failed:', error);
          }
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