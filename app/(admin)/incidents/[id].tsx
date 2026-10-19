import React, { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import { AdminShell } from '@/components/layout/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/common/StatusTimeline';
import { useIncidentStore } from '@/stores/incidentStore';
import { MOCK_RESPONDERS } from '@/data/responders';
import {
  formatLocationFull,
  formatDateTime,
  getEmergencyColor,
} from '@/utils/helpers';
import { getProtocolForEmergency } from '@/utils/protocols';
import type { IncidentStatus } from '@/types';
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_ORDER } from '@/types';

export default function AdminIncidentDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = useIncidentStore((s) => s.getIncidentById(id || ''));
  const acknowledgeIncident = useIncidentStore((s) => s.acknowledgeIncident);
  const assignResponder = useIncidentStore((s) => s.assignResponder);
  const updateIncidentStatus = useIncidentStore((s) => s.updateIncidentStatus);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!incident) {
    return (
      <AdminShell title="Incident Details" active="Incidents">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>Incident not found.</Text>
          <Button
            label="Back to Incidents"
            onPress={() => router.push('/(admin)/incidents')}
            variant="primary"
          />
        </View>
      </AdminShell>
    );
  }

  const iconColor = getEmergencyColor(incident.type);
  const protocol = getProtocolForEmergency(incident.type);

  const handleAcknowledge = () => {
    Alert.alert(
      'Acknowledge Incident',
      `Acknowledge incident ${incident.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: () => acknowledgeIncident(incident.id),
        },
      ]
    );
  };

  const handleAssign = (responderId: string, responderName: string) => {
    assignResponder(incident.id, responderId, responderName);
    setShowAssignModal(false);
    Alert.alert('Responder Assigned', `${responderName} has been assigned to this incident.`);
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    updateIncidentStatus(incident.id, newStatus);
    setShowStatusModal(false);
  };

  // Determine which actions to show
  const canAcknowledge = incident.status === 'reported';
  const canAssign =
    incident.status === 'acknowledged' || incident.status === 'reported';
  const canChangeStatus = !['resolved', 'cancelled'].includes(incident.status);

  // Possible next statuses
  const currentIdx = INCIDENT_STATUS_ORDER.indexOf(incident.status);
  const nextStatuses = INCIDENT_STATUS_ORDER.filter(
    (_, i) => i > currentIdx
  );

  return (
    <AdminShell
      title={`Incident ${incident.id}`}
      subtitle={`${incident.typeLabel} • Reported ${formatDateTime(incident.createdAt)}`}
      active="Incidents"
    >
      <Pressable
        onPress={() => router.push('/(admin)/incidents')}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={styles.backButtonText}>Back to Incidents</Text>
      </Pressable>

      <View style={styles.content}>
        {/* Status Banner */}
        <Card style={[styles.card, styles.statusBanner]}>
          <View style={styles.statusRow}>
            <View style={[styles.typeIcon, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name="warning" size={24} color={iconColor} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.typeLabel}>{incident.typeLabel}</Text>
              <Text style={styles.dateText}>{formatDateTime(incident.createdAt)}</Text>
            </View>
            <StatusBadge status={incident.status} />
          </View>
        </Card>

        {/* Reporter Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Reporter</Text>
          <View style={styles.divider} />
          <View style={styles.reporterRow}>
            <View style={styles.reporterAvatar}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.reporterName}>{incident.reporterName}</Text>
              <Text style={styles.reporterId}>ID: {incident.reporterId}</Text>
            </View>
          </View>
        </Card>

        {/* Location & Description */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="location" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {formatLocationFull(incident.location)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{incident.description}</Text>
            </View>
          </View>

          {incident.photo && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="image" size={18} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Photo</Text>
                <SmartImage uri={incident.photo} style={styles.photo} accessibilityLabel="Photo attached to the report" />
              </View>
            </View>
          )}
        </Card>

        {/* Assigned Responder */}
        {incident.assignedToName && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Assigned Responder</Text>
            <View style={styles.divider} />
            <View style={styles.reporterRow}>
              <View style={[styles.reporterAvatar, { backgroundColor: colors.successLight }]}>
                <Ionicons name="shield" size={22} color={colors.success} />
              </View>
              <View>
                <Text style={styles.reporterName}>{incident.assignedToName}</Text>
                <Text style={styles.reporterId}>ID: {incident.assignedTo}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Resolution Protocol & Recommended Steps */}
        <Card style={styles.card}>
          <View style={styles.protocolHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.protocolTitleRow}>
                <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>{protocol.title}</Text>
              </View>
              <Text style={styles.protocolObjective}>{protocol.objective}</Text>
            </View>
            <View style={styles.priorityPill}>
              <Text style={styles.priorityPillText}>{protocol.priorityLevel}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <Text style={styles.checklistPrompt}>
            Required steps for administrator to resolve this issue:
          </Text>

          <View style={styles.stepList}>
            {protocol.steps.map((step, idx) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndexCircle}>
                  <Text style={styles.stepIndexText}>{idx + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {step.isUrgent && (
                      <View style={styles.urgentPill}>
                        <Text style={styles.urgentPillText}>URGENT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                  <View style={styles.deptBadge}>
                    <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.deptBadgeText}>{step.recommendedDepartment}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Status Timeline */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.divider} />
          <StatusTimeline
            statusHistory={incident.statusHistory}
            currentStatus={incident.status}
          />
        </Card>

        {/* Action Buttons */}
        {(canAcknowledge || canAssign || canChangeStatus) && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsGrid}>
              {canAcknowledge && (
                <Button
                  label="Acknowledge"
                  onPress={handleAcknowledge}
                  variant="primary"
                  size="lg"
                />
              )}
              {canAssign && (
                <Button
                  label="Assign Responder"
                  onPress={() => setShowAssignModal(true)}
                  variant="outline"
                  size="lg"
                />
              )}
              {canChangeStatus && (
                <Button
                  label="Change Status"
                  onPress={() => setShowStatusModal(true)}
                  variant="outline"
                  size="lg"
                />
              )}
            </View>
          </View>
        )}
      </View>

      {/* ── Assign Responder Modal ── */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Responder</Text>
              <Pressable onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {MOCK_RESPONDERS.map((resp) => (
                <Pressable
                  key={resp.id}
                  onPress={() => handleAssign(resp.id, resp.name)}
                  disabled={!resp.available}
                  style={({ pressed }) => [
                    styles.responderRow,
                    !resp.available && styles.responderUnavailable,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={styles.responderAvatar}>
                    <Ionicons
                      name={resp.role === 'Medical' ? 'medkit' : 'shield'}
                      size={20}
                      color={resp.available ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.responderInfo}>
                    <Text
                      style={[
                        styles.responderName,
                        !resp.available && styles.responderNameUnavailable,
                      ]}
                    >
                      {resp.name}
                    </Text>
                    <Text style={styles.responderRole}>{resp.role}</Text>
                  </View>
                  {resp.available ? (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  ) : (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Busy</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Change Status Modal ── */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Status</Text>
              <Pressable onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {nextStatuses.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => handleStatusChange(status)}
                  style={({ pressed }) => [
                    styles.statusOption,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <StatusBadge status={status} />
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
              ))}

              {/* Also allow cancellation */}
              <Pressable
                onPress={() => handleStatusChange('cancelled')}
                style={({ pressed }) => [
                  styles.statusOption,
                  styles.cancelOption,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <StatusBadge status="cancelled" />
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxWidth: 960,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  card: {
    padding: spacing.xl,
  },
  statusBanner: {
    // minor override
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  reporterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reporterName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  reporterId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    resizeMode: 'cover',
  },
  actionsSection: {
    gap: spacing.lg,
  },
  actionsGrid: {
    gap: spacing.sm,
  },

  /* ── Modals ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  modalScroll: {
    padding: spacing.xl,
  },

  /* ── Responder rows ── */
  responderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  responderUnavailable: {
    opacity: 0.5,
  },
  responderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  responderNameUnavailable: {
    color: colors.textSecondary,
  },
  responderRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  availableBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  availableText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  unavailableBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  unavailableText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },

  /* ── Status options ── */
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cancelOption: {
    marginTop: spacing.lg,
    borderBottomWidth: 0,
  },

  /* ── Protocol & Resolution Steps ── */
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  protocolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    borderRadius: radius.sm,
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
    marginBottom: spacing.md,
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
  stepIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
});
