import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../../constants/theme';
import { getStatusColor, getStatusBgColor } from '../../utils/helpers';
import type { IncidentStatus } from '../../types';
import { INCIDENT_STATUS_LABELS } from '../../types';

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const bgColor = getStatusBgColor(status);
  const label = INCIDENT_STATUS_LABELS[status] || status.toUpperCase();

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: bgColor,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.lg,
        paddingVertical: size === 'sm' ? 3 : 5,
      },
    ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[
        styles.label,
        {
          color,
          fontSize: size === 'sm' ? fontSize.xs : fontSize.sm,
        },
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
