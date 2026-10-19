import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import { AdminShell } from '@/components/layout/AdminShell';
import { IncidentCard } from '@/components/common/IncidentCard';
import { useIncidentStore } from '@/stores/incidentStore';
import { useIncidentsLoading } from '@/hooks/useIncidentsLoading';
import { LoadingGate } from '@/components/common/LoadingGate';
import { IncidentCardSkeleton } from '@/components/common/Skeletons';

type FilterKey = 'all' | 'new' | 'active' | 'resolved';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
];

export default function IncidentListScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const getByStatus = useIncidentStore((s) => s.getIncidentsByStatus);

  const incidents = getByStatus(activeFilter);
  const loading = useIncidentsLoading();

  return (
    <AdminShell
      title="Incidents"
      subtitle="Manage campus emergency reports"
      active="Incidents"
    >
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <LoadingGate
          loading={loading}
          fallback={
            <View style={styles.listContent}>
              {[0, 1, 2, 3].map((i) => <IncidentCardSkeleton key={i} />)}
            </View>
          }
        >
          {null}
        </LoadingGate>
      ) : incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No incidents match this filter.</Text>
        </View>
      ) : (
        <View style={styles.listContent}>
          {incidents.map((item) => (
            <IncidentCard
              key={item.id}
              incident={item}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/incidents/[id]',
                  params: { id: item.id },
                })
              }
              showReporter
            />
          ))}
        </View>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textWhite,
  },
  listContent: {
    gap: spacing.md,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
