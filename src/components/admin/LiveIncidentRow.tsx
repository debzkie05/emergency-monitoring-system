import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import type { Incident, Severity } from '@/types';
import { getIncidentSeverity, SEVERITY_CONFIG } from '@/utils/severity';
import { formatWaitingTime, getReportCount } from '@/utils/ordering';
import { formatTime, formatLocation } from '@/utils/helpers';
import { isIncidentEscalated } from '@/utils/escalation';

interface LiveIncidentRowProps {
  incident: Incident;
  nowMs: number;
  isSirenPlaying: boolean;
  audioState: 'not_started' | 'active' | 'blocked' | 'unavailable';
  isMuted: boolean;
  muteSecondsRemaining: number;
  queuePosition: number; // 0 = top, 1 = second, etc.
  hasCriticalsWaiting: boolean;
  onAcknowledge: (id: string) => void;
  onAssign: (id: string) => void;
  onOpenGroup?: (incident: Incident) => void;
}

export function LiveIncidentRow({
  incident,
  nowMs,
  isSirenPlaying,
  audioState,
  isMuted,
  muteSecondsRemaining,
  queuePosition,
  hasCriticalsWaiting,
  onAcknowledge,
  onAssign,
  onOpenGroup,
}: LiveIncidentRowProps) {
  const severity: Severity = getIncidentSeverity(incident);
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Moderate;
  const reportCount = getReportCount(incident);
  const waitingTime = formatWaitingTime(incident, nowMs);
  const escalationInfo = isIncidentEscalated(incident);

  // Pulse animation for the actively sounding critical incident
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isSirenPlaying) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (loop) loop.stop();
    };
  }, [isSirenPlaying]);

  // Audio queue status label logic
  let audioLabel = '';
  let audioLabelColor = colors.textSecondary;
  let showSpeakerIcon = false;

  if (severity === 'Critical') {
    if (incident.status === 'acknowledged') {
      audioLabel = 'Acknowledged';
      audioLabelColor = colors.primary;
    } else if (isMuted && queuePosition === 0) {
      audioLabel = `Muted (${muteSecondsRemaining}s)`;
      audioLabelColor = colors.warning;
    } else if (audioState === 'blocked' && queuePosition === 0) {
      audioLabel = 'Audio blocked';
      audioLabelColor = colors.warningDark;
    } else if (audioState === 'not_started' && queuePosition === 0) {
      audioLabel = 'Audio waiting start';
      audioLabelColor = colors.textMuted;
    } else if (audioState === 'unavailable' && queuePosition === 0) {
      audioLabel = 'Sound on web admin';
      audioLabelColor = colors.textMuted;
    } else if (isSirenPlaying) {
      audioLabel = 'Siren playing';
      audioLabelColor = colors.danger;
      showSpeakerIcon = true;
    } else if (queuePosition === 0) {
      audioLabel = 'Top of queue';
      audioLabelColor = colors.danger;
    } else {
      audioLabel = 'Next in queue';
      audioLabelColor = colors.textSecondary;
    }
  } else {
    // High or Moderate
    if (hasCriticalsWaiting) {
      audioLabel = 'Sounds after criticals';
      audioLabelColor = colors.textSecondary;
    } else if (isMuted) {
      audioLabel = `Muted (${muteSecondsRemaining}s)`;
      audioLabelColor = colors.warning;
    } else if (audioState === 'active') {
      audioLabel = 'Eligible for chime';
      audioLabelColor = colors.primary;
    } else {
      audioLabel = 'Sounds after criticals';
      audioLabelColor = colors.textSecondary;
    }
  }

  // Reporter details text
  const primaryReport = incident.reports && incident.reports.length > 0
    ? incident.reports[0]
    : null;
  const reporterName = primaryReport?.reporterName || incident.reporterName;
  const studentId = primaryReport?.studentId ? ` (${primaryReport.studentId})` : '';
  const timeStr = formatTime(incident.createdAt);
  const extraReportsCount = reportCount > 1 ? reportCount - 1 : 0;
  const extraReportsText = extraReportsCount > 0 ? `, +${extraReportsCount} more` : '';

  const getEmergencyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical':
        return 'medkit-outline';
      case 'security':
        return 'shield-outline';
      case 'fire':
        return 'flame-outline';
      case 'accident':
        return 'alert-circle-outline';
      case 'hazard':
        return 'warning-outline';
      default:
        return 'alert-outline';
    }
  };

  const isAcknowledged = incident.status === 'acknowledged';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          borderColor: isSirenPlaying
            ? pulseAnim.interpolate({
                inputRange: [0.4, 1],
                outputRange: ['#FCA5A5', '#DC2626'],
              })
            : sevConfig.borderColor,
          borderWidth: isSirenPlaying ? 2.5 : 1.5,
        },
      ]}
    >
      {/* Left Icon */}
      <View style={[styles.typeIconWrapper, { backgroundColor: sevConfig.bgColor }]}>
        <Ionicons
          name={getEmergencyIcon(incident.type) as any}
          size={22}
          color={sevConfig.color}
        />
      </View>

      {/* Main Info Body */}
      <View style={styles.mainInfo}>
        <View style={styles.headerPillsRow}>
          {/* Severity Pill */}
          <View style={[styles.severityPill, { backgroundColor: sevConfig.bgColor }]}>
            <Text style={[styles.severityPillText, { color: sevConfig.color }]}>
              {sevConfig.label}
            </Text>
          </View>

          {/* Incident Title */}
          <Text style={styles.incidentTitle}>{incident.typeLabel || 'Incident'}</Text>

          {/* Report Count Badge */}
          <Pressable
            onPress={() => onOpenGroup && onOpenGroup(incident)}
            style={({ pressed }) => [
              styles.reportsPill,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.reportsPillText}>
              {reportCount === 1 ? '1 report' : `${reportCount} reports`}
            </Text>
          </Pressable>
        </View>

        {/* Location */}
        <Text style={styles.locationText}>{formatLocation(incident.location)}</Text>

        {/* Reporter info */}
        <Text style={styles.reporterDetailsText}>
          Latest report {timeStr}, reported by {reporterName}
          {studentId}
          {extraReportsText}
        </Text>

        {/* Escalation Dev Fallback Notice */}
        {escalationInfo.isEscalated && (
          <View style={styles.escalationBanner}>
            <Ionicons name="warning" size={14} color="#B45309" />
            <Text style={styles.escalationBannerText}>
              {escalationInfo.message}
            </Text>
          </View>
        )}
      </View>

      {/* Waiting Time & Audio Indicator */}
      <View style={styles.queueColumn}>
        <Text style={styles.waitingTimeText}>{waitingTime}</Text>
        <Text style={styles.waitingSubText}>{isAcknowledged ? 'waited' : 'waiting'}</Text>

        <View style={styles.audioLabelRow}>
          {showSpeakerIcon && (
            <Ionicons name="volume-high" size={13} color={audioLabelColor} />
          )}
          <Text style={[styles.audioLabelText, { color: audioLabelColor }]}>
            {audioLabel}
          </Text>
        </View>
      </View>

      {/* Action Buttons Column */}
      <View style={styles.actionsColumn}>
        {!isAcknowledged ? (
          <Pressable
            onPress={() => onAcknowledge(incident.id)}
            style={({ pressed }) => [
              styles.actionButtonAcknowledge,
              { backgroundColor: sevConfig.color, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.actionButtonAckText}>Acknowledge</Text>
          </Pressable>
        ) : (
          <View style={styles.acknowledgedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.acknowledgedBadgeText}>Acknowledged</Text>
          </View>
        )}

        <Pressable
          onPress={() => onAssign(incident.id)}
          style={({ pressed }) => [
            styles.actionButtonAssign,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.actionButtonAssignText}>
            {incident.assignedTo ? `Assigned: ${incident.assignedToName?.split(' ')[0]}` : 'Assign responder'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  typeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: {
    flex: 2,
    minWidth: 240,
  },
  headerPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 0.5,
  },
  incidentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  reportsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  reportsPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  reporterDetailsText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  escalationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  escalationBannerText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  queueColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    paddingHorizontal: spacing.sm,
  },
  waitingTimeText: {
    fontSize: 22,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  waitingSubText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: -2,
    marginBottom: 4,
  },
  audioLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  audioLabelText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  actionsColumn: {
    alignItems: 'stretch',
    gap: 6,
    minWidth: 130,
  },
  actionButtonAcknowledge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonAckText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  actionButtonAssign: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonAssignText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  acknowledgedBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
});
