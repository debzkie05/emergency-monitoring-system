import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useIncidentStore } from '@/stores/incidentStore';
import { formatLocationFull, getEmergencyColor } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';

export default function EmergencyReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentEmergency, submitEmergencyDetails } = useIncidentStore();

  const handleEdit = (route: string) => {
    router.push({ pathname: `/(user)/emergency/${route}`, params: { id } } as any);
  };

  const handleSubmit = () => {
    if (typeof id === 'string') {
      submitEmergencyDetails(id);
      Alert.alert(
        'Report Updated',
        'Your emergency report has been updated with the details.',
        [{ text: 'OK', onPress: () => router.replace('/(user)') }]
      );
    }
  };

  const iconColor = currentEmergency.type ? getEmergencyColor(currentEmergency.type) : colors.primary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header 
        title="Review" 
        subtitle="Please check your information before sending." 
        showBack 
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.reviewCard}>
          {/* Type */}
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name="warning" size={20} color={iconColor} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{currentEmergency.typeLabel || 'Not specified'}</Text>
            </View>
            <Button 
              label="Edit" 
              variant="ghost" 
              size="sm" 
              onPress={() => handleEdit('type')} 
              fullWidth={false}
            />
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>
                {currentEmergency.location ? formatLocationFull(currentEmergency.location) : 'Not specified'}
              </Text>
            </View>
            <Button 
              label="Edit" 
              variant="ghost" 
              size="sm" 
              onPress={() => handleEdit('location')} 
              fullWidth={false}
            />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>
                {currentEmergency.description || 'No description provided.'}
              </Text>
            </View>
            <Button 
              label="Edit" 
              variant="ghost" 
              size="sm" 
              onPress={() => handleEdit('details')} 
              fullWidth={false}
            />
          </View>

          {/* Photo */}
          {currentEmergency.photo && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="image" size={20} color={colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Photo</Text>
                  <Image source={{ uri: currentEmergency.photo }} style={styles.thumbnail} />
                </View>
                <Button 
                  label="Edit" 
                  variant="ghost" 
                  size="sm" 
                  onPress={() => handleEdit('details')} 
                  fullWidth={false}
                />
              </View>
            </>
          )}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Submit / Update Report"
          onPress={handleSubmit}
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
  reviewCard: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
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
