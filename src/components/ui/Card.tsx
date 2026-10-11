import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  shadows,
  fontSize,
  fontWeight,
} from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: boolean;
}

export function Card({
  children,
  style,
  padding = spacing.xl,
  shadow = false,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        shadow && shadows.sm,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  color = colors.primary,
  icon,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, shadows.sm]}>
      {icon && (
        <View
          style={[
            styles.statIcon,
            { backgroundColor: color + '15' },
          ]}
        >
          {icon}
        </View>
      )}

      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
  },

  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginTop: 2,
    textAlign: 'center',
  },
});