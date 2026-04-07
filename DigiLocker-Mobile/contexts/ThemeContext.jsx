import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '../constants/Colors';

const THEME_STORAGE_KEY = '@theme_preference';

// mode: 'light' | 'dark' | 'system'
const ThemeContext = createContext({
  C: LightColors,
  isDark: false,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode);
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = async (newMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const C = isDark ? DarkColors : LightColors;

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ C, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
