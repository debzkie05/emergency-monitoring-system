import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import type { Incident } from '@/types';
import { getIncidentSeverity } from '@/utils/severity';
import { formatWaitingTime, getReportCount } from '@/utils/ordering';

interface AlertQueuePanelProps {
  queueIncidents: Incident[];
  nowMs: number;
  isMuted: boolean;
  muteSecondsRemaining: number;
  volume: number;
  audioState: 'not_started' | 'active' | 'blocked' | 'unavailable';
  activeSirenId: string | null;
  onMuteToggle: () => void;
  onVolumeChange: (vol: number) => void;
  onTestSound: () => void;
}

export function AlertQueuePanel({
  queueIncidents,
  nowMs,
  isMuted,
  muteSecondsRemaining,
  volume,
  audioState,
  activeSirenId,
  onMuteToggle,
  onVolumeChange,
  onTestSound,
}: AlertQueuePanelProps) {
  // Only display active non-resolved incidents in queue
  const displayItems = queueIncidents.slice(0, 5);

  return (
    <View style={[styles.panelCard, shadows.sm]}>
      {/* Panel Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconWrapper}>
          <Ionicons name="volume-high" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Alert queue</Text>
          <Text style={styles.headerSubtitle}>
            One siren at a time, for the top alert
          </Text>
        </View>
      </View>

      {/* Queue items list */}
      <View style={styles.listContainer}>
        {displayItems.length === 0 ? (
          <View style={styles.emptyQueue}>
            <Text style={styles.emptyText}>No alerts waiting in queue</Text>
          </View>
        ) : (
          displayItems.map((inc, index) => {
            const severity = getIncidentSeverity(inc);
            const isCritical = severity === 'Critical';
            const isTopCritical = isCritical && index === 0;
            const waitingStr = formatWaitingTime(inc, nowMs);
            const reportCount = getReportCount(inc);
            const reportStr = reportCount === 1 ? '1 report' : `${reportCount} reports`;

            let statusLabel = '';
            let statusColor = colors.textSecondary;

            if (isTopCritical) {
              if (isMuted) {
                statusLabel = `Muted (${muteSecondsRemaining}s)`;
                statusColor = colors.warning;
              } else if (audioState === 'blocked') {
                statusLabel = 'Audio blocked';
                statusColor = colors.warningDark;
              } else if (audioState === 'not_started') {
                statusLabel = 'Unstarted';
                statusColor = colors.textMuted;
              } else if (audioState === 'active') {
                statusLabel = 'Siren playing';
                statusColor = colors.danger;
              } else {
                statusLabel = 'Available on web';
                statusColor = colors.textMuted;
              }
            } else if (isCritical) {
              statusLabel = 'Next';
              statusColor = colors.textSecondary;
            } else {
              statusLabel = 'After criticals';
              statusColor = colors.textSecondary;
            }

            return (
              <View key={inc.id} style={styles.queueItemRow}>
                {/* Number Circle Badge */}
                <View
                  style={[
                    styles.numberBadge,
                    isTopCritical ? styles.numberBadgeTop : styles.numberBadgeOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.numberBadgeText,
                      isTopCritical ? styles.numberBadgeTextTop : styles.numberBadgeTextOther,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>

                {/* Incident details */}
                <View style={styles.itemDetailsCol}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {inc.typeLabel || 'Incident'}
                  </Text>
                  <Text style={styles.itemSub}>
                    {waitingStr} {inc.status === 'acknowledged' ? 'waited' : 'waiting'}, {reportStr}
                  </Text>
                </View>

                {/* Queue status tag */}
                <Text style={[styles.queueStatusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Audio Controls Section */}
      <View style={styles.controlsSection}>
        {/* Volume Stepper / Slider */}
        <View style={styles.volumeRow}>
          <Text style={styles.volumeLabel}>Volume</Text>
          <View style={styles.volumeBar}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((step) => {
              const filled = volume >= step;
              return (
                <Pressable
                  key={step}
                  onPress={() => onVolumeChange(step)}
                  style={[
                    styles.volumeSegment,
                    filled && styles.volumeSegmentFilled,
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.volumePercentText}>
            {Math.round(volume * 100)}%
          </Text>
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={onMuteToggle}
            style={({ pressed }) => [
              styles.muteButton,
              isMuted && styles.muteButtonActive,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high-outline'}
              size={15}
              color={isMuted ? colors.warningDark : colors.text}
            />
            <Text
              style={[
                styles.muteButtonText,
                isMuted && styles.muteButtonTextActive,
              ]}
            >
              {isMuted ? `Muted (${muteSecondsRemaining}s)` : 'Mute for 60 sec'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onTestSound}
            style={({ pressed }) => [
              styles.testSoundButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.testSoundText}>Test sound</Text>
          </Pressable>
        </View>

        {/* Footnote explanation */}
        <Text style={styles.footnoteText}>
          While muted, the siren row shows &ldquo;Muted (58s)&rdquo; and sound
          returns by itself. The red banner stays on screen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  emptyQueue: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  queueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeTop: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  numberBadgeOther: {
    backgroundColor: colors.surfaceAlt,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.extrabold,
  },
  numberBadgeTextTop: {
    color: colors.danger,
  },
  numberBadgeTextOther: {
    color: colors.textSecondary,
  },
  itemDetailsCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  itemSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  queueStatusText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  controlsSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  volumeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    width: 50,
  },
  volumeBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 10,
    alignItems: 'center',
  },
  volumeSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  volumeSegmentFilled: {
    backgroundColor: colors.primary,
  },
  volumePercentText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  muteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muteButtonActive: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  muteButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  muteButtonTextActive: {
    color: colors.warningDark,
  },
  testSoundButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testSoundText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  footnoteText: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginTop: 2,
  },
});
