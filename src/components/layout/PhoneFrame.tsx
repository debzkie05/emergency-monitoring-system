import React from 'react';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/theme';

export const PHONE_MAX_WIDTH = 430;

// Keeps the user app and login in a portrait, phone-sized column.
// On a real phone it does nothing. In a desktop browser it centers the app at phone width.
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web' || width <= PHONE_MAX_WIDTH + 40) return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', backgroundColor: '#E2E8F0' },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: PHONE_MAX_WIDTH,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
