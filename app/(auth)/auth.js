import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token:', token);
    return token;
  } catch (e) {
    Alert.alert('Error', 'Error fetching auth token: ' + e);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('Stored token:', token);
  } catch (e) {
    Alert.alert('Error', 'Error storing auth token: ' + e);
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token removed');
  } catch (e) {
    Alert.alert('Error', 'Error removing auth token: ' + e);
  }
};
