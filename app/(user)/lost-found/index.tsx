import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '@/constants/theme';
import { useLostFoundStore, LostFoundStatus } from '@/stores/lostFoundStore';
import { useAuthStore } from '@/stores/authStore';
import { useResponsive } from '@/hooks/useResponsive';

type Filter = 'ALL' | LostFoundStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LOST', label: 'Lost' },
  { value: 'FOUND', label: 'Found' },
];

const STATUS_STYLE: Record<LostFoundStatus, { fg: string; bg: string }> = {
  LOST: { fg: colors.danger, bg: colors.dangerLight },
  FOUND: { fg: colors.success, bg: colors.successLight },
  CLAIMED: { fg: colors.textSecondary, bg: colors.surfaceAlt },
};

export default function LostFoundScreen() {
  const router = useRouter();
  const { submitted } = useLocalSearchParams<{ submitted?: string }>();
  const items = useLostFoundStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const { columns } = useResponsive();
  const [filter, setFilter] = useState<Filter>('ALL');

  const visible = items.filter((i) => filter === 'ALL' || i.status === filter);

  return (
    <View style={styles.screen}>
      <Header title="Lost & Found" subtitle="Report a lost item or look for yours" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {submitted === '1' && (
          <View style={styles.banner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.bannerText}>Your lost item was reported. The office can now see it.</Text>
          </View>
        )}

        <Button label="Report a lost item" onPress={() => router.push('/(user)/lost-found/report')} fullWidth />

        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Pressable key={f.value} onPress={() => setFilter(f.value)} accessibilityRole="button"
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {visible.length === 0 && <Text style={styles.empty}>No items to show.</Text>}

        <View style={styles.grid}>
        {visible.map((item) => {
          const s = STATUS_STYLE[item.status];
          const mine = !!user && item.reporterId === user.id;
          return (
            <View key={item.id} style={[styles.card, shadows.sm, columns === 2 && styles.cardHalf]}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Ionicons name="cube-outline" size={26} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.fg }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>{item.category}</Text>
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaStrong} numberOfLines={2}>Last seen: {item.location}</Text>
                </View>
                <Text style={styles.meta}>
                  {item.lastSeenWhen ? `${item.lastSeenWhen}, ` : ''}reported {item.date}
                  {mine ? '  (your report)' : ''}
                </Text>
              </View>
            </View>
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  banner: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.md },
  bannerText: { flex: 1, color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  filters: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  chipTextActive: { color: colors.textWhite },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardHalf: { width: '48.5%' },
  card: { width: '100%', flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  meta: { fontSize: fontSize.xs, color: colors.textSecondary },
  metaStrong: { flex: 1, fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
});
