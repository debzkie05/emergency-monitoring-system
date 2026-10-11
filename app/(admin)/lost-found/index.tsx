import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
    AdminShell,
} from '@/components/layout/AdminShell';

import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
} from '@/constants/theme';
import { useLostFoundStore } from '@/stores/lostFoundStore';

type ItemStatus = 'LOST' | 'FOUND' | 'CLAIMED';

interface LostItem {
    id: string;
    name: string;
    category: string;
    location: string;
    date: string;
    status: ItemStatus;
}


export default function LostFoundAdmin() {
    const { width } = useWindowDimensions();

    const desktop = width >= 900;

    const ITEMS = useLostFoundStore((s) => s.items);

    const [filter, setFilter] =
        useState<'ALL' | ItemStatus>('ALL');

    const [search, setSearch] =
        useState('');

    const filtered = ITEMS.filter((item) => {
        const matchesFilter =
            filter === 'ALL' ||
            item.status === filter;

        const q =
            search.trim().toLowerCase();

        const matchesSearch =
            !q ||
            item.name
                .toLowerCase()
                .includes(q) ||
            item.category
                .toLowerCase()
                .includes(q) ||
            item.location
                .toLowerCase()
                .includes(q);

        return (
            matchesFilter &&
            matchesSearch
        );
    });

    return (
        <AdminShell
            title="Lost & Found"
            subtitle="Manage items reported around campus"
            active="Lost & Found"
        >
            <View style={styles.summaryRow}>
                <Summary
                    label="Total Items"
                    value="18"
                    icon="cube-outline"
                    color={colors.primary}
                    light={colors.primaryLight}
                />

                <Summary
                    label="Lost"
                    value="9"
                    icon="search-outline"
                    color={colors.danger}
                    light={colors.dangerLight}
                />

                <Summary
                    label="Found"
                    value="6"
                    icon="checkmark-circle-outline"
                    color={colors.success}
                    light={colors.successLight}
                />

                <Summary
                    label="Claimed"
                    value="3"
                    icon="person-outline"
                    color={colors.warning}
                    light={colors.warningLight}
                />
            </View>

            <View style={styles.toolbar}>
                <View style={styles.searchBox}>
                    <Ionicons
                        name="search-outline"
                        size={18}
                        color={colors.textMuted}
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search items..."
                        placeholderTextColor={
                            colors.textMuted
                        }
                        style={styles.searchInput}
                    />
                </View>

                <View style={styles.filters}>
                    {(
                        [
                            'ALL',
                            'LOST',
                            'FOUND',
                            'CLAIMED',
                        ] as const
                    ).map((value) => {
                        const active =
                            filter === value;

                        return (
                            <Pressable
                                key={value}
                                onPress={() =>
                                    setFilter(value)
                                }
                                style={[
                                    styles.filterButton,
                                    active &&
                                    styles.filterButtonActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        active &&
                                        styles.filterTextActive,
                                    ]}
                                >
                                    {value === 'ALL'
                                        ? 'All'
                                        : value}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {desktop ? (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colItem,
                            ]}
                        >
                            ITEM
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colCategory,
                            ]}
                        >
                            CATEGORY
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colLocation,
                            ]}
                        >
                            LOCATION
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colDate,
                            ]}
                        >
                            DATE
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colStatus,
                            ]}
                        >
                            STATUS
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.colAction,
                            ]}
                        >
                            ACTION
                        </Text>
                    </View>

                    {filtered.map((item) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                        />
                    ))}

                    {filtered.length === 0 && (
                        <Empty />
                    )}
                </View>
            ) : (
                <View>
                    {filtered.map((item) => (
                        <MobileItem
                            key={item.id}
                            item={item}
                        />
                    ))}

                    {filtered.length === 0 && (
                        <Empty />
                    )}
                </View>
            )}
        </AdminShell>
    );
}

function Summary({
    label,
    value,
    icon,
    color,
    light,
}: {
    label: string;
    value: string;
    icon: string;
    color: string;
    light: string;
}) {
    return (
        <View style={styles.summaryCard}>
            <View
                style={[
                    styles.summaryIcon,
                    { backgroundColor: light },
                ]}
            >
                <Ionicons
                    name={icon as any}
                    size={19}
                    color={color}
                />
            </View>

            <View>
                <Text style={styles.summaryLabel}>
                    {label}
                </Text>

                <Text style={styles.summaryValue}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function ItemRow({
    item,
}: {
    item: LostItem;
}) {
    return (
        <View style={styles.tableRow}>
            <View
                style={[
                    styles.colItem,
                    styles.itemCell,
                ]}
            >
                <View style={styles.itemIcon}>
                    <Ionicons
                        name="cube-outline"
                        size={18}
                        color={colors.primary}
                    />
                </View>

                <View>
                    <Text style={styles.itemName}>
                        {item.name}
                    </Text>

                    <Text style={styles.itemId}>
                        {item.id}
                    </Text>
                </View>
            </View>

            <Text
                style={[
                    styles.cellText,
                    styles.colCategory,
                ]}
            >
                {item.category}
            </Text>

            <View style={styles.colLocation}>
                <View style={styles.locationCell}>
                    <Ionicons
                        name="location-outline"
                        size={15}
                        color={colors.textMuted}
                    />

                    <Text style={styles.cellText}>
                        {item.location}
                    </Text>
                </View>
            </View>

            <Text
                style={[
                    styles.cellText,
                    styles.colDate,
                ]}
            >
                {item.date}
            </Text>

            <View style={styles.colStatus}>
                <Status status={item.status} />
            </View>

            <View style={styles.colAction}>
                <Pressable style={styles.moreButton}>
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color={colors.textSecondary}
                    />
                </Pressable>
            </View>
        </View>
    );
}

function MobileItem({
    item,
}: {
    item: LostItem;
}) {
    return (
        <View style={styles.mobileItem}>
            <View style={styles.mobileItemTop}>
                <View style={styles.itemCell}>
                    <View style={styles.itemIcon}>
                        <Ionicons
                            name="cube-outline"
                            size={18}
                            color={colors.primary}
                        />
                    </View>

                    <View>
                        <Text style={styles.itemName}>
                            {item.name}
                        </Text>

                        <Text style={styles.itemId}>
                            {item.id}
                        </Text>
                    </View>
                </View>

                <Status status={item.status} />
            </View>

            <View style={styles.mobileInfoRow}>
                <Ionicons
                    name="pricetag-outline"
                    size={15}
                    color={colors.textMuted}
                />

                <Text style={styles.cellText}>
                    {item.category}
                </Text>
            </View>

            <View style={styles.mobileInfoRow}>
                <Ionicons
                    name="location-outline"
                    size={15}
                    color={colors.textMuted}
                />

                <Text style={styles.cellText}>
                    {item.location}
                </Text>
            </View>

            <View style={styles.mobileInfoRow}>
                <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={colors.textMuted}
                />

                <Text style={styles.cellText}>
                    {item.date}
                </Text>
            </View>
        </View>
    );
}

function Status({
    status,
}: {
    status: ItemStatus;
}) {
    const config = {
        LOST: {
            color: colors.danger,
            light: colors.dangerLight,
        },
        FOUND: {
            color: colors.success,
            light: colors.successLight,
        },
        CLAIMED: {
            color: colors.primary,
            light: colors.primaryLight,
        },
    }[status];

    return (
        <View
            style={[
                styles.status,
                {
                    backgroundColor: config.light,
                },
            ]}
        >
            <View
                style={[
                    styles.statusDot,
                    {
                        backgroundColor:
                            config.color,
                    },
                ]}
            />

            <Text
                style={[
                    styles.statusLabel,
                    {
                        color: config.color,
                    },
                ]}
            >
                {status}
            </Text>
        </View>
    );
}

function Empty() {
    return (
        <View style={styles.empty}>
            <Ionicons
                name="cube-outline"
                size={30}
                color={colors.textMuted}
            />

            <Text style={styles.emptyTitle}>
                No items found
            </Text>

            <Text style={styles.emptyText}>
                Try changing your search or filter.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },

    summaryCard: {
        flex: 1,
        minWidth: 180,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    summaryIcon: {
        width: 42,
        height: 42,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
    },

    summaryValue: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
        marginTop: 1,
    },

    toolbar: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.md,
    },

    searchBox: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },

    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.sm,
    },

    filters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },

    filterButton: {
        minHeight: 36,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterButtonActive: {
        backgroundColor: colors.primary,
    },

    filterText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },

    filterTextActive: {
        color: colors.textWhite,
    },

    table: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        overflow: 'hidden',
    },

    tableHeader: {
        minHeight: 46,
        backgroundColor: colors.surfaceAlt,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    tableHeaderText: {
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: fontWeight.extrabold,
        letterSpacing: 0.7,
    },

    tableRow: {
        minHeight: 74,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    colItem: {
        flex: 2,
    },

    colCategory: {
        flex: 1.3,
    },

    colLocation: {
        flex: 1.5,
    },

    colDate: {
        flex: 1.1,
    },

    colStatus: {
        flex: 1,
    },

    colAction: {
        width: 48,
        alignItems: 'flex-end',
    },

    itemCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    itemIcon: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    itemName: {
        color: colors.text,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },

    itemId: {
        color: colors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },

    cellText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
    },

    locationCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    status: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: radius.full,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    statusLabel: {
        fontSize: 9,
        fontWeight: fontWeight.extrabold,
    },

    moreButton: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    mobileItem: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },

    mobileItemTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },

    mobileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },

    empty: {
        minHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },

    emptyTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginTop: spacing.sm,
    },

    emptyText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
    },
});