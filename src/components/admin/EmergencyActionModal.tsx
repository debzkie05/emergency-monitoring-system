import React, { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import type { Incident, IncidentStatus } from '@/types';
import { getIncidentSeverity, SEVERITY_CONFIG } from '@/utils/severity';
import { formatLocationFull, formatDateTime } from '@/utils/helpers';
import { formatWaitingTime } from '@/utils/ordering';
import { getProtocolForEmergency } from '@/utils/protocols';
import { useIncidentStore } from '@/stores/incidentStore';

interface EmergencyActionModalProps {
  visible: boolean;
  incident: Incident | null;
  onClose: () => void;
}

const AVAILABLE_RESPONDERS = [
  { id: 'RSP-001', name: 'Security Patrol', role: 'Security' },
  { id: 'RSP-002', name: 'Campus Medical Clinic', role: 'Medical' },
  { id: 'RSP-003', name: 'Maintenance Team', role: 'Facilities' },
];

export function EmergencyActionModal({
  visible,
  incident,
  onClose,
}: EmergencyActionModalProps) {
  const router = useRouter();
  const assignResponder = useIncidentStore((s) => s.assignResponder);
  const updateIncidentStatus = useIncidentStore((s) => s.updateIncidentStatus);

  // Completed checklist step IDs
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  if (!incident) return null;

  const severity = getIncidentSeverity(incident);
  const severityColor = SEVERITY_CONFIG[severity]?.color || colors.danger;
  const protocol = getProtocolForEmergency(incident.type);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleAssign = (responderId: string, responderName: string) => {
    assignResponder(incident.id, responderId, responderName, 'ADM-001', 'Administrator');
  };

  const handleStatusChange = (status: IncidentStatus) => {
    updateIncidentStatus(incident.id, status, 'Administrator update');
  };

  const handleOpenFullPage = () => {
    onClose();
    router.push({
      pathname: '/(admin)/incidents/[id]',
      params: { id: incident.id },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.severityBadge, { backgroundColor: severityColor + '20', borderColor: severityColor }]}>
                <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {severity.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.incidentId}>{incident.id}</Text>

              <View style={styles.statusPill}>
                <Ionicons name="checkmark-circle" size={15} color={colors.success} />
                <Text style={styles.statusPillText}>ACKNOWLEDGED</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close emergency details"
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Alert Banner / Title */}
            <View style={styles.emergencyTitleBanner}>
              <View style={styles.emergencyIconWrap}>
                <Ionicons
                  name={
                    incident.type === 'fire'
                      ? 'flame'
                      : incident.type === 'medical'
                      ? 'medkit'
                      : incident.type === 'security'
                      ? 'shield'
                      : incident.type === 'hazard'
                      ? 'warning'
                      : 'alert-circle'
                  }
                  size={26}
                  color={colors.textWhite}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyTitle}>{incident.typeLabel}</Text>
                <Text style={styles.emergencySubtitle}>
                  Reported {formatDateTime(incident.createdAt)} • Waited {formatWaitingTime(incident)} before ack
                </Text>
              </View>
            </View>

            {/* Emergency Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>LOCATION</Text>
                <Text style={styles.detailValue}>
                  {formatLocationFull(incident.location)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>REPORTER</Text>
                <Text style={styles.detailValue}>
                  {incident.reporterName || 'Anonymous Student'}
                </Text>
                {incident.reporterId ? (
                  <Text style={styles.detailSub}>ID: {incident.reporterId}</Text>
                ) : null}
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>CURRENT RESPONDER</Text>
                <Text style={[styles.detailValue, !incident.assignedToName && { color: colors.warning }]}>
                  {incident.assignedToName ? incident.assignedToName : 'No responder assigned yet'}
                </Text>
                {incident.assignedToName ? (
                  <Text style={styles.detailSub}>ID: {incident.assignedTo}</Text>
                ) : null}
              </View>
            </View>

            {/* Description Callout */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>SITUATION DESCRIPTION</Text>
              <Text style={styles.descriptionText}>
                {incident.description || 'No additional description provided.'}
              </Text>
              {incident.photo && (
                <View style={styles.photoWrap}>
                  <SmartImage uri={incident.photo} style={styles.photo} accessibilityLabel="Photo attached to the report" />
                </View>
              )}
            </View>

            {/* Required Steps to Resolve (SOP) */}
            <View style={styles.protocolCard}>
              <View style={styles.protocolHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.protocolTitleRow}>
                    <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
                    <Text style={styles.protocolTitle}>{protocol.title}</Text>
                  </View>
                  <Text style={styles.protocolObjective}>{protocol.objective}</Text>
                </View>
                <View style={styles.priorityPill}>
                  <Text style={styles.priorityPillText}>{protocol.priorityLevel}</Text>
                </View>
              </View>

              <Text style={styles.checklistPrompt}>
                Required steps for administrator to resolve this issue:
              </Text>

              <View style={styles.stepList}>
                {protocol.steps.map((step, index) => {
                  const isChecked = !!completedSteps[step.id];
                  return (
                    <Pressable
                      key={step.id}
                      onPress={() => toggleStep(step.id)}
                      style={[
                        styles.stepRow,
                        isChecked && styles.stepRowChecked,
                      ]}
                    >
                      <View style={[styles.stepCheckbox, isChecked && styles.stepCheckboxChecked]}>
                        {isChecked ? (
                          <Ionicons name="checkmark" size={14} color={colors.textWhite} />
                        ) : (
                          <Text style={styles.stepIndexText}>{index + 1}</Text>
                        )}
                      </View>

                      <View style={styles.stepContent}>
                        <View style={styles.stepTitleRow}>
                          <Text style={[styles.stepTitle, isChecked && styles.stepTitleChecked]}>
                            {step.title}
                          </Text>
                          {step.isUrgent && !isChecked && (
                            <View style={styles.urgentPill}>
                              <Text style={styles.urgentPillText}>URGENT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.stepDesc, isChecked && styles.stepDescChecked]}>
                          {step.description}
                        </Text>
                        <View style={styles.deptBadge}>
                          <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
                          <Text style={styles.deptBadgeText}>{step.recommendedDepartment}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Responder Quick Assignment */}
            <View style={styles.responderSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people-outline" size={18} color={colors.text} />
                <Text style={styles.sectionTitle}>Assign Immediate Responder</Text>
              </View>

              <View style={styles.responderButtonGrid}>
                {AVAILABLE_RESPONDERS.map((resp) => {
                  const isAssigned = incident.assignedTo === resp.id;
                  return (
                    <Pressable
                      key={resp.id}
                      onPress={() => handleAssign(resp.id, resp.name)}
                      style={[
                        styles.responderChoice,
                        isAssigned && styles.responderChoiceActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          resp.role === 'Medical'
                            ? 'medkit'
                            : resp.role === 'Security'
                            ? 'shield'
                            : 'construct'
                        }
                        size={18}
                        color={isAssigned ? colors.textWhite : colors.primary}
                      />
                      <Text
                        style={[
                          styles.responderChoiceText,
                          isAssigned && styles.responderChoiceTextActive,
                        ]}
                      >
                        {resp.name}
                      </Text>
                      {isAssigned && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.textWhite} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Incident Progression Controls */}
            <View style={styles.progressionSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="git-branch-outline" size={18} color={colors.text} />
                <Text style={styles.sectionTitle}>Advance Resolution Status</Text>
              </View>

              <View style={styles.statusButtonsRow}>
                <Pressable
                  onPress={() => handleStatusChange('responding')}
                  style={[
                    styles.statusActionBtn,
                    incident.status === 'responding' && styles.statusActionBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusActionBtnText,
                      incident.status === 'responding' && styles.statusActionBtnTextActive,
                    ]}
                  >
                    Mark Responding
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleStatusChange('on_site')}
                  style={[
                    styles.statusActionBtn,
                    incident.status === 'on_site' && styles.statusActionBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusActionBtnText,
                      incident.status === 'on_site' && styles.statusActionBtnTextActive,
                    ]}
                  >
                    Mark On-Site
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleStatusChange('resolved')}
                  style={[
                    styles.statusActionBtn,
                    styles.statusActionResolveBtn,
                    incident.status === 'resolved' && styles.statusActionBtnActive,
                  ]}
                >
                  <Text style={styles.statusActionResolveBtnText}>
                    Mark Resolved
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Footer Bar */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleOpenFullPage}
              style={styles.fullPageButton}
            >
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text style={styles.fullPageButtonText}>Open Full Incident File</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done & Return to Dashboard</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  incidentId: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scrollArea: {
    padding: spacing.xl,
  },
  emergencyTitleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  emergencyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textWhite,
  },
  emergencySubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  detailItem: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  detailSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  descriptionCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  descriptionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  photoWrap: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  protocolCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    marginBottom: spacing.xl,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  protocolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  protocolTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  protocolObjective: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priorityPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  checklistPrompt: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepList: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepRowChecked: {
    backgroundColor: colors.successLight + '30',
    borderColor: colors.success + '40',
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  stepCheckboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepIndexText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  stepTitleChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  urgentPill: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  urgentPillText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.danger,
  },
  stepDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  stepDescChecked: {
    color: colors.textMuted,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  deptBadgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  responderSection: {
    marginBottom: spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  responderButtonGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  responderChoice: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  responderChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  responderChoiceText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  responderChoiceTextActive: {
    color: colors.textWhite,
  },
  progressionSection: {
    marginBottom: spacing.xl,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusActionBtn: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusActionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusActionBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  statusActionBtnTextActive: {
    color: colors.textWhite,
  },
  statusActionResolveBtn: {
    borderColor: colors.success,
  },
  statusActionResolveBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  fullPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fullPageButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  doneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  doneButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textWhite,
  },
});
