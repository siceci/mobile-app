import { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import NetInfo from "@react-native-community/netinfo";
import eventEmitter from '../components/eventEmitter';
import { syncTasksWithServer, loadTasks } from '../components/taskStorage';

const useTasks = (userId, today) => {
  const [items, setItems] = useState({});
  const [tasksForToday, setTasksForToday] = useState([]);

  useEffect(() => {
    const init = async () => {
      const loadedTasks = await loadTasks();
      setItems(loadedTasks);
    };

    init();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('Network is connected!');
        syncTasksWithServer();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleTaskUpdate = (updatedTasks) => {
      setItems(updatedTasks);
      setTasksForToday(updatedTasks[today] || []);
    };

    eventEmitter.on('tasksUpdated', handleTaskUpdate);

    return () => {
      eventEmitter.off('tasksUpdated', handleTaskUpdate);
    };
  }, [today]);

  return { items, tasksForToday, setItems, setTasksForToday };
};

export default useTasks;
