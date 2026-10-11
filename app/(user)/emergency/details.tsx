import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { useIncidentStore } from '@/stores/incidentStore';

export default function EmergencyDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const setField = useIncidentStore((s) => s.setCurrentEmergencyField);
  const currentDetails = useIncidentStore((s) => s.currentEmergency);

  const [description, setDescription] = useState(currentDetails.description || '');
  const [photo, setPhoto] = useState<string | null>(currentDetails.photo || null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    setField('description', description);
    setField('photo', photo);
    router.push({ pathname: '/(user)/emergency/review', params: { id } });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header 
          title="Details" 
          subtitle="Add a short description and photo (optional)" 
          showBack 
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>What happened?</Text>
            <Input
              placeholder="Describe what happened..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Add Photo</Text>
            
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <Pressable style={styles.removePhotoBtn} onPress={() => setPhoto(null)}>
                  <Ionicons name="close-circle" size={24} color={colors.textWhite} />
                </Pressable>
              </View>
            ) : (
              <Pressable 
                style={({ pressed }) => [
                  styles.addPhotoBtn, 
                  { opacity: pressed ? 0.7 : 1 }
                ]} 
                onPress={handlePickImage}
              >
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.addPhotoText}>Tap to add photo</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Next"
            onPress={handleNext}
            size="lg"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
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
    gap: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  textArea: {
    height: 120,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  addPhotoBtn: {
    height: 140,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMuted,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addPhotoText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  photoContainer: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
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
