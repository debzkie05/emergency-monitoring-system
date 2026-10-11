import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'dark';
}

export function Header({ title, subtitle, showBack = false, rightAction, variant = 'default' }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isDark = variant === 'dark';

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + spacing.sm,
        backgroundColor: isDark ? colors.text : colors.surface,
        borderBottomColor: isDark ? 'transparent' : colors.borderLight,
      },
    ]}>
      <View style={styles.row}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? colors.surface : colors.text} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.sm,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
  },
  titleDark: {
    color: colors.textWhite,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subtitleDark: {
    color: colors.textMuted,
  },
  rightAction: {
    marginLeft: spacing.sm,
  },
});
