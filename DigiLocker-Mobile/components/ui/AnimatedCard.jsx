import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * AnimatedCard - A reusable card component with press animation
 * 
 * Press-in: Scales down to 0.95
 * Release: Returns to scale 1.0
 * 
 * Usage:
 * <AnimatedCard onPress={handlePress} style={styles.card}>
 *   <YourCardContent />
 * </AnimatedCard>
 */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedCard({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  scaleValue = 0.95,
  duration = 150,
  ...rest 
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

/**
 * Card shadow constants for consistent styling
 */
export const CARD_SHADOW = {
  // Light shadow (subtle)
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // Medium shadow (default for most cards)
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  // Strong shadow (for prominent cards)
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};
