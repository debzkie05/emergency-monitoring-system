import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, radius, fontSize, fontWeight } from '@/constants/theme';
import { CAMPUS_BUILDINGS } from '@/data/locations';
import { useLostFoundStore } from '@/stores/lostFoundStore';
import { useAuthStore } from '@/stores/authStore';

const CATEGORIES = ['Electronics', 'Personal Item', 'ID Card', 'Clothing', 'Documents', 'Other'];
const WHEN = ['Just now', 'Today', 'Yesterday', 'Earlier'];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function ReportLostScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addLostItem = useLostFoundStore((s) => s.addLostItem);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal Item');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [spot, setSpot] = useState('');
  const [when, setWhen] = useState('Today');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ name?: string; building?: string }>({});

  const building = CAMPUS_BUILDINGS.find((b) => b.id === buildingId) ?? null;

  const choosePhoto = async (fromCamera: boolean) => {
    setPhotoError('');
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPhotoError('Allow access in your phone settings to add a photo.');
      return;
    }
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, allowsEditing: true, aspect: [4, 3] as [number, number] };
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Tell us what you lost.';
    if (!building) next.building = 'Choose where you last saw it.';
    setErrors(next);
    if (Object.keys(next).length || !building) return;

    addLostItem({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      photo: photo ?? undefined,
      location: [building.name, floor, spot.trim()].filter(Boolean).join(', '),
      lastSeenWhen: when,
      lastSeenNote: note.trim() || undefined,
      reporterId: user?.id,
      reporterName: user?.name,
    });
    router.replace({ pathname: '/(user)/lost-found', params: { submitted: '1' } });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Report a lost item" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Item photo</Text>
        {photo ? (
          <View>
            <Image source={{ uri: photo }} style={styles.preview} />
            <Pressable onPress={() => setPhoto(null)} style={styles.remove} accessibilityRole="button" accessibilityLabel="Remove photo">
              <Ionicons name="close" size={18} color={colors.textWhite} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoRow}>
            <Pressable onPress={() => choosePhoto(false)} style={styles.photoBox} accessibilityRole="button">
              <Ionicons name="image-outline" size={26} color={colors.primary} />
              <Text style={styles.photoText}>Upload photo</Text>
            </Pressable>
            {Platform.OS !== 'web' && (
              <Pressable onPress={() => choosePhoto(true)} style={styles.photoBox} accessibilityRole="button">
                <Ionicons name="camera-outline" size={26} color={colors.primary} />
                <Text style={styles.photoText}>Take photo</Text>
              </Pressable>
            )}
          </View>
        )}
        {!!photoError && <Text style={styles.error}>{photoError}</Text>}

        <Input label="What did you lose?" placeholder="e.g. Black wallet" value={name} onChangeText={setName} error={errors.name} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />)}
        </View>

        <Input label="Description (optional)" placeholder="Color, brand, marks, what is inside" value={description}
          onChangeText={setDescription} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />

        <Text style={styles.section}>Last seen</Text>
        <Text style={styles.label}>Building</Text>
        <View style={styles.chips}>
          {CAMPUS_BUILDINGS.map((b) => (
            <Chip key={b.id} label={b.name} active={buildingId === b.id}
              onPress={() => { setBuildingId(b.id); setFloor(null); setErrors((e) => ({ ...e, building: undefined })); }} />
          ))}
        </View>
        {!!errors.building && <Text style={styles.error}>{errors.building}</Text>}

        {building && building.floors.length > 1 && (
          <>
            <Text style={styles.label}>Floor</Text>
            <View style={styles.chips}>
              {building.floors.map((f) => <Chip key={f} label={f} active={floor === f} onPress={() => setFloor(f)} />)}
            </View>
          </>
        )}

        <Input label="Room or spot (optional)" placeholder="e.g. Computer Lab 2, near the entrance" value={spot} onChangeText={setSpot} />

        <Text style={styles.label}>When did you last see it?</Text>
        <View style={styles.chips}>
          {WHEN.map((w) => <Chip key={w} label={w} active={when === w} onPress={() => setWhen(w)} />)}
        </View>

        <Input label="Anything else about where it was? (optional)" placeholder="e.g. Left on the table by the window"
          value={note} onChangeText={setNote} />

        <Button label="Submit report" onPress={submit} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  section: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  error: { color: colors.danger, fontSize: fontSize.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  chipTextActive: { color: colors.textWhite },
  photoRow: { flexDirection: 'row', gap: spacing.md },
  photoBox: { flex: 1, height: 96, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoText: { color: colors.primary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
  preview: { width: '100%', height: 200, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt },
  remove: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(15,23,42,0.7)', alignItems: 'center', justifyContent: 'center' },
});
