import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token:', token);
    return token;
  } catch (e) {
    console.error('Error fetching auth token:', e);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('Stored token:', token);
  } catch (e) {
    console.error('Error storing auth token:', e);
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token removed');
  } catch (e) {
    console.error('Error removing auth token:', e);
  }
};
