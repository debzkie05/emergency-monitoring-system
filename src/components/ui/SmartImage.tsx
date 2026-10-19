import React, { useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { Skeleton } from './Skeleton';

interface SmartImageProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

// Shows a skeleton until the picture has loaded, and a calm placeholder if it cannot load.
export function SmartImage({ uri, style, accessibilityLabel }: SmartImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: colors.surfaceAlt }, style]}>
      {state === 'loading' && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width="100%" height="100%" radius={0} />
        </View>
      )}
      {state === 'error' ? (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="image-outline" size={24} color={colors.textMuted} />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel={accessibilityLabel}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
    </View>
  );
}
