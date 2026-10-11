import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

// Phones: full screen. Tablets and desktops: a centered, readable column so
// screens do not stretch edge to edge. Resizes live with the window or on rotation.
export function ResponsiveFrame({ children }: { children: React.ReactNode }) {
  const { isPhone, frameWidth } = useResponsive();
  if (isPhone) return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={[styles.column, { width: frameWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', backgroundColor: '#E2E8F0' },
  column: {
    flex: 1,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
