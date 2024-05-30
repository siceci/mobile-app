import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome'; // 如果是 Expo 项目，使用 @expo/vector-icons
import { SafeAreaView } from 'react-native-safe-area-context';

const Bookmark = () => {
  const [items, setItems] = useState({});
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
          const formattedItems = {};
          jsonResponse.tasks.forEach(task => {
            const date = new Date(task.date).toISOString().slice(0, 10);
            if (!formattedItems[date]) {
              formattedItems[date] = [];
            }
            formattedItems[date].push({ ...task, id: task.id, name: `${task.description}`, completed: task.completed });
          });
          setItems(formattedItems);
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

  const toggleTaskCompletion = async (id) => {
    const newItems = { ...items };
    let newState = null;

    // 找到对应的任务并更改其完成状态
    Object.keys(newItems).forEach(date => {
      newItems[date] = newItems[date].map(item => {
        if (item.id === id) {
          newState = !item.completed; // 切换状态
          return { ...item, completed: newState };
        }
        return item;
      });
    });

    setItems(newItems); // 更新本地状态

    try {
      const response = await fetch('http://localhost:3000/users/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: id,
          completed: newState
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Task updated successfully:', jsonResponse);
        } else {
          console.error('Failed to update task:', jsonResponse.message);
          rollbackTaskState(id, !newState);
        }
      } else {
        const textResponse = await response.text();
        console.error('Server response not JSON:', textResponse);
        rollbackTaskState(id, !newState);
      }
    } catch (error) {
      console.error('Network error:', error);
      rollbackTaskState(id, !newState);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch('http://localhost:3000/users/delete-task', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: id }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('Task deleted successfully:', jsonResponse);
          // 删除本地状态中的任务
          const newItems = { ...items };
          Object.keys(newItems).forEach(date => {
            newItems[date] = newItems[date].filter(item => item.id !== id);
            if (newItems[date].length === 0) {
              delete newItems[date];
            }
          });
          setItems(newItems);
        } else {
          console.error('Failed to delete task:', jsonResponse.message);
        }
      } else {
        const textResponse = await response.text();
        console.error('Server response not JSON:', textResponse);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // 回滚任务状态的函数
  const rollbackTaskState = (taskId, originalState) => {
    const rolledBackItems = { ...items };
    Object.keys(rolledBackItems).forEach(date => {
      rolledBackItems[date] = rolledBackItems[date].map(item => {
        if (item.id === taskId) {
          return { ...item, completed: originalState };
        }
        return item;
      });
    });
    setItems(rolledBackItems);
  };

  const renderItem = (item) => {
    return (
      <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
          <Icon
            name={item.completed ? 'check-square-o' : 'square-o'}
            size={24}
            color="green"
          />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, fontSize: 16 }}>{item.name}</Text>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Icon
            name="trash"
            size={24}
            color="red"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyData = () => {
    return (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: 'grey' }}>You have no task today.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: 'white', height: '100%' }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <Agenda
          items={items}
          renderItem={renderItem}
          renderEmptyData={renderEmptyData}
          theme={{
            agendaDayTextColor: 'yellow',
            agendaDayNumColor: 'green',
            agendaTodayColor: 'red',
            agendaKnobColor: 'blue'
          }}
          pastScrollRange={3}
          futureScrollRange={3}
        />
      )}
    </SafeAreaView>
  );
};

export default Bookmark;
