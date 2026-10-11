import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IncidentCard } from '@/components/common/IncidentCard';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { formatDate, formatLocation } from '@/utils/helpers';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { incidents, createEmergencyAlert, resetCurrentEmergency } = useIncidentStore();

  // Emergency button state
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cancelTimer, setCancelTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for emergency button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const userReports = incidents.filter((i) => i.reporterId === user?.id).slice(0, 3);

  const handleEmergencyPress = () => {
    setIsSending(true);
    setCountdown(3);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setCancelTimer(null);
        // Send the emergency alert
        if (user) {
          resetCurrentEmergency();
          const incidentId = createEmergencyAlert(user.id, user.name);
          setIsSending(false);
          router.push({ pathname: '/(user)/emergency/sent', params: { id: incidentId } });
        }
      }
    }, 1000);
    setCancelTimer(timer);
  };

  const handleCancel = () => {
    if (cancelTimer) {
      clearInterval(cancelTimer);
      setCancelTimer(null);
    }
    setIsSending(false);
    setCountdown(3);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.textWhite} />
          </View>
          <View>
            <Text style={styles.logoText}>CampusSafe</Text>
            <Text style={styles.greetText}>Hello, {user?.name?.split(' ')[0] || 'Student'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Emergency Alert Card */}
        <Animated.View style={{ transform: [{ scale: isSending ? 1 : pulseAnim }] }}>
          <Pressable
            onPress={isSending ? handleCancel : handleEmergencyPress}
            style={({ pressed }) => [
              styles.emergencyCard,
              shadows.lg,
              { opacity: pressed ? 0.95 : 1 },
            ]}
          >
            <View style={styles.emergencyContent}>
              {isSending ? (
                <>
                  <View style={styles.countdownCircle}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                  <Text style={styles.emergencyTitle}>Sending Alert...</Text>
                  <Text style={styles.emergencySubtitle}>
                    Tap anywhere to cancel
                  </Text>
                  <Text style={styles.cancelHint}>
                    {countdown} seconds to cancel
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.emergencyIcon}>
                    <Ionicons name="alert-circle" size={40} color={colors.textWhite} />
                  </View>
                  <Text style={styles.emergencyTitle}>Send Emergency Alert</Text>
                  <Text style={styles.emergencySubtitle}>
                    Instantly notify the response team{'\n'}with your location
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => router.push('/(user)/reports')}
            style={({ pressed }) => [styles.quickAction, shadows.sm, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>My Reports</Text>
            <Text style={styles.quickSub}>View your reports</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickAction, shadows.sm, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push('/(user)/lost-found')}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="cube" size={22} color={colors.success} />
            </View>
            <Text style={styles.quickLabel}>Lost &amp; Found</Text>
            <Text style={styles.quickSub}>Report or search items</Text>
          </Pressable>
        </View>

        {/* Recent Reports */}
        {userReports.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <Pressable onPress={() => router.push('/(user)/reports')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
            {userReports.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onPress={() => router.push({ pathname: '/(user)/reports/[id]', params: { id: incident.id } })}
              />
            ))}
          </View>
        )}

        {/* Campus Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Safety</Text>
          <Card style={styles.tipsCard}>
            <View style={styles.tipRow}>
              <Ionicons name="call" size={18} color={colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Emergency Hotline</Text>
                <Text style={styles.tipText}>Campus Security: (02) 8123-4567</Text>
              </View>
            </View>
            <View style={[styles.tipRow, { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.lg }]}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Security Office</Text>
                <Text style={styles.tipText}>Main Building, Ground Floor</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  greetText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  profileButton: {
    padding: 4,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  emergencyCard: {
    backgroundColor: colors.danger,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  emergencyContent: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  countdownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  countdownText: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.extrabold,
    color: colors.textWhite,
  },
  emergencyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textWhite,
    textAlign: 'center',
  },
  emergencySubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  cancelHint: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: fontWeight.bold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  quickSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  viewAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  tipsCard: {
    gap: spacing.lg,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
