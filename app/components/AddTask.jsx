import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';

const AddTask = ({ userId, onAddTask }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTask = async () => {
    const formattedDate = moment(date).tz('Australia/Sydney').format('YYYY-MM-DD');

    try {
      const response = await fetch('http://localhost:3000/users/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          date: formattedDate,
          userId
        }),
      });

      const textResponse = await response.text();
      try {
        const jsonResponse = JSON.parse(textResponse);
        if (response.ok) {
          console.log('Task added:', jsonResponse.task);
          onAddTask(jsonResponse.task); // 将新任务传递给 Bookmark 组件
        } else {
          console.error('Failed to add task:', jsonResponse.message);
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        console.error('Server response:', textResponse);
      }
    } catch (error) {
      console.error('Network error:', error);
    }

    setModalVisible(false);
  };

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
            <Text className="font-semibold text-lg mb-1 text-white">Add Task:</Text>
            <TextInput
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              className="bg-orange-200 text-black h-10 border rounded-xl border-orange-200 mb-5 px-3 text-base"
            />
            <Text className="font-semibold text-lg mb-1 text-white">Choose date:</Text>
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
                <Text className="text-white text-base font-bold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 rounded-xl px-3 py-2"
                onPress={handleAddTask}
              >
                <Text className="text-white text-base font-bold text-center">Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddTask;
