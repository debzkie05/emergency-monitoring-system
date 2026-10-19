import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import type { Incident, LinkedReport } from '@/types';
import { formatDateTime, formatLocation } from '@/utils/helpers';

interface GroupedReportsModalProps {
  visible: boolean;
  incident: Incident | null;
  onClose: () => void;
  onSplitReport: (incidentId: string, reportId: string) => void;
}

export function GroupedReportsModal({
  visible,
  incident,
  onClose,
  onSplitReport,
}: GroupedReportsModalProps) {
  if (!incident) return null;

  const reports: LinkedReport[] = incident.reports && incident.reports.length > 0
    ? incident.reports
    : [
        {
          id: `REP-${incident.id}-1`,
          reporterId: incident.reporterId,
          reporterName: incident.reporterName,
          timestamp: incident.createdAt,
          location: incident.location,
          description: incident.description,
        },
      ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, shadows.lg]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Grouped Reports ({reports.length})
              </Text>
              <Text style={styles.modalSubtitle}>
                {incident.typeLabel} • {incident.id}
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Reports List */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {reports.map((report, index) => {
              const canSplit = reports.length > 1;

              return (
                <View key={report.id} style={styles.reportItemCard}>
                  <View style={styles.reportItemHeader}>
                    <View style={styles.reporterInfoRow}>
                      <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>
                          {report.reporterName.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reporterName}>
                          {report.reporterName}
                          {report.studentId ? ` (${report.studentId})` : ''}
                        </Text>
                        <Text style={styles.reportTime}>
                          {formatDateTime(report.timestamp)} • ID: {report.id}
                        </Text>
                      </View>
                    </View>

                    {canSplit && (
                      <Pressable
                        onPress={() => onSplitReport(incident.id, report.id)}
                        style={({ pressed }) => [
                          styles.splitButton,
                          { opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        <Ionicons name="git-branch-outline" size={14} color={colors.primary} />
                        <Text style={styles.splitButtonText}>Split report</Text>
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.reportDetailsBox}>
                    <Text style={styles.detailLocation}>
                      📍 {formatLocation(report.location)}
                    </Text>
                    <Text style={styles.detailDesc}>{report.description}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <Text style={styles.footerNote}>
              Each report maintains original metadata. Splitting creates an independent incident.
            </Text>
            <Pressable onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  reportItemCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: 8,
  },
  reporterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  reporterName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  reportTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  splitButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  reportDetailsBox: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 4,
  },
  detailLocation: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  detailDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  modalFooter: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  footerNote: {
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
    minWidth: 200,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  doneButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
