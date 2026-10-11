import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { StatusTimeline } from '@/components/common/StatusTimeline';
import { useIncidentStore } from '@/stores/incidentStore';
import { formatLocationFull, getEmergencyColor, formatDate } from '@/utils/helpers';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ReportDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = useIncidentStore((s) => s.getIncidentById(id || ''));

  if (!incident) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Report Details" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report not found.</Text>
        </View>
      </View>
    );
  }

  const iconColor = getEmergencyColor(incident.type);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Report Details" subtitle={`ID: ${incident.id}`} showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.card}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.sectionTitle}>Current Status</Text>
              <Text style={styles.lastUpdate}>Last updated {formatDate(incident.updatedAt)}</Text>
            </View>
            <StatusBadge status={incident.status} />
          </View>
          <View style={styles.divider} />
          <StatusTimeline statusHistory={incident.statusHistory} currentStatus={incident.status} />
        </Card>

        {/* Details Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Incident Information</Text>
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name="warning" size={20} color={iconColor} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{incident.typeLabel}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{formatLocationFull(incident.location)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{incident.description}</Text>
            </View>
          </View>

          {incident.photo && (
            <View style={styles.detailRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="image" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Photo</Text>
                <Image source={{ uri: incident.photo }} style={styles.photo} />
              </View>
            </View>
          )}
        </Card>

        {/* Responder Assignment */}
        {incident.assignedToName && (
          <Card style={styles.card}>
             <Text style={styles.sectionTitle}>Assigned Responder</Text>
             <View style={styles.divider} />
             <View style={styles.responderRow}>
               <View style={styles.responderAvatar}>
                 <Ionicons name="person" size={24} color={colors.primary} />
               </View>
               <View>
                 <Text style={styles.responderName}>{incident.assignedToName}</Text>
                 <Text style={styles.responderRole}>Campus Safety Team</Text>
               </View>
             </View>
          </Card>
        )}
      </ScrollView>
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
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
  card: {
    padding: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  lastUpdate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    resizeMode: 'cover',
  },
  responderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  responderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responderName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  responderRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
