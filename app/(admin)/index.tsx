import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
  AdminShell,
} from '@/components/layout/AdminShell';

import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadows,
} from '@/constants/theme';

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const desktop = width >= 900;

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Overview of campus safety activity"
      active="Dashboard"
    >
      <View style={styles.statsRow}>
        <StatCard
          title="Active Incidents"
          value="4"
          subtitle="2 require attention"
          icon="warning-outline"
          color={colors.danger}
          light={colors.dangerLight}
        />

        <StatCard
          title="Acknowledged"
          value="7"
          subtitle="Awaiting response"
          icon="checkmark-circle-outline"
          color={colors.primary}
          light={colors.primaryLight}
        />

        <StatCard
          title="Resolved Today"
          value="12"
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
      </View>

      <View
        style={[
          styles.contentGrid,
          !desktop && styles.contentGridMobile,
        ]}
      >
        <View style={styles.mainColumn}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Recent Incidents
              </Text>

              <Text style={styles.sectionSubtitle}>
                Latest emergency reports
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push(
                  '/(admin)/incidents'
                )
              }
            >
              <Text style={styles.viewAll}>
                View All
              </Text>
            </Pressable>
          </View>

          <IncidentRow
            type="Medical Emergency"
            location="Science Building • Room 204"
            time="2 min ago"
            status="NEW"
            statusColor={colors.danger}
            icon="medkit-outline"
          />

          <IncidentRow
            type="Security Threat"
            location="Main Gate • Entrance"
            time="18 min ago"
            status="ACKNOWLEDGED"
            statusColor={colors.primary}
            icon="shield-outline"
          />

          <IncidentRow
            type="Accident"
            location="Engineering Building • Hallway"
            time="42 min ago"
            status="RESPONDING"
            statusColor={colors.warning}
            icon="alert-circle-outline"
          />

          <IncidentRow
            type="Safety Hazard"
            location="Library • Second Floor"
            time="1 hr ago"
            status="RESOLVED"
            statusColor={colors.success}
            icon="construct-outline"
          />
        </View>

        <View style={styles.sideColumn}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Quick Actions
              </Text>

              <Text style={styles.sectionSubtitle}>
                Common administrative tasks
              </Text>
            </View>
          </View>

          <QuickAction
            title="Manage Incidents"
            description="Review and assign emergency reports"
            icon="warning-outline"
            color={colors.danger}
            light={colors.dangerLight}
            onPress={() =>
              router.push(
                '/(admin)/incidents'
              )
            }
          />

          <QuickAction
            title="Lost & Found"
            description="Manage reported campus items"
            icon="cube-outline"
            color={colors.warning}
            light={colors.warningLight}
            onPress={() =>
              router.push(
                '/(admin)/lost-found'
              )
            }
          />

          <QuickAction
            title="Campus Locations"
            description="Manage buildings and areas"
            icon="location-outline"
            color={colors.primary}
            light={colors.primaryLight}
          />

          <QuickAction
            title="User Management"
            description="View students and staff"
            icon="people-outline"
            color={colors.success}
            light={colors.successLight}
          />
        </View>
      </View>

      <View style={styles.safetyCard}>
        <View style={styles.safetyIcon}>
          <Ionicons
            name="shield-checkmark"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.safetyText}>
          <Text style={styles.safetyTitle}>
            Campus Safety Status
          </Text>

          <Text style={styles.safetyDescription}>
            All campus response services are
            operational.
          </Text>
        </View>

        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>
            SYSTEM ONLINE
          </Text>
        </View>
      </View>
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
      <View
        style={[
          styles.statIcon,
          { backgroundColor: light },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={color}
        />
      </View>

      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text
        style={[
          styles.statSubtitle,
          { color },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function IncidentRow({
  type,
  location,
  time,
  status,
  statusColor,
  icon,
}: {
  type: string;
  location: string;
  time: string;
  status: string;
  statusColor: string;
  icon: string;
}) {
  return (
    <View style={styles.incidentRow}>
      <View
        style={[
          styles.incidentIcon,
          {
            backgroundColor:
              statusColor + '14',
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={statusColor}
        />
      </View>

      <View style={styles.incidentInfo}>
        <Text style={styles.incidentTitle}>
          {type}
        </Text>

        <Text style={styles.incidentLocation}>
          {location}
        </Text>
      </View>

      <View style={styles.incidentRight}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColor + '12',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColor },
            ]}
          >
            {status}
          </Text>
        </View>

        <Text style={styles.incidentTime}>
          {time}
        </Text>
      </View>
    </View>
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
        {
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.quickIcon,
          {
            backgroundColor: light,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={color}
        />
      </View>

      <View style={styles.quickInfo}>
        <Text style={styles.quickTitle}>
          {title}
        </Text>

        <Text style={styles.quickDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
      />
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
    minWidth: 180,
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
    flex: 1.5,
  },

  sideColumn: {
    flex: 1,
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
  },

  viewAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  incidentRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    minHeight: 76,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  incidentIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  incidentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  incidentTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  incidentLocation: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 3,
  },

  incidentRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },

  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  statusText: {
    fontSize: 9,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 0.4,
  },

  incidentTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 5,
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

  safetyCard: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  safetyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  safetyText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  safetyTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  safetyDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 3,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: fontWeight.extrabold,
  },
});