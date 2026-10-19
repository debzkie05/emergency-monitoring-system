
import { Redirect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function IndexScreen() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // Wait until the saved session has been restored.
  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CampusSafe...</Text>
      </View>
    );
  }

  // Preserve role-based navigation for existing accounts.
  if (user) {
    if (user.role === 'admin') {
      return <Redirect href="/(admin)" />;
    }

    return <Redirect href="/(user)" />;
  }

  const openLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons
            name="shield-checkmark"
            size={42}
            color={colors.textWhite}
          />
        </View>

        <Text style={styles.title}>CampusSafe</Text>

        <Text style={styles.subtitle}>
          Your campus safety companion
        </Text>

        <View style={styles.illustration}>
          <Ionicons
            name="people-circle-outline"
            size={100}
            color={colors.primary}
          />
          <View style={styles.smallIcon}>
            <Ionicons
              name="checkmark-circle"
              size={30}
              color={colors.success ?? colors.primary}
            />
          </View>
        </View>

        <Text style={styles.heading}>
          Safety starts here.
        </Text>

        <Text style={styles.description}>
          Report emergencies, keep track of your reports,
          and connect with your campus response team.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={openLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={colors.textWhite}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={openLogin}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Sign In
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.footerText}>
            Campus access for authorized users
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  illustration: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
    width: 150,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  smallIcon: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  primaryButton: {
    width: '100%',
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  secondaryButton: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});
