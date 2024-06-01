import { useState, useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";
import { syncTasksWithServer, loadTasks, addTaskOffline, editTaskOffline, deleteTaskOffline } from '../components/taskStorage';

export const useTasks = () => {
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      setTasks(storedTasks);
    };

    fetchTasks();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncTasksWithServer().then(updatedTasks => {
          setTasks(updatedTasks);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (newTask) => {
    const updatedTasks = await addTaskOffline(newTask);
    setTasks(updatedTasks);
  };

  const editTask = async (updatedTask) => {
    const updatedTasks = await editTaskOffline(updatedTask);
    setTasks(updatedTasks);
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = await deleteTaskOffline(taskId);
    setTasks(updatedTasks);
  };

  return { tasks, addTask, editTask, deleteTask };
};
