import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import type { Incident } from '@/types';
import { formatWaitingTime } from '@/utils/ordering';

interface AlertBannerProps {
  criticalIncidents: Incident[];
  onOpenList: () => void;
  onAcknowledgeOldest: (incidentId: string) => void;
  nowMs: number;
}

export function AlertBanner({
  criticalIncidents,
  onOpenList,
  onAcknowledgeOldest,
  nowMs,
}: AlertBannerProps) {
  const count = criticalIncidents.length;

  if (count === 0) {
    return (
      <View style={styles.calmBanner}>
        <View style={styles.calmLeft}>
          <View style={styles.calmIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.calmTitle}>System Calm &amp; Monitoring</Text>
            <Text style={styles.calmSubtitle}>
              No critical alerts waiting. Campus response teams standing by.
            </Text>
          </View>
        </View>
        <View style={styles.calmBadge}>
          <View style={styles.calmDot} />
          <Text style={styles.calmBadgeText}>ALL CLEAR</Text>
        </View>
      </View>
    );
  }

  const oldest = criticalIncidents[0];
  const next = criticalIncidents.length > 1 ? criticalIncidents[1] : null;

  const oldestWaiting = formatWaitingTime(oldest, nowMs);
  const nextWaiting = next ? formatWaitingTime(next, nowMs) : null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.speakerIconWrapper}>
          <Ionicons name="volume-high" size={24} color={colors.textWhite} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>
            {count === 1 ? '1 CRITICAL ALERT waiting' : `${count} CRITICAL ALERTS waiting`}
          </Text>

          <Text style={styles.subText} numberOfLines={1}>
            Oldest: {oldest.typeLabel || 'Critical Alert'} ({oldestWaiting}).
            {next ? ` Next: ${next.typeLabel || 'Alert'} (${nextWaiting}).` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.hintText}>One siren plays for the oldest alert</Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={onOpenList}
            style={({ pressed }) => [
              styles.openListButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.openListText}>Open list</Text>
          </Pressable>

          <Pressable
            onPress={() => onAcknowledgeOldest(oldest.id)}
            style={({ pressed }) => [
              styles.ackOldestButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.ackOldestText}>Acknowledge oldest</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#DC2626', // Vibrant urgent red matching target design
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
    minWidth: 280,
  },
  speakerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: colors.textWhite,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 0.3,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  openListButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  openListText: {
    color: colors.textWhite,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  ackOldestButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  ackOldestText: {
    color: '#111827',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  // Calm status banner
  calmBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  calmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  calmIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calmTitle: {
    color: '#166534',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  calmSubtitle: {
    color: '#15803D',
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  calmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  calmDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  calmBadgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: fontWeight.extrabold,
  },
});
