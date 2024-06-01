import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';

export const clearOfflineTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem('tasks');
    if (tasks !== null) {
      const parsedTasks = JSON.parse(tasks);
      const updatedTasks = {};

      for (const date in parsedTasks) {
        const filteredTasks = parsedTasks[date].filter(task => !task.pendingSync);
        if (filteredTasks.length > 0) {
          updatedTasks[date] = filteredTasks;
        }
      }

      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('Offline tasks cleared successfully');
    }
  } catch (e) {
    console.error('Error clearing offline tasks:', e);
  }
};
