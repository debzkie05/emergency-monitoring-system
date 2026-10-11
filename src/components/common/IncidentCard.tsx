import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate, formatLocation, getEmergencyColor } from '../../utils/helpers';
import type { Incident } from '../../types';

interface IncidentCardProps {
  incident: Incident;
  onPress: () => void;
  showReporter?: boolean;
}

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  medical: 'medkit',
  fire: 'flame',
  security: 'shield',
  accident: 'warning',
  hazard: 'alert-circle',
  other: 'ellipsis-horizontal-circle',
};

export function IncidentCard({ incident, onPress, showReporter = false }: IncidentCardProps) {
  const iconName = TYPE_ICONS[incident.type] || 'alert-circle';
  const iconColor = getEmergencyColor(incident.type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.sm,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.id}>{incident.id}</Text>
            <Text style={styles.time}>{formatDate(incident.createdAt)}</Text>
          </View>
          <Text style={styles.type} numberOfLines={1}>{incident.typeLabel}</Text>
          <Text style={styles.location} numberOfLines={1}>
            {formatLocation(incident.location)}
          </Text>
          {showReporter && (
            <Text style={styles.reporter} numberOfLines={1}>
              <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
              {' '}{incident.reporterName}
            </Text>
          )}
          <View style={styles.footer}>
            <StatusBadge status={incident.status} size="sm" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  type: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reporter: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xs,
  },
});
