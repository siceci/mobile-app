import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTask = () => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = async () => {
    const formattedDate = [
        date.getFullYear(),
        ('0' + (date.getMonth() + 1)).slice(-2), // 月份从0开始，所以+1
        ('0' + (date.getDate() + 1)).slice(-2)          // 日期
    ].join('-'); // 格式为 YYYY-MM-DD

    try {
        const response = await fetch('http://localhost:3000/users/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                date: date.toISOString().split('T')[0],  // Format date as YYYY-MM-DD
                userId: 1  // Assuming a fixed user ID for demonstration
            }),
        });

        const textResponse = await response.text();  // 先获取响应文本
        try {
            const jsonResponse = JSON.parse(textResponse);  // 尝试解析JSON
            if (response.ok) {
                console.log('Task added:', jsonResponse.task);
            } else {
                console.error('Failed to add task:', jsonResponse.message);
            }
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            console.error('Server response:', textResponse);  // 输出服务器响应文本
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter task description"
        value={description}
        onChangeText={setDescription}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
      />
      <Button title="Choose Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate || date);  // 设置选定的日期，取消则保留原日期
          }}
        />
      )}
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
};

export default AddTask;
