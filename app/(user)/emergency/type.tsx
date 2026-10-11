import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from '@/constants/theme';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';

import { useIncidentStore } from '@/stores/incidentStore';

import { EMERGENCY_TYPES } from '@/data/emergencyTypes';

import type { EmergencyType } from '@/types';

export default function EmergencyTypeScreen() {
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const setField =
    useIncidentStore(
      (state) =>
        state.setCurrentEmergencyField
    );

  const currentType =
    useIncidentStore(
      (state) =>
        state.currentEmergency.type
    );

  const [selected, setSelected] =
    useState<EmergencyType | null>(
      currentType || null
    );

  const handleSelect = (
    type: EmergencyType
  ) => {
    setSelected(type);

    setField('type', type);
  };

  const handleNext = () => {
    if (!selected) return;

    router.push({
      pathname:
        '/(user)/emergency/location',
      params: {
        id,
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <Header
        title="Emergency Type"
        subtitle="What type of emergency is it?"
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.grid}>
          {EMERGENCY_TYPES.map((type) => {
            const isSelected =
              selected === type.id;

            return (
              <Pressable
                key={type.id}
                onPress={() =>
                  handleSelect(type.id)
                }
                style={({ pressed }) => [
                  styles.typeCard,

                  isSelected &&
                  styles.typeCardSelected,

                  {
                    opacity: pressed
                      ? 0.8
                      : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor:
                        isSelected
                          ? colors.primary
                          : type.color + '18',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      type.icon as any
                    }
                    size={24}
                    color={
                      isSelected
                        ? colors.surface
                        : type.color
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.typeLabel,
                    isSelected &&
                    styles.typeLabelSelected,
                  ]}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>

                {isSelected && (
                  <View
                    style={styles.check}
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={colors.textWhite}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleNext}
          disabled={!selected}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.xl,
    paddingBottom: 110,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: spacing.lg,
  },

  typeCard: {
    width: '48%',

    minHeight: 132,

    backgroundColor: colors.surface,

    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: colors.border,

    padding: spacing.lg,

    justifyContent: 'center',
    alignItems: 'flex-start',

    position: 'relative',
  },

  typeCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  typeIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.lg,
  },

  typeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,

    paddingRight: spacing.lg,
  },

  typeLabelSelected: {
    color: colors.primary,
  },

  check: {
    position: 'absolute',

    top: 10,
    right: 10,

    width: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,

    backgroundColor: colors.surface,

    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});