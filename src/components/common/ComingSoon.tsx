import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSize, fontWeight } from '@/constants/theme';

export function ComingSoon({ name }: { name: string }) {
  return (
    <View style={styles.card}>
      <Ionicons name="construct-outline" size={28} color={colors.textMuted} />
      <Text style={styles.title}>{name} is not built yet</Text>
      <Text style={styles.text}>This page is a placeholder so the sidebar link works.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  text: { fontSize: fontSize.sm, color: colors.textSecondary },
});
