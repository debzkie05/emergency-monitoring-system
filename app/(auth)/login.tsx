import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadows,
} from '@/constants/theme';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useResponsive } from '@/hooks/useResponsive';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { height, isPhone } = useResponsive();
  const router = useRouter();

  const {
    signIn,
    isLoading,
    error,
    clearError,
    user,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /*
   * IMPORTANT:
   * After signIn() successfully updates the auth store,
   * this effect redirects the user to the correct area.
   *
   * We do this here instead of redirecting from the root layout
   * because the authentication layout is already mounted.
   */
  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin') {
      router.replace('/(admin)');
    } else {
      router.replace('/(user)');
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    await signIn(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          !isPhone && styles.containerWide,
          {
            paddingTop:
              insets.top + (height < 700 ? 24 : 60),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons
              name="shield-checkmark"
              size={36}
              color={colors.textWhite}
            />
          </View>

          <Text style={styles.logoTitle}>
            CampusSafe
          </Text>

          <Text style={styles.logoSubtitle}>
            Campus Emergency Response System
          </Text>
        </View>

        {/* Login Card */}
        <View style={[styles.loginCard, shadows.lg]}>
          <Text style={styles.welcomeText}>
            Welcome Back
          </Text>

          <Text style={styles.instructionText}>
            Sign in with your campus credentials
          </Text>

          <View style={styles.form}>
            {/* Email / Student ID */}
            <Input
              label="School Email / Student ID"
              placeholder="student@campussafe.edu"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Password */}
            <View>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />

              <Pressable
                onPress={() =>
                  setShowPassword((previous) => !previous)
                }
                style={styles.eyeButton}
                disabled={isLoading}
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.danger}
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Sign In */}
            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={
                isLoading ||
                !email.trim() ||
                !password.trim()
              }
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flexGrow: 1,
    padding: spacing.xl,
  },

  containerWide: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },

  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  logoTitle: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },

  logoSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  loginCard: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },

  instructionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  form: {
    gap: spacing.lg,
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    padding: 4,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.lg,
    borderRadius: radius.md,
  },

  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    flex: 1,
  },

  hintContainer: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    gap: spacing.sm,
  },

  hintTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  hintBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },

  hintBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  hintText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },

  hintPassword: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});