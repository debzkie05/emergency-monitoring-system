import React, { useEffect, useRef, useState } from 'react';
import { Animated, AccessibilityInfo, Platform, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

// A grey placeholder block that gently pulses. The pulse stops when the user has
// "reduce motion" turned on, and the block stays visible as a static shape.
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.8);
      return;
    }
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: native }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: '#E2E8F0', opacity }, style]}
    />
  );
}
