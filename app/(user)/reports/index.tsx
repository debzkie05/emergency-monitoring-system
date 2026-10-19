import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Header } from '@/components/layout/Header';
import { IncidentCard } from '@/components/common/IncidentCard';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useIncidentsLoading } from '@/hooks/useIncidentsLoading';
import { LoadingGate } from '@/components/common/LoadingGate';
import { IncidentCardSkeleton } from '@/components/common/Skeletons';

export default function MyReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const incidents = useIncidentStore((s) => s.getIncidentsByReporter(user?.id || ''));
  const loading = useIncidentsLoading();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="My Reports" subtitle="History of your emergency reports" />
      
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
          <Text style={styles.emptyText}>You haven't submitted any reports.</Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => router.push({ pathname: '/(user)/reports/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
