import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
    colors,
    spacing,
    radius,
    fontSize,
    fontWeight,
} from '@/constants/theme';

import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
    const user = useAuthStore((state) => state.user);

    const name = user?.name || 'Campus User';
    const email = user?.email || 'user@campus.edu';

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Profile</Text>

                    <View style={styles.headerSpacer} />
                </View>

                {/* Profile */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {name.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.name}>{name}</Text>

                    <Text style={styles.email}>{email}</Text>

                    <View style={styles.roleBadge}>
                        <Ionicons
                            name="person-outline"
                            size={14}
                            color={colors.primary}
                        />

                        <Text style={styles.roleText}>
                            {user?.role === 'admin'
                                ? 'Administrator'
                                : 'Student / Staff'}
                        </Text>
                    </View>
                </View>

                {/* Account */}
                <Text style={styles.sectionTitle}>Account</Text>

                <View style={styles.menuCard}>
                    <ProfileRow
                        icon="person-outline"
                        label="Personal Information"
                    />

                    <ProfileRow
                        icon="notifications-outline"
                        label="Notifications"
                    />

                    <ProfileRow
                        icon="shield-checkmark-outline"
                        label="Privacy & Security"
                        last
                    />
                </View>

                {/* Application */}
                <Text style={styles.sectionTitle}>Application</Text>

                <View style={styles.menuCard}>
                    <ProfileRow
                        icon="information-circle-outline"
                        label="About CampusSafe"
                    />

                    <ProfileRow
                        icon="help-circle-outline"
                        label="Help & Support"
                        last
                    />
                </View>

                <Text style={styles.version}>
                    CampusSafe v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

function ProfileRow({
    icon,
    label,
    last = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    last?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.row,
                !last && styles.rowBorder,
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.rowIcon}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={colors.primary}
                />
            </View>

            <Text style={styles.rowLabel}>
                {label}
            </Text>

            <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },

    headerSpacer: {
        width: 42,
    },

    profileCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginBottom: spacing.xl,
    },

    avatar: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },

    avatarText: {
        fontSize: 32,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },

    name: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: 4,
    },

    email: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },

    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },

    roleText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },

    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        marginLeft: 4,
    },

    menuCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },

    row: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },

    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    rowIcon: {
        width: 38,
        height: 38,
        borderRadius: radius.sm,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },

    rowLabel: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },

    version: {
        textAlign: 'center',
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
});