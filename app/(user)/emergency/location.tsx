import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useIncidentStore } from '@/stores/incidentStore';
import { CAMPUS_BUILDINGS, CAMPUS_ROOMS } from '@/data/locations';
import type { CampusLocation } from '@/types';

export default function EmergencyLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const setField = useIncidentStore((s) => s.setCurrentEmergencyField);
  const currentLocation = useIncidentStore((s) => s.currentEmergency.location);

  const [building, setBuilding] = useState<string>(currentLocation?.building || '');
  const [floor, setFloor] = useState<string>(currentLocation?.floor || '');
  const [room, setRoom] = useState<string>(currentLocation?.room || '');

  // Step 1: Building, Step 2: Floor/Room
  const [step, setStep] = useState<1 | 2>(building ? 2 : 1);

  const handleSelectBuilding = (bldName: string) => {
    setBuilding(bldName);
    setFloor('');
    setRoom('');
    setStep(2);
  };

  const handleNext = () => {
    if (building && floor && room) {
      const location: CampusLocation = { building, floor, room };
      setField('location', location);
      router.push({ pathname: '/(user)/emergency/details', params: { id } });
    }
  };

  const selectedBuildingData = CAMPUS_BUILDINGS.find((b) => b.name === building);
  const roomsList = selectedBuildingData ? CAMPUS_ROOMS[selectedBuildingData.id] || [] : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header 
        title="Location" 
        subtitle="Where is the incident?" 
        showBack 
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Select Building</Text>
            {CAMPUS_BUILDINGS.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => handleSelectBuilding(b.name)}
                style={({ pressed }) => [
                  styles.optionCard,
                  shadows.sm,
                  building === b.name && styles.optionCardSelected,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Ionicons 
                  name="business-outline" 
                  size={24} 
                  color={building === b.name ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.optionLabel, 
                  building === b.name && styles.optionLabelSelected
                ]}>
                  {b.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <Pressable onPress={() => setStep(1)} style={styles.selectedBuildingHeader}>
              <View style={styles.selectedBuildingInfo}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={styles.selectedBuildingText}>{building}</Text>
              </View>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Select Floor</Text>
            <View style={styles.chipsContainer}>
              {selectedBuildingData?.floors.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFloor(f)}
                  style={[
                    styles.chip,
                    floor === f && styles.chipSelected,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    floor === f && styles.chipTextSelected,
                  ]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {floor !== '' && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                  Select Room / Area
                </Text>
                {roomsList.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRoom(r)}
                    style={({ pressed }) => [
                      styles.roomOption,
                      room === r && styles.roomOptionSelected,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <View style={[styles.radio, room === r && styles.radioSelected]}>
                      {room === r && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.roomText, room === r && styles.roomTextSelected]}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Next"
          onPress={handleNext}
          disabled={!building || !floor || !room}
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
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  selectedBuildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.primaryMuted + '50',
  },
  selectedBuildingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedBuildingText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textWhite,
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.lg,
  },
  roomOptionSelected: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomColor: 'transparent',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  roomText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  roomTextSelected: {
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
