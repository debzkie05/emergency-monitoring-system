import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';

const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.borderLight,
  padding: spacing.lg,
  marginBottom: spacing.lg,
} as const;

export function IncidentCardSkeleton() {
  return (
    <View style={[card, styles.row]}>
      <Skeleton width={44} height={44} radius={radius.md} />
      <View style={styles.flex}>
        <Skeleton width="55%" height={16} />
        <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={72} height={22} radius={radius.full} />
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={[card, styles.stat]}>
      <Skeleton width={44} height={44} radius={radius.md} />
      <Skeleton width="60%" height={14} style={{ marginTop: 14 }} />
      <Skeleton width="35%" height={30} style={{ marginTop: 10 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 10 }} />
    </View>
  );
}

export function LiveRowSkeleton() {
  return (
    <View style={[card, styles.row]}>
      <Skeleton width={52} height={52} radius={radius.md} />
      <View style={styles.flex}>
        <Skeleton width="45%" height={18} />
        <Skeleton width="70%" height={13} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={70} height={34} />
      <View style={{ gap: 8 }}>
        <Skeleton width={120} height={36} radius={10} />
        <Skeleton width={120} height={36} radius={10} />
      </View>
    </View>
  );
}

export function LostItemSkeleton() {
  return (
    <View style={[card, styles.row]}>
      <Skeleton width={72} height={72} radius={radius.md} />
      <View style={styles.flex}>
        <Skeleton width="50%" height={16} />
        <Skeleton width="30%" height={12} style={{ marginTop: 8 }} />
        <Skeleton width="75%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  flex: { flex: 1 },
  stat: { flex: 1, minWidth: 180, marginBottom: 0 },
});
