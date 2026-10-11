import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import type { IncidentStatus, StatusUpdate } from '../../types';
import { INCIDENT_STATUS_ORDER, INCIDENT_STATUS_LABELS } from '../../types';

interface StatusTimelineProps {
  statusHistory: StatusUpdate[];
  currentStatus: IncidentStatus;
}

export function StatusTimeline({ statusHistory, currentStatus }: StatusTimelineProps) {
  const currentIdx = INCIDENT_STATUS_ORDER.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {INCIDENT_STATUS_ORDER.map((status, index) => {
        const historyEntry = statusHistory.find((h) => h.status === status);
        const isCompleted = historyEntry !== undefined;
        const isCurrent = status === currentStatus;
        const isFuture = !isCompleted && !isCurrent;
        const color = isCompleted ? colors.success : isCurrent ? getStatusColor(status) : colors.border;
        const isLast = index === INCIDENT_STATUS_ORDER.length - 1;

        return (
          <View key={status} style={styles.step}>
            <View style={styles.indicator}>
              <View style={[
                styles.circle,
                {
                  backgroundColor: isCompleted ? colors.success : isCurrent ? color : 'transparent',
                  borderColor: color,
                  borderWidth: isFuture ? 2 : 0,
                },
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={colors.textWhite} />
                ) : isCurrent ? (
                  <View style={styles.currentDot} />
                ) : null}
              </View>
              {!isLast && (
                <View style={[
                  styles.line,
                  { backgroundColor: isCompleted ? colors.success : colors.border },
                ]} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[
                styles.label,
                {
                  color: isFuture ? colors.textMuted : colors.text,
                  fontWeight: isCurrent ? fontWeight.bold : fontWeight.medium,
                },
              ]}>
                {INCIDENT_STATUS_LABELS[status]}
              </Text>
              {historyEntry && (
                <Text style={styles.timestamp}>
                  {formatDateTime(historyEntry.timestamp)}
                </Text>
              )}
              {historyEntry?.note && (
                <Text style={styles.note}>{historyEntry.note}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    minHeight: 56,
  },
  indicator: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.lg,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
