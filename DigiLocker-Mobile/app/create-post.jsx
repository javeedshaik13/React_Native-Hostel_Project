import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function CreatePostScreen() {
  const { C } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.text, { color: C.text }]}>Create Post Screen</Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>
        Coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
});
