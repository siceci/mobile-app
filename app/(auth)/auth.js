// auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token:', token); // Log token retrieval
    return token;
  } catch (e) {
    console.error('Error fetching auth token:', e);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('Stored token:', token); // Log token storage
  } catch (e) {
    console.error('Error storing auth token:', e);
  }
};
