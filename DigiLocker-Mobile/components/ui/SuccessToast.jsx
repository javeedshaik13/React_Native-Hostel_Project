import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastStore } from '../../store/toastStore';

const TOAST_ICONS = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

function ToastItem({ toast, onDismiss }) {
  const { C } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Entrance animation
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12 });

    // Exit animation after duration
    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onDismiss)(toast.id);
      });
    }, toast.duration - 300);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const getToastColor = () => {
    switch (toast.type) {
      case 'success': return C.success;
      case 'error': return C.error;
      case 'warning': return C.warning;
      case 'info': return C.primary;
      default: return C.success;
    }
  };

  const getToastBg = () => {
    switch (toast.type) {
      case 'success': return C.successMuted;
      case 'error': return C.errorMuted;
      case 'warning': return C.warningMuted;
      case 'info': return C.primaryMuted;
      default: return C.successMuted;
    }
  };

  const color = getToastColor();
  const backgroundColor = getToastBg();

  return (
    <Animated.View style={[styles.toast, { backgroundColor: C.surface }, animatedStyle]}>
      <Pressable
        style={styles.toastContent}
        onPress={() => onDismiss(toast.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Ionicons name={TOAST_ICONS[toast.type]} size={20} color={color} />
        </View>
        <Text style={[styles.message, { color: C.text }]} numberOfLines={2}>
          {toast.message}
        </Text>
        <Pressable
          style={styles.closeButton}
          onPress={() => onDismiss(toast.id)}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={C.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function SuccessToast() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore(s => s.toasts);
  const hideToast = useToastStore(s => s.hideToast);

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={hideToast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
