import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';

const EditTask = ({ task, onUpdateTask, onCancel }) => {
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(moment(task.date).tz('Australia/Sydney').toDate());
  const [modalVisible, setModalVisible] = useState(true);

  const handleUpdateTask = async () => {
    const formattedDate = moment(date).tz('Australia/Sydney').format('YYYY-MM-DD');

    try {
      const response = await fetch('http://localhost:3000/users/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          description,
          date: formattedDate,
          completed: task.completed,
        }),
      });

      const textResponse = await response.text();
      try {
        const jsonResponse = JSON.parse(textResponse);
        if (response.ok) {
          console.log('Task updated:', jsonResponse.task);
          onUpdateTask(jsonResponse.task);
        } else {
          console.error('Failed to update task:', jsonResponse.message);
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        onCancel();
      }}
    >
      <View className="flex-1 justify-center items-center bg-opacity-50">
        <View className="w-4/5 bg-teal-500 p-5 rounded-2xl border-teal-950 border shadow-md">
          <Text className="font-semibold text-lg mb-1 text-white">Edit Task:</Text>
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
              onChange={(event, selectedDate) => {
                setDate(selectedDate || date);
              }}
            />
          </View>
          <View className="flex-row justify-center gap-10">
            <TouchableOpacity 
              className="bg-red-400 rounded-xl px-3 py-2"
              onPress={() => {
                setModalVisible(false);
                onCancel();
              }}
            >
              <Text className="text-white text-base font-bold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-blue-500 rounded-xl px-3 py-2"
              onPress={handleUpdateTask}
            >
              <Text className="text-white text-base font-bold text-center">Update Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditTask;
