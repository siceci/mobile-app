import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(18); 

  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        if (savedFontSize !== null && !isNaN(savedFontSize)) {
          setFontSize(parseInt(savedFontSize, 10));
          console.log(`Loaded font size: ${savedFontSize}`);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load font size.');
      }
    };

    loadFontSize();
  }, []);

  const handleFontSizeChange = async (size) => {
    try {
      await AsyncStorage.setItem('fontSize', size.toString());
      setFontSize(size);
      console.log(`Saved font size: ${size}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save font size.');
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize: handleFontSizeChange }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export default FontSizeContext;
