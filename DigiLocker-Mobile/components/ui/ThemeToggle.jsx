import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const MODES = [
  { value: 'light', icon: 'sunny', label: 'Light' },
  { value: 'dark', icon: 'moon', label: 'Dark' },
  { value: 'system', icon: 'phone-portrait', label: 'Auto' },
];

export default function ThemeToggle({ compact = false, showLabel = true }) {
  const { C, mode, setMode } = useTheme();

  if (compact) {
    // Compact toggle for login page (top-right corner)
    const currentIndex = MODES.findIndex(m => m.value === mode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length];

    return (
      <TouchableOpacity
        style={[styles.compactToggle, { backgroundColor: C.surfaceElevated }]}
        onPress={() => setMode(nextMode.value)}
        activeOpacity={0.7}
      >
        <Ionicons name={MODES[currentIndex].icon} size={18} color={C.text} />
      </TouchableOpacity>
    );
  }

  // Full toggle with all options
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: C.textSecondary }]}>Theme</Text>
      )}
      <View style={[styles.toggleContainer, { backgroundColor: C.surfaceElevated }]}>
        {MODES.map((m, index) => {
          const isActive = mode === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.option,
                isActive && { backgroundColor: C.primary },
              ]}
              onPress={() => setMode(m.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={m.icon}
                size={16}
                color={isActive ? '#FFFFFF' : C.textMuted}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: isActive ? '#FFFFFF' : C.textMuted },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
