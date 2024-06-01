// FontSizeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(18); // 默认字体大小

  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        if (savedFontSize !== null && !isNaN(savedFontSize)) {
          setFontSize(parseInt(savedFontSize, 10));
          console.log(`Loaded font size: ${savedFontSize}`);
        }
      } catch (error) {
        console.error('Failed to load font size.', error);
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
      console.error('Failed to save font size.', error);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize: handleFontSizeChange }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export default FontSizeContext;
