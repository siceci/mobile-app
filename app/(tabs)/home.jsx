import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTask from '../components/AddTask';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Tasks fetched successfully:', jsonResponse);
          setTasks(jsonResponse.tasks || []); // 確保 tasks 是在 JSON 響應中
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

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: 'white', height: '100%' }}>
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Your Tasks
        </Text>
        <AddTask></AddTask>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          tasks.length > 0 ? (
            tasks.map((task, index) => (
              <Text key={index} style={{ fontSize: 16, marginTop: 10 }}>
                {task.description} - Due: {new Date(task.date).toISOString().slice(0, 10)} {task.completed ? '(Completed)' : '(Pending)'}
              </Text>
            ))
          ) : (
            <Text>No tasks available.</Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
