import React from 'react';

import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radius,
  fontSize,
  fontWeight,
  spacing,
} from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const bgColor = {
    primary: colors.primary,
    danger: colors.danger,
    outline: colors.surface,
    ghost: 'transparent',
    success: colors.success,
  }[variant];

  const textColor = {
    primary: colors.surface,
    danger: colors.surface,
    outline: colors.primary,
    ghost: colors.primary,
    success: colors.surface,
  }[variant];

  const borderColor = {
    primary: colors.primary,
    danger: colors.danger,
    outline: colors.border,
    ghost: 'transparent',
    success: colors.success,
  }[variant];

  const height = {
    sm: 40,
    md: 50,
    lg: 54,
  }[size];

  const textSize = {
    sm: fontSize.sm,
    md: fontSize.md,
    lg: fontSize.md,
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          height,
          opacity: disabled
            ? 0.5
            : pressed
              ? 0.85
              : 1,
          alignSelf: fullWidth
            ? 'stretch'
            : 'flex-start',
          paddingHorizontal: fullWidth
            ? 0
            : spacing.xxl,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={textColor}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: textColor,
              fontSize: textSize,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0,
  },
});