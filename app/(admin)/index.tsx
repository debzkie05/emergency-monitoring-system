import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminShell } from '@/components/layout/AdminShell';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadows,
} from '@/constants/theme';
import { useIncidentStore } from '@/stores/incidentStore';
import { sortIncidentsForQueue, getTopCriticalIncident } from '@/utils/ordering';
import { getIncidentSeverity } from '@/utils/severity';
import { audioController } from '@/utils/audioController';
import { evaluateIncidentEscalation, DEV_ESCALATION_MS } from '@/utils/escalation';
import type { Incident, Severity } from '@/types';

import { AlertBanner } from '@/components/admin/AlertBanner';
import { LiveIncidentRow } from '@/components/admin/LiveIncidentRow';
import { AlertQueuePanel } from '@/components/admin/AlertQueuePanel';
import { useIncidentsLoading } from '@/hooks/useIncidentsLoading';
import { LoadingGate } from '@/components/common/LoadingGate';
import { StatCardSkeleton, LiveRowSkeleton } from '@/components/common/Skeletons';

// Heavy pieces are loaded only when they are needed, which keeps the first screen light.
const GroupedReportsModal = lazy(() =>
  import('@/components/admin/GroupedReportsModal').then((m) => ({ default: m.GroupedReportsModal }))
);
const EmergencyActionModal = lazy(() =>
  import('@/components/admin/EmergencyActionModal').then((m) => ({ default: m.EmergencyActionModal }))
);
const SimulateAlertsControl = lazy(() =>
  import('@/components/admin/SimulateAlertsControl').then((m) => ({ default: m.SimulateAlertsControl }))
);

type FilterType = 'All' | 'Critical' | 'High' | 'Moderate';

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  const listRef = useRef<View>(null);
  const loading = useIncidentsLoading();
  const groupModalOpened = useRef(false);
  const actionModalOpened = useRef(false);

  // Store bindings
  const incidents = useIncidentStore((s) => s.incidents);
  const audioState = useIncidentStore((s) => s.audioState);
  const setAudioState = useIncidentStore((s) => s.setAudioState);
  const volume = useIncidentStore((s) => s.volume);
  const setVolume = useIncidentStore((s) => s.setVolume);
  const isMuted = useIncidentStore((s) => s.isMuted);
  const muteRemainingSeconds = useIncidentStore((s) => s.muteRemainingSeconds);
  const setMuted = useIncidentStore((s) => s.setMuted);
  const decrementMuteSeconds = useIncidentStore((s) => s.decrementMuteSeconds);
  const activeSirenIncidentId = useIncidentStore((s) => s.activeSirenIncidentId);
  const setActiveSirenIncidentId = useIncidentStore((s) => s.setActiveSirenIncidentId);
  const acknowledgeIncident = useIncidentStore((s) => s.acknowledgeIncident);
  const assignResponder = useIncidentStore((s) => s.assignResponder);
  const recordEscalation = useIncidentStore((s) => s.recordEscalation);
  const splitReport = useIncidentStore((s) => s.splitReport);

  // Local state
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [selectedGroupIncident, setSelectedGroupIncident] = useState<Incident | null>(null);
  const [actionModalIncident, setActionModalIncident] = useState<Incident | null>(null);

  // Live timer tick for waiting times, mute countdown, and escalation check
  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      decrementMuteSeconds();

      // Check for escalation eligibility on critical incidents
      const activeIncidents = incidents.filter(
        (i) => i.status !== 'resolved' && i.status !== 'cancelled'
      );
      activeIncidents.forEach((inc) => {
        const result = evaluateIncidentEscalation(inc, DEV_ESCALATION_MS, current);
        if (result.shouldEscalate && result.record) {
          recordEscalation(inc.id, result.record);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incidents, decrementMuteSeconds, recordEscalation]);

  // Sync mute and volume with audioController
  useEffect(() => {
    audioController.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    audioController.setVolume(volume);
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioController.stopAll();
    };
  }, []);

  // Sorted active queue according to single pure ordering function
  const activeIncidents = useMemo(() => {
    return incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled');
  }, [incidents]);

  const sortedQueue = useMemo(() => {
    return sortIncidentsForQueue(activeIncidents);
  }, [activeIncidents]);

  // Critical alerts awaiting acknowledgment
  const criticalAwaiting = useMemo(() => {
    return sortedQueue.filter(
      (i) => getIncidentSeverity(i) === 'Critical' && i.status === 'reported'
    );
  }, [sortedQueue]);

  // Resolved count today
  const resolvedTodayCount = useMemo(() => {
    return incidents.filter((i) => i.status === 'resolved').length;
  }, [incidents]);

  // Acknowledged count
  const acknowledgedCount = useMemo(() => {
    return incidents.filter((i) => i.status === 'acknowledged').length;
  }, [incidents]);

  // Top critical incident eligible for siren
  const topCritical = useMemo(() => {
    return getTopCriticalIncident(activeIncidents);
  }, [activeIncidents]);

  // Audio controller coordinator
  useEffect(() => {
    if (audioState !== 'active' || isMuted) {
      if (activeSirenIncidentId !== null) {
        audioController.stopAll();
        setActiveSirenIncidentId(null);
      }
      return;
    }

    if (topCritical) {
      // Play siren for top critical
      if (activeSirenIncidentId !== topCritical.id) {
        setActiveSirenIncidentId(topCritical.id);
        audioController.playCriticalSiren(topCritical.id);
      }
    } else {
      // No critical alerts waiting: stop siren
      if (activeSirenIncidentId !== null) {
        audioController.stopAll();
        setActiveSirenIncidentId(null);
      }

      // Check if any High or Moderate incident is waiting and eligible to chime once
      const topOther = sortedQueue.find(
        (i) => i.status === 'reported' && !audioController.hasPlayedOnce(i.id)
      );

      if (topOther) {
        const sev = getIncidentSeverity(topOther);
        if (sev === 'High') {
          audioController.playHighBeeps(topOther.id);
        } else if (sev === 'Moderate') {
          audioController.playModerateChime(topOther.id);
        }
      }
    }
  }, [topCritical, audioState, isMuted, activeSirenIncidentId, sortedQueue, setActiveSirenIncidentId]);

  // Filtered live incidents list
  const filteredLiveIncidents = useMemo(() => {
    if (selectedFilter === 'All') return sortedQueue;
    return sortedQueue.filter((i) => getIncidentSeverity(i) === selectedFilter);
  }, [sortedQueue, selectedFilter]);

  // Counts for filter pills
  const criticalCount = useMemo(
    () => sortedQueue.filter((i) => getIncidentSeverity(i) === 'Critical').length,
    [sortedQueue]
  );
  const highCount = useMemo(
    () => sortedQueue.filter((i) => getIncidentSeverity(i) === 'High').length,
    [sortedQueue]
  );
  const moderateCount = useMemo(
    () => sortedQueue.filter((i) => getIncidentSeverity(i) === 'Moderate').length,
    [sortedQueue]
  );

  // Handlers
  const handleAcknowledge = (id: string) => {
    acknowledgeIncident(id, 'ADM-001', 'Administrator');
    const target = incidents.find((i) => i.id === id);
    if (target) {
      setActionModalIncident({ ...target, status: 'acknowledged' });
    }
  };

  const currentActionModalIncident = useMemo(() => {
    if (!actionModalIncident) return null;
    return incidents.find((i) => i.id === actionModalIncident.id) || actionModalIncident;
  }, [actionModalIncident, incidents]);

  const handleAssignResponder = (id: string) => {
    // Quick assign modal / prompt
    Alert.alert(
      'Assign Responder',
      'Select a responder for this emergency:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Security Patrol (RSP-001)',
          onPress: () => assignResponder(id, 'RSP-001', 'Security Patrol', 'ADM-001', 'Administrator'),
        },
        {
          text: 'Campus Clinic (RSP-002)',
          onPress: () => assignResponder(id, 'RSP-002', 'Campus Medical Clinic', 'ADM-001', 'Administrator'),
        },
        {
          text: 'Facilities / Maintenance (RSP-003)',
          onPress: () => assignResponder(id, 'RSP-003', 'Maintenance Team', 'ADM-001', 'Administrator'),
        },
      ]
    );
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setMuted(false);
    } else {
      setMuted(true, 60);
    }
  };

  const handleTestSound = () => {
    audioController.playTestSound();
  };

  const handleSplitReport = (incidentId: string, reportId: string) => {
    const newId = splitReport(incidentId, reportId, 'ADM-001', 'Administrator');
    if (newId) {
      setSelectedGroupIncident(null);
      Alert.alert(
        'Report Split Successful',
        `A new incident record (${newId}) has been created with the split report.`
      );
    }
  };

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Overview of campus safety activity"
      active="Dashboard"
    >
      {/* Dev Simulation Tools */}
      {__DEV__ && (
        <Suspense fallback={null}>
          <SimulateAlertsControl />
        </Suspense>
      )}

      {/* Top Urgent Alert Banner */}
      <AlertBanner
        criticalIncidents={criticalAwaiting}
        onOpenList={() => {
          setSelectedFilter('All');
        }}
        onAcknowledgeOldest={handleAcknowledge}
        nowMs={nowMs}
      />

      {/* Metric Stat Cards Row */}
      <View style={styles.statsRow}>
        <LoadingGate
          loading={loading}
          containerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}
          fallback={<>{[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}</>}
        >
        <StatCard
          title="Active Incidents"
          value={String(activeIncidents.length)}
          subtitle={`${criticalAwaiting.length} critical waiting`}
          icon="warning-outline"
          color={colors.danger}
          light={colors.dangerLight}
        />

        <StatCard
          title="Acknowledged"
          value={String(acknowledgedCount)}
          subtitle="Awaiting response"
          icon="checkmark-circle-outline"
          color={colors.primary}
          light={colors.primaryLight}
        />

        <StatCard
          title="Resolved Today"
          value={String(resolvedTodayCount)}
          subtitle="+8% from yesterday"
          icon="shield-checkmark-outline"
          color={colors.success}
          light={colors.successLight}
        />

        <StatCard
          title="Lost & Found"
          value="18"
          subtitle="5 new items"
          icon="cube-outline"
          color={colors.warning}
          light={colors.warningLight}
        />
        </LoadingGate>
      </View>

      {/* Main Dashboard Grid */}
      <View style={[styles.contentGrid, !desktop && styles.contentGridMobile]}>
        {/* Left / Main Column: Live Incidents */}
        <View style={styles.mainColumn} ref={listRef}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Live incidents</Text>
              <Text style={styles.sectionSubtitle}>
                Sorted by severity, then longest waiting. Every incident can be acknowledged and assigned at any time.
              </Text>
            </View>
          </View>

          {/* Filter Bar with Sort indicator */}
          <View style={styles.filterBarRow}>
            <View style={styles.filterChips}>
              <FilterChip
                label={`All (${sortedQueue.length})`}
                active={selectedFilter === 'All'}
                onPress={() => setSelectedFilter('All')}
              />
              <FilterChip
                label={`Critical (${criticalCount})`}
                active={selectedFilter === 'Critical'}
                onPress={() => setSelectedFilter('Critical')}
              />
              <FilterChip
                label={`High (${highCount})`}
                active={selectedFilter === 'High'}
                onPress={() => setSelectedFilter('High')}
              />
              <FilterChip
                label={`Moderate (${moderateCount})`}
                active={selectedFilter === 'Moderate'}
                onPress={() => setSelectedFilter('Moderate')}
              />
            </View>

            <View style={styles.sortIndicator}>
              <Text style={styles.sortText}>Sort: Priority</Text>
            </View>
          </View>

          {/* Incident Cards List */}
          <LoadingGate
            loading={loading}
            fallback={<>{[0, 1, 2].map((i) => <LiveRowSkeleton key={i} />)}</>}
          >
          {filteredLiveIncidents.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No incidents match this filter.</Text>
            </View>
          ) : (
            filteredLiveIncidents.map((incident, idx) => {
              const isSounding =
                audioState === 'active' &&
                !isMuted &&
                topCritical?.id === incident.id;

              return (
                <LiveIncidentRow
                  key={incident.id}
                  incident={incident}
                  nowMs={nowMs}
                  isSirenPlaying={isSounding}
                  audioState={audioState}
                  isMuted={isMuted}
                  muteSecondsRemaining={muteRemainingSeconds}
                  queuePosition={idx}
                  hasCriticalsWaiting={criticalAwaiting.length > 0}
                  onAcknowledge={handleAcknowledge}
                  onAssign={handleAssignResponder}
                  onOpenGroup={(inc) => setSelectedGroupIncident(inc)}
                />
              );
            })
          )}
          </LoadingGate>
        </View>

        {/* Right Side Column: Alert Queue & Quick Actions */}
        <View style={styles.sideColumn}>
          {/* Alert Queue Panel */}
          <AlertQueuePanel
            queueIncidents={sortedQueue}
            nowMs={nowMs}
            isMuted={isMuted}
            muteSecondsRemaining={muteRemainingSeconds}
            volume={volume}
            audioState={audioState}
            activeSirenId={activeSirenIncidentId}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={(vol) => setVolume(vol)}
            onTestSound={handleTestSound}
          />

          {/* Quick Actions Panel */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Common administrative tasks</Text>
            </View>
          </View>

          <QuickAction
            title="Manage Incidents"
            description="Review and assign emergency reports"
            icon="warning-outline"
            color={colors.danger}
            light={colors.dangerLight}
            onPress={() => router.push('/(admin)/incidents')}
          />

          <QuickAction
            title="Lost & Found"
            description="Manage reported campus items"
            icon="cube-outline"
            color={colors.warning}
            light={colors.warningLight}
            onPress={() => router.push('/(admin)/lost-found')}
          />

          <QuickAction
            title="Campus Locations"
            description="Manage buildings and areas"
            icon="location-outline"
            color={colors.primary}
            light={colors.primaryLight}
            onPress={() => router.push('/(admin)/locations')}
          />
        </View>
      </View>

      {/* Grouped Reports Modal */}
      {selectedGroupIncident !== null && (groupModalOpened.current = true)}
      {groupModalOpened.current && (
        <Suspense fallback={null}>
          <GroupedReportsModal
            visible={selectedGroupIncident !== null}
            incident={selectedGroupIncident}
            onClose={() => setSelectedGroupIncident(null)}
            onSplitReport={handleSplitReport}
          />
        </Suspense>
      )}

      {/* Emergency Action & SOP Resolution Modal */}
      {actionModalIncident !== null && (actionModalOpened.current = true)}
      {actionModalOpened.current && (
        <Suspense fallback={null}>
          <EmergencyActionModal
            visible={actionModalIncident !== null}
            incident={currentActionModalIncident}
            onClose={() => setActionModalIncident(null)}
          />
        </Suspense>
      )}
    </AdminShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  light,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  light: string;
}) {
  return (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: light }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statSubtitle, { color }]}>{subtitle}</Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function QuickAction({
  title,
  description,
  icon,
  color,
  light,
  onPress,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  light: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: light }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.quickInfo}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDescription}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  statValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: fontWeight.extrabold,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 3,
  },
  contentGrid: {
    flexDirection: 'row',
    gap: spacing.xxl,
  },
  contentGridMobile: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 1.8,
  },
  sideColumn: {
    flex: 1.1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 3,
    lineHeight: 18,
  },
  filterBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textWhite,
    fontWeight: fontWeight.bold,
  },
  sortIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  emptyList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyListText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  quickAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  quickTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  quickDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 3,
  },
});