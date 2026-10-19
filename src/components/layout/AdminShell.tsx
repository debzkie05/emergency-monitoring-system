import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useWindowDimensions,
    ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
} from '@/constants/theme';
import { useIncidentStore } from '@/stores/incidentStore';
import { audioController, type AudioState } from '@/utils/audioController';
import { getIncidentSeverity } from '@/utils/severity';

interface AdminShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    active?: string;
}

const navigation = [
    {
        label: 'Dashboard',
        icon: 'grid-outline',
        route: '/(admin)',
    },
    {
        label: 'Incidents',
        icon: 'warning-outline',
        route: '/(admin)/incidents',
    },
    {
        label: 'Lost & Found',
        icon: 'cube-outline',
        route: '/(admin)/lost-found',
    },
    {
        label: 'Users',
        icon: 'people-outline',
        route: '/(admin)/users',
    },
    {
        label: 'Locations',
        icon: 'location-outline',
        route: '/(admin)/locations',
    },
    {
        label: 'Reports',
        icon: 'bar-chart-outline',
        route: '/(admin)/reports',
    },
];

export function AdminShell({
    children,
    title,
    subtitle,
    active = 'Dashboard',
}: AdminShellProps) {
    const { width } = useWindowDimensions();
    const router = useRouter();

    const isDesktop = width >= 900;

    const incidents = useIncidentStore((s) => s.incidents);
    const audioState = useIncidentStore((s) => s.audioState);
    const setAudioState = useIncidentStore((s) => s.setAudioState);

    const criticalWaitingCount = incidents.filter(
        (i) => getIncidentSeverity(i) === 'Critical' && i.status === 'reported'
    ).length;

    React.useEffect(() => {
        const unsub = audioController.subscribe((st) => {
            setAudioState(st);
        });
        return () => {
            unsub();
        };
    }, [setAudioState]);

    const handleToggleMonitoring = async () => {
        const nextState = await audioController.startMonitoring();
        setAudioState(nextState);
    };

    if (!isDesktop) {
        return (
            <View style={styles.mobileContainer}>
                <View style={styles.mobileHeader}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandIcon}>
                            <Ionicons
                                name="shield-checkmark"
                                size={20}
                                color={colors.textWhite}
                            />
                        </View>

                        <View>
                            <Text style={styles.brandText}>
                                CampusSafe
                            </Text>

                            <Text style={styles.adminLabel}>
                                Administrator
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={styles.mobileProfile}
                        onPress={handleToggleMonitoring}
                    >
                        <Ionicons
                            name={audioState === 'active' ? 'volume-high' : 'volume-mute-outline'}
                            size={24}
                            color={audioState === 'active' ? colors.success : colors.textSecondary}
                        />
                    </Pressable>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.mobileContent
                    }
                >
                    <Text style={styles.mobileTitle}>
                        {title}
                    </Text>

                    {subtitle && (
                        <Text style={styles.mobileSubtitle}>
                            {subtitle}
                        </Text>
                    )}

                    {children}
                </ScrollView>

                <View style={styles.mobileNav}>
                    {navigation.slice(0, 4).map((item) => {
                        const selected =
                            item.label === active;

                        return (
                            <Pressable
                                key={item.label}
                                onPress={() =>
                                    router.push(item.route as any)
                                }
                                style={styles.mobileNavItem}
                            >
                                <View style={{ position: 'relative' }}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={21}
                                        color={
                                            selected
                                                ? colors.primary
                                                : colors.textMuted
                                        }
                                    />
                                    {item.label === 'Incidents' && criticalWaitingCount > 0 && (
                                        <View style={styles.mobileBadge}>
                                            <Text style={styles.mobileBadgeText}>
                                                {criticalWaitingCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text
                                    style={[
                                        styles.mobileNavText,
                                        selected &&
                                        styles.mobileNavTextActive,
                                    ]}
                                >
                                    {item.label === 'Dashboard'
                                        ? 'Home'
                                        : item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.desktopContainer}>
            <View style={styles.sidebar}>
                <View style={styles.sidebarBrand}>
                    <View style={styles.brandIcon}>
                        <Ionicons
                            name="shield-checkmark"
                            size={21}
                            color={colors.textWhite}
                        />
                    </View>

                    <View>
                        <Text style={styles.brandText}>
                            CampusSafe
                        </Text>

                        <Text style={styles.adminLabel}>
                            ADMIN PANEL
                        </Text>
                    </View>
                </View>

                <View style={styles.sidebarDivider} />

                <View style={styles.sidebarNavigation}>
                    <Text style={styles.menuLabel}>
                        MAIN MENU
                    </Text>

                    {navigation.map((item) => {
                        const selected =
                            item.label === active;

                        return (
                            <Pressable
                                key={item.label}
                                onPress={() =>
                                    router.push(item.route as any)
                                }
                                style={[
                                    styles.navItem,
                                    selected &&
                                    styles.navItemActive,
                                ]}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={19}
                                    color={
                                        selected
                                            ? colors.textWhite
                                            : colors.sidebarText
                                    }
                                />

                                <View style={styles.navLabelRow}>
                                    <Text
                                        style={[
                                            styles.navText,
                                            selected &&
                                            styles.navTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.label === 'Incidents' && criticalWaitingCount > 0 && (
                                        <View style={styles.sidebarBadge}>
                                            <Text style={styles.sidebarBadgeText}>
                                                {criticalWaitingCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.sidebarBottom}>
                    <Pressable style={styles.settingsButton}>
                        <Ionicons
                            name="settings-outline"
                            size={19}
                            color={colors.sidebarText}
                        />

                        <Text style={styles.navText}>
                            Settings
                        </Text>
                    </Pressable>

                    <View style={styles.adminProfile}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                AD
                            </Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                Administrator
                            </Text>

                            <Text style={styles.profileRole}>
                                Campus Safety
                            </Text>
                        </View>

                        <Ionicons
                            name="ellipsis-horizontal"
                            size={18}
                            color={colors.sidebarText}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.main}>
                <View style={styles.topbar}>
                    <View>
                        <Text style={styles.pageTitle}>
                            {title}
                        </Text>

                        {subtitle && (
                            <Text style={styles.pageSubtitle}>
                                {subtitle}
                            </Text>
                        )}
                    </View>

                    <View style={styles.topbarRight}>
                        {audioState === 'active' && (
                            <View style={styles.audioStatusPillActive}>
                                <View style={styles.audioDotActive} />
                                <Text style={styles.audioStatusTextActive}>
                                    Audio monitoring active
                                </Text>
                            </View>
                        )}
                        {audioState === 'not_started' && (
                            <Pressable
                                onPress={handleToggleMonitoring}
                                style={styles.audioStatusPillStart}
                            >
                                <Ionicons
                                    name="volume-high-outline"
                                    size={15}
                                    color={colors.primary}
                                />
                                <Text style={styles.audioStatusTextStart}>
                                    Start monitoring
                                </Text>
                            </Pressable>
                        )}
                        {audioState === 'blocked' && (
                            <Pressable
                                onPress={handleToggleMonitoring}
                                style={styles.audioStatusPillBlocked}
                            >
                                <Ionicons
                                    name="alert-circle"
                                    size={15}
                                    color={colors.warning}
                                />
                                <Text style={styles.audioStatusTextBlocked}>
                                    Audio blocked (tap to allow)
                                </Text>
                            </Pressable>
                        )}
                        {audioState === 'unavailable' && (
                            <View style={styles.audioStatusPillUnavailable}>
                                <Text style={styles.audioStatusTextUnavailable}>
                                    Audio on web admin
                                </Text>
                            </View>
                        )}

                        <Pressable
                            style={styles.iconButton}
                            onPress={() => router.push('/(admin)/incidents')}
                        >
                            <Ionicons
                                name="notifications-outline"
                                size={21}
                                color={colors.text}
                            />

                            {criticalWaitingCount > 0 ? (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {criticalWaitingCount}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.notificationDot} />
                            )}
                        </Pressable>

                        <View style={styles.topbarDivider} />

                        <View style={styles.topProfile}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    AD
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.profileNameDark}>
                                    Administrator
                                </Text>

                                <Text style={styles.profileRoleDark}>
                                    Admin
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.mainContent
                    }
                >
                    {children}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.background,
    },

    sidebar: {
        width: 250,
        backgroundColor: colors.sidebar,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },

    sidebarBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.sm,
    },

    brandIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    brandText: {
        color: colors.textWhite,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.extrabold,
    },

    adminLabel: {
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: fontWeight.bold,
        letterSpacing: 1,
        marginTop: 2,
    },

    sidebarDivider: {
        height: 1,
        backgroundColor: '#1E293B',
        marginVertical: spacing.xl,
    },

    sidebarNavigation: {
        gap: 4,
    },

    menuLabel: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: fontWeight.bold,
        letterSpacing: 1,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },

    navItem: {
        minHeight: 46,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    navItemActive: {
        backgroundColor: colors.sidebarActive,
    },

    navText: {
        color: colors.sidebarText,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },

    navTextActive: {
        color: colors.textWhite,
        fontWeight: fontWeight.semibold,
    },

    sidebarBottom: {
        marginTop: 'auto',
    },

    settingsButton: {
        minHeight: 46,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },

    adminProfile: {
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: fontWeight.extrabold,
    },

    profileInfo: {
        flex: 1,
    },

    profileName: {
        color: colors.textWhite,
        fontSize: 12,
        fontWeight: fontWeight.semibold,
    },

    profileRole: {
        color: colors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },

    main: {
        flex: 1,
    },

    topbar: {
        minHeight: 82,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    pageTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
    },

    pageSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: 4,
    },

    topbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    iconButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    notificationDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.danger,
        position: 'absolute',
        top: 8,
        right: 8,
        borderWidth: 1,
        borderColor: colors.surface,
    },

    topbarDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
    },

    topProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    profileNameDark: {
        color: colors.text,
        fontSize: 12,
        fontWeight: fontWeight.semibold,
    },

    profileRoleDark: {
        color: colors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },

    mainContent: {
        padding: spacing.xxl,
        paddingBottom: 50,
    },

    mobileContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },

    mobileHeader: {
        backgroundColor: colors.surface,
        minHeight: 68,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    mobileProfile: {
        padding: 2,
    },

    mobileContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },

    mobileTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
    },

    mobileSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: 4,
        marginBottom: spacing.lg,
    },

    mobileNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    mobileNavItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        minWidth: 70,
    },

    mobileNavText: {
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: fontWeight.medium,
    },

    mobileNavTextActive: {
        color: colors.primary,
        fontWeight: fontWeight.bold,
    },

    navLabelRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sidebarBadge: {
        backgroundColor: colors.danger,
        borderRadius: radius.full,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },

    sidebarBadgeText: {
        color: colors.textWhite,
        fontSize: 11,
        fontWeight: fontWeight.bold,
    },

    mobileBadge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: colors.danger,
        borderRadius: radius.full,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    mobileBadgeText: {
        color: colors.textWhite,
        fontSize: 9,
        fontWeight: fontWeight.bold,
    },

    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.danger,
        borderRadius: radius.full,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    notificationBadgeText: {
        color: colors.textWhite,
        fontSize: 9,
        fontWeight: fontWeight.extrabold,
    },

    audioStatusPillActive: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    audioDotActive: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },

    audioStatusTextActive: {
        color: '#065F46',
        fontSize: 12,
        fontWeight: fontWeight.semibold,
    },

    audioStatusPillStart: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.primaryMuted,
    },

    audioStatusTextStart: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: fontWeight.bold,
    },

    audioStatusPillBlocked: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.warningLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.warning,
    },

    audioStatusTextBlocked: {
        color: colors.warningDark,
        fontSize: 12,
        fontWeight: fontWeight.bold,
    },

    audioStatusPillUnavailable: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceAlt,
    },

    audioStatusTextUnavailable: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: fontWeight.medium,
    },
});