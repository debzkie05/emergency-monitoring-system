import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import { useIncidentStore } from '@/stores/incidentStore';
import { useUiStore } from '@/stores/uiStore';

export function SimulateAlertsControl() {
  const simulateAlerts = useIncidentStore((s) => s.simulateAlerts);
  const clearDemoAlerts = useIncidentStore((s) => s.clearDemoAlerts);
  const demoModeVisible = useIncidentStore((s) => s.demoModeVisible);
  const setDemoModeVisible = useIncidentStore((s) => s.setDemoModeVisible);
  const incidents = useIncidentStore((s) => s.incidents);

  const previewLoading = useUiStore((s) => s.previewLoading);
  const demoCount = incidents.filter((i) => i.isDemo).length;

  // In production (__DEV__ === false), control can be hidden
  if (process.env.NODE_ENV === 'production' && !__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="flask-outline" size={16} color={colors.primary} />
          <Text style={styles.title}>DEV TOOLS: Simulate Alerts</Text>
          {demoCount > 0 && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>{demoCount} DEMO ALERTS ACTIVE</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => setDemoModeVisible(!demoModeVisible)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {demoModeVisible ? 'Hide Controls' : 'Show Controls'}
          </Text>
        </Pressable>
      </View>

      {demoModeVisible && (
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => previewLoading(2500)}
            style={({ pressed }) => [styles.simBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.simBtnText}>Preview loading skeletons (2.5s)</Text>
          </Pressable>

          <Pressable
            onPress={() => simulateAlerts(1)}
            style={({ pressed }) => [styles.simBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.simBtnText}>+1 Critical Alert</Text>
          </Pressable>

          <Pressable
            onPress={() => simulateAlerts(10)}
            style={({ pressed }) => [styles.simBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.simBtnText}>+10 Burst Alerts</Text>
          </Pressable>

          <Pressable
            onPress={() => simulateAlerts(1, { grouped: true, type: 'medical' })}
            style={({ pressed }) => [styles.simBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.simBtnText}>+1 Grouped Alert (3 reports)</Text>
          </Pressable>

          {demoCount > 0 && (
            <Pressable
              onPress={clearDemoAlerts}
              style={({ pressed }) => [
                styles.clearBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="trash-outline" size={13} color={colors.danger} />
              <Text style={styles.clearBtnText}>Clear Demo Alerts</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  demoBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  demoBadgeText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: fontWeight.extrabold,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  simBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  simBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  clearBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.danger,
  },
});
