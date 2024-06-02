import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import NetInfo from "@react-native-community/netinfo";
import { addTaskOffline, syncTasksWithServer } from './taskStorage';
import FontSizeContext from '../components/FontSizeContext';
import { getAuthToken } from '../(auth)/auth'; 

const AddTask = ({ userId, onAddTask }) => {
  const { fontSize } = useContext(FontSizeContext);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTask = async () => {
    const formattedDate = moment(date).tz('Australia/Sydney').format('YYYY-MM-DD');
    const newTask = {
      description,
      date: formattedDate,
      userId,
      id: Date.now(), // Ensure unique ID
      pendingSync: true
    };

    try {
      const state = await NetInfo.fetch();
      const authToken = await getAuthToken(); // Retrieve the auth token

      if (!authToken) {
        Alert.alert('Authentication Error', 'User not authenticated');
        return;
      }

      if (state.isConnected) {
        const response = await fetch('http://localhost:3000/users/add-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`, // Include the auth token
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          console.log('Task added:', jsonResponse.task);
          onAddTask(jsonResponse.task);
        } else {
          // const errorMessage = await response.text();
          // Alert.alert('Task addition failed', errorMessage);
          await addTaskOffline(newTask);
          onAddTask(newTask);
        }
      } else {
        await addTaskOffline(newTask);
        console.log('Task saved offline:', newTask);
        onAddTask(newTask);
      }
    } catch (error) {
      // console.error('Network error:', error);
      Alert.alert('Network Error', "\n" + error.message + "\n\nTask saved locally");
      await addTaskOffline(newTask);
      console.log('Due to network error, task saved offline:', newTask);
      onAddTask(newTask);
    }

    setModalVisible(false);
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
    <View className="flex-1 justify-center items-center">
      <TouchableOpacity 
        className="bg-orange-300 rounded-full p-3 shadow-lg w-16 h-16 justify-center items-center" 
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus" size={35} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-opacity-50">
          <View className="w-4/5 bg-teal-500 p-5 rounded-2xl border-teal-950 border shadow-md">
            <Text style={[styles.text, { fontSize }]}
            className="font-semibold mb-1 text-white">Add Task:</Text>
            <TextInput
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              style={[styles.text, { fontSize }]}
              className="bg-orange-200 text-black h-10 border rounded-xl border-orange-200 mb-5 px-3"
            />
            <Text style={[styles.text, { fontSize }]}
            className="font-semibold text-lg mb-1 text-white">Select Date:</Text>
            <View className="items-center mb-6 rounded-xl">
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                accentColor='#115e59'
                onChange={(event, selectedDate) => {
                  setDate(selectedDate || date);
                }}
              />
            </View>
            <View className="flex-row justify-center gap-10">
              <TouchableOpacity 
                className="bg-red-400 rounded-xl px-3 py-2"
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.text, { fontSize }]} className="text-white font-bold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 rounded-xl px-3 py-2"
                onPress={handleAddTask}
              >
                <Text style={[styles.text, { fontSize }]} className="text-white font-bold text-center">Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {},
});


export default AddTask;
