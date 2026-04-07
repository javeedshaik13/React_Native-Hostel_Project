import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  size = 'medium',
  icon,
}) {
  const { C } = useTheme();

  const getButtonStyle = (pressed) => {
    const base = {
      primary: {
        backgroundColor: disabled ? C.border : C.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? C.border : C.surfaceElevated,
        borderWidth: 1,
        borderColor: C.border,
      },
      cancel: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? C.border : C.error,
      },
      danger: {
        backgroundColor: disabled ? C.border : C.error,
        borderWidth: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    const selected = base[variant];
    
    if (pressed && !disabled) {
      if (variant === 'primary' || variant === 'danger') {
        selected.opacity = 0.85;
      } else if (variant === 'cancel') {
        selected.backgroundColor = hexToRgba(C.error, 0.06);
      } else if (variant === 'secondary') {
        selected.backgroundColor = C.border;
      }
    }

    return selected;
  };

  const getTextStyle = () => {
    const textColors = {
      primary: '#FFFFFF',
      secondary: C.text,
      cancel: C.error,
      danger: '#FFFFFF',
      ghost: C.primary,
    };

    return {
      color: disabled ? C.textMuted : textColors[variant],
    };
  };

  const getSizeStyle = () => {
    const sizes = {
      small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 },
      medium: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15 },
      large: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 },
    };
    return sizes[size];
  };

  const sizeStyle = getSizeStyle();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(pressed),
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : C.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              { fontSize: sizeStyle.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
