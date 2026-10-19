
import { Switch, useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
} from '@/constants/theme';

import { useAuthStore } from '@/stores/authStore';

type Section =
    | 'personal'
    | 'emergency'
    | 'settings'
    | 'account'
    | null;

type MessageType = 'success' | 'error';

export default function ProfileScreen() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const signOut = useAuthStore((state) => state.signOut);

    const [expandedSection, setExpandedSection] =
        useState<Section>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [contactName, setContactName] = useState('');
    const [contactRelationship, setContactRelationship] =
        useState('');
    const [contactPhone, setContactPhone] = useState('');

    const [savingPersonal, setSavingPersonal] = useState(false);
    const [savingEmergency, setSavingEmergency] = useState(false);

    const [personalSaved, setPersonalSaved] = useState(false);
    const [emergencySaved, setEmergencySaved] = useState(false);

    const [personalMessage, setPersonalMessage] = useState('');
    const [personalMessageType, setPersonalMessageType] =
        useState<MessageType>('success');

    const [emergencyMessage, setEmergencyMessage] = useState('');
    const [emergencyMessageType, setEmergencyMessageType] =
        useState<MessageType>('success');

    useEffect(() => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');

        setContactName(user?.emergencyContactName ?? '');
        setContactRelationship(
            user?.emergencyContactRelationship ?? ''
        );
        setContactPhone(user?.emergencyContactPhone ?? '');

        setPersonalSaved(false);
        setEmergencySaved(false);
        setPersonalMessage('');
        setEmergencyMessage('');
    }, [user?.id]);

    const toggleSection = (section: Exclude<Section, null>) => {
        setExpandedSection((current) =>
            current === section ? null : section
        );
    };

    const showPersonalMessage = (
        message: string,
        type: MessageType = 'success'
    ) => {
        setPersonalMessage(message);
        setPersonalMessageType(type);
    };

    const showEmergencyMessage = (
        message: string,
        type: MessageType = 'success'
    ) => {
        setEmergencyMessage(message);
        setEmergencyMessageType(type);
    };

    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U';

    const pickPhoto = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Permission Required',
                    'Please allow photo library access to choose a profile picture.'
                );
                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (!result.canceled && result.assets[0]?.uri) {
                updateProfile({
                    avatar: result.assets[0].uri,
                });

                Alert.alert(
                    'Profile Photo Updated',
                    'Your profile photo has been updated.'
                );
            }
        } catch {
            Alert.alert(
                'Unable to Select Photo',
                'Please try again.'
            );
        }
    };

    const savePersonalInformation = () => {
        if (!user) return;

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            showPersonalMessage(
                'Please enter your display name.',
                'error'
            );
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            showPersonalMessage(
                'Please enter a valid email address.',
                'error'
            );
            return;
        }

        if (
            trimmedName === user.name &&
            trimmedEmail === user.email
        ) {
            setPersonalSaved(false);
            showPersonalMessage(
                'There are no changes to save.',
                'error'
            );
            return;
        }

        setSavingPersonal(true);
        setPersonalSaved(false);
        setPersonalMessage('');

        try {
            updateProfile({
                name: trimmedName,
                email: trimmedEmail,
            });

            setName(trimmedName);
            setEmail(trimmedEmail);
            setPersonalSaved(true);
            showPersonalMessage(
                'Your personal information has been saved.'
            );
        } catch {
            showPersonalMessage(
                'Unable to save your information. Please try again.',
                'error'
            );
        } finally {
            setSavingPersonal(false);
        }
    };

    const saveEmergencyContact = () => {
        if (!user) return;

        const trimmedName = contactName.trim();
        const trimmedRelationship = contactRelationship.trim();
        const trimmedPhone = contactPhone.trim();

        if (!trimmedName) {
            showEmergencyMessage(
                'Please enter your contact person’s name.',
                'error'
            );
            return;
        }

        if (!trimmedRelationship) {
            showEmergencyMessage(
                'Please select or enter your relationship.',
                'error'
            );
            return;
        }

        const digits = trimmedPhone.replace(/\D/g, '');

        if (digits.length < 7 || digits.length > 15) {
            showEmergencyMessage(
                'Please enter a valid contact phone number.',
                'error'
            );
            return;
        }

        const unchanged =
            trimmedName === (user.emergencyContactName ?? '') &&
            trimmedRelationship ===
            (user.emergencyContactRelationship ?? '') &&
            trimmedPhone === (user.emergencyContactPhone ?? '');

        if (unchanged) {
            setEmergencySaved(false);
            showEmergencyMessage(
                'There are no changes to save.',
                'error'
            );
            return;
        }

        setSavingEmergency(true);
        setEmergencySaved(false);
        setEmergencyMessage('');

        try {
            updateProfile({
                emergencyContactName: trimmedName,
                emergencyContactRelationship: trimmedRelationship,
                emergencyContactPhone: trimmedPhone,
            });

            setContactName(trimmedName);
            setContactRelationship(trimmedRelationship);
            setContactPhone(trimmedPhone);

            setEmergencySaved(true);
            showEmergencyMessage(
                'Your emergency contact has been saved.'
            );
        } catch {
            showEmergencyMessage(
                'Unable to save your emergency contact. Please try again.',
                'error'
            );
        } finally {
            setSavingEmergency(false);
        }
    };

    const confirmSignOut = () => {
        const performSignOut = () => {
            signOut();
            router.replace('/(auth)/login');
        };

        if (Platform.OS === 'web') {
            const confirmed = globalThis.confirm(
                'Are you sure you want to sign out of CampusSafe?'
            );

            if (confirmed) performSignOut();
            return;
        }

        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out of CampusSafe?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: performSignOut,
                },
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.signedOutContainer}>
                <View style={styles.largeIcon}>
                    <Ionicons
                        name="person-outline"
                        size={34}
                        color={colors.primary}
                    />
                </View>

                <Text style={styles.signedOutTitle}>
                    Sign in to view your profile
                </Text>

                <Text style={styles.description}>
                    Sign in to manage your profile and account settings.
                </Text>

                <Pressable
                    style={styles.primaryButton}
                    onPress={() => router.replace('/(auth)/login')}
                >
                    <Text style={styles.primaryButtonText}>
                        Sign In
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Profile</Text>
                <Text style={styles.description}>
                    Manage your personal information and account.
                </Text>
            </View>

            {/* Profile summary */}
            <View style={styles.profileCard}>
                <View style={styles.avatarWrapper}>
                    {user.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarInitials}>
                                {initials}
                            </Text>
                        </View>
                    )}

                    <Pressable
                        style={styles.cameraButton}
                        onPress={pickPhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Change profile photo"
                    >
                        <Ionicons
                            name="camera"
                            size={17}
                            color="#FFFFFF"
                        />
                    </Pressable>
                </View>

                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>

                <View style={styles.studentBadge}>
                    <Ionicons
                        name="school-outline"
                        size={15}
                        color={colors.primary}
                    />
                    <Text style={styles.studentBadgeText}>
                        Student Account
                    </Text>
                </View>

                <Pressable
                    style={styles.changePhotoButton}
                    onPress={pickPhoto}
                >
                    <Text style={styles.changePhotoText}>
                        Change Profile Photo
                    </Text>
                </Pressable>
            </View>

            {/* Personal Information accordion */}
            <View style={styles.section}>
                <Pressable
                    style={styles.sectionHeader}
                    onPress={() => toggleSection('personal')}
                    accessibilityRole="button"
                    accessibilityState={{
                        expanded: expandedSection === 'personal',
                    }}
                >
                    <View style={styles.sectionIcon}>
                        <Ionicons
                            name="person-outline"
                            size={21}
                            color={colors.primary}
                        />
                    </View>

                    <View style={styles.sectionHeaderText}>
                        <Text style={styles.sectionTitle}>
                            Personal Information
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Name, email, and student ID
                        </Text>
                    </View>

                    <Ionicons
                        name={
                            expandedSection === 'personal'
                                ? 'chevron-up'
                                : 'chevron-down'
                        }
                        size={21}
                        color={colors.textSecondary}
                    />
                </Pressable>

                {expandedSection === 'personal' && (
                    <View style={styles.sectionBody}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Display Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="person-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={name}
                                    onChangeText={(value) => {
                                        setName(value);
                                        setPersonalSaved(false);
                                        setPersonalMessage('');
                                    }}
                                    placeholder="Enter your display name"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.input}
                                    autoCapitalize="words"
                                    editable={!savingPersonal}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="mail-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setPersonalSaved(false);
                                        setPersonalMessage('');
                                    }}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!savingPersonal}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Student ID</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    styles.readOnlyInput,
                                ]}
                            >
                                <Ionicons
                                    name="id-card-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={user.studentId}
                                    style={styles.input}
                                    editable={false}
                                    selectTextOnFocus={false}
                                />
                                <Ionicons
                                    name="lock-closed"
                                    size={16}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Your registered student ID cannot be changed here.
                            </Text>
                        </View>

                        <FeedbackMessage
                            message={personalMessage}
                            type={personalMessageType}
                        />

                        <SaveButton
                            saving={savingPersonal}
                            saved={personalSaved}
                            onPress={savePersonalInformation}
                        />
                    </View>
                )}
            </View>

            {/* Emergency Contact accordion */}
            <View style={styles.section}>
                <Pressable
                    style={styles.sectionHeader}
                    onPress={() => toggleSection('emergency')}
                    accessibilityRole="button"
                    accessibilityState={{
                        expanded: expandedSection === 'emergency',
                    }}
                >
                    <View
                        style={[
                            styles.sectionIcon,
                            styles.emergencyIcon,
                        ]}
                    >
                        <Ionicons
                            name="heart-outline"
                            size={21}
                            color="#DC2626"
                        />
                    </View>

                    <View style={styles.sectionHeaderText}>
                        <Text style={styles.sectionTitle}>
                            Emergency Contact
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Person to contact in an emergency
                        </Text>
                    </View>

                    <Ionicons
                        name={
                            expandedSection === 'emergency'
                                ? 'chevron-up'
                                : 'chevron-down'
                        }
                        size={21}
                        color={colors.textSecondary}
                    />
                </Pressable>

                {expandedSection === 'emergency' && (
                    <View style={styles.sectionBody}>
                        <View style={styles.infoNotice}>
                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color={colors.primary}
                            />
                            <Text style={styles.infoNoticeText}>
                                Keep this information current so the appropriate
                                contact can be identified when needed.
                            </Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>
                                Contact Person's Name
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="person-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={contactName}
                                    onChangeText={(value) => {
                                        setContactName(value);
                                        setEmergencySaved(false);
                                        setEmergencyMessage('');
                                    }}
                                    placeholder="Enter full name"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.input}
                                    autoCapitalize="words"
                                    editable={!savingEmergency}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Relationship</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="people-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={contactRelationship}
                                    onChangeText={(value) => {
                                        setContactRelationship(value);
                                        setEmergencySaved(false);
                                        setEmergencyMessage('');
                                    }}
                                    placeholder="e.g. Parent, Guardian, Sibling"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.input}
                                    autoCapitalize="words"
                                    editable={!savingEmergency}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="call-outline"
                                    size={19}
                                    color={colors.textSecondary}
                                />
                                <TextInput
                                    value={contactPhone}
                                    onChangeText={(value) => {
                                        setContactPhone(value);
                                        setEmergencySaved(false);
                                        setEmergencyMessage('');
                                    }}
                                    placeholder="e.g. 09XX XXX XXXX"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    editable={!savingEmergency}
                                />
                            </View>
                        </View>

                        <FeedbackMessage
                            message={emergencyMessage}
                            type={emergencyMessageType}
                        />

                        <SaveButton
                            saving={savingEmergency}
                            saved={emergencySaved}
                            onPress={saveEmergencyContact}
                        />
                    </View>
                )}
            </View>

            {/* Settings accordion - placeholder */}
            <View style={styles.section}>
                <Pressable
                    style={styles.sectionHeader}
                    onPress={() => toggleSection('settings')}
                    accessibilityRole="button"
                    accessibilityState={{
                        expanded: expandedSection === 'settings',
                    }}
                >
                    <View style={styles.sectionIcon}>
                        <Ionicons
                            name="settings-outline"
                            size={21}
                            color={colors.primary}
                        />
                    </View>

                    <View style={styles.sectionHeaderText}>
                        <Text style={styles.sectionTitle}>Settings</Text>
                        <Text style={styles.sectionSubtitle}>
                            Preferences and app options
                        </Text>
                    </View>

                    <Ionicons
                        name={
                            expandedSection === 'settings'
                                ? 'chevron-up'
                                : 'chevron-down'
                        }
                        size={21}
                        color={colors.textSecondary}
                    />
                </Pressable>

                {expandedSection === 'settings' && (
                    <View style={styles.sectionBody}>
                        <View style={styles.placeholder}>
                            <Ionicons
                                name="construct-outline"
                                size={28}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.placeholderTitle}>
                                Settings coming soon
                            </Text>
                            <Text style={styles.placeholderText}>
                                Additional settings will be added here when they
                                are defined.
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Account accordion */}
            <View style={styles.section}>
                <Pressable
                    style={styles.sectionHeader}
                    onPress={() => toggleSection('account')}
                    accessibilityRole="button"
                    accessibilityState={{
                        expanded: expandedSection === 'account',
                    }}
                >
                    <View style={styles.sectionIcon}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={21}
                            color={colors.primary}
                        />
                    </View>

                    <View style={styles.sectionHeaderText}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <Text style={styles.sectionSubtitle}>
                            Account information and sign out
                        </Text>
                    </View>

                    <Ionicons
                        name={
                            expandedSection === 'account'
                                ? 'chevron-up'
                                : 'chevron-down'
                        }
                        size={21}
                        color={colors.textSecondary}
                    />
                </Pressable>

                {expandedSection === 'account' && (
                    <View style={styles.sectionBody}>
                        <View style={styles.accountRow}>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountLabel}>
                                    Account Type
                                </Text>
                                <Text style={styles.accountValue}>
                                    Student
                                </Text>
                            </View>
                            <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color="#16A34A"
                            />
                        </View>

                        <Pressable
                            style={styles.signOutButton}
                            onPress={confirmSignOut}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={21}
                                color={colors.danger}
                            />
                            <Text style={styles.signOutText}>
                                Sign Out
                            </Text>
                            <View style={{ flex: 1 }} />
                            <Ionicons
                                name="chevron-forward"
                                size={19}
                                color={colors.danger}
                            />
                        </Pressable>
                    </View>
                )}
            </View>

            <Text style={styles.footerText}>
                CampusSafe · Student Profile
            </Text>
        </ScrollView>
    );
}

function FeedbackMessage({
    message,
    type,
}: {
    message: string;
    type: MessageType;
}) {
    if (!message) return null;

    const success = type === 'success';

    return (
        <View
            style={[
                styles.feedback,
                success ? styles.feedbackSuccess : styles.feedbackError,
            ]}
        >
            <Ionicons
                name={success ? 'checkmark-circle' : 'alert-circle'}
                size={19}
                color={success ? '#15803D' : '#B91C1C'}
            />
            <Text
                style={[
                    styles.feedbackText,
                    { color: success ? '#15803D' : '#B91C1C' },
                ]}
            >
                {message}
            </Text>
        </View>
    );
}

function SaveButton({
    saving,
    saved,
    onPress,
}: {
    saving: boolean;
    saved: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={saving || saved}
            onPress={onPress}
            style={({ pressed }) => [
                styles.saveButton,
                saved && styles.saveButtonSuccess,
                saving && styles.saveButtonDisabled,
                pressed && !saving && !saved && styles.buttonPressed,
            ]}
        >
            <View style={styles.saveButtonContent}>
                {saving ? (
                    <>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                    </>
                ) : saved ? (
                    <>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FFFFFF"
                        />
                        <Text style={styles.saveButtonText}>
                            Changes Saved
                        </Text>
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="save-outline"
                            size={19}
                            color="#FFFFFF"
                        />
                        <Text style={styles.saveButtonText}>
                            Save Changes
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl * 2,
    },
    header: {
        marginBottom: spacing.lg,
    },
    pageTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    description: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        lineHeight: 21,
        marginTop: spacing.xs,
    },
    profileCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: radius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.borderLight,
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: colors.primary,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    cameraButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    profileName: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
    },
    profileEmail: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    studentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.xl,
        marginTop: spacing.md,
    },
    studentBadgeText: {
        color: colors.primary,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    changePhotoButton: {
        marginTop: spacing.md,
        padding: spacing.sm,
    },
    changePhotoText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    section: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: radius.xl,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        minHeight: 78,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emergencyIcon: {
        backgroundColor: '#FEE2E2',
    },
    sectionHeaderText: {
        flex: 1,
        gap: 4,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    sectionSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        lineHeight: 18,
    },
    sectionBody: {
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        padding: spacing.md,
    },
    field: {
        marginBottom: spacing.lg,
    },
    label: {
        color: colors.text,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    inputWrapper: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: radius.md,
        backgroundColor: colors.background,
    },
    input: {
        flex: 1,
        minWidth: 0,
        color: colors.text,
        fontSize: fontSize.md,
        paddingVertical: spacing.md,
        ...(Platform.OS === 'web'
            ? { outlineStyle: 'none' as const }
            : {}),
    },
    readOnlyInput: {
        backgroundColor: colors.borderLight,
        opacity: 0.85,
    },
    helperText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        lineHeight: 18,
        marginTop: spacing.xs,
    },
    infoNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        backgroundColor: colors.primaryLight,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
    infoNoticeText: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.xs,
        lineHeight: 19,
    },
    feedback: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    feedbackSuccess: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    feedbackError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    feedbackText: {
        flex: 1,
        fontSize: fontSize.sm,
        lineHeight: 20,
        fontWeight: fontWeight.medium,
    },
    saveButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 15,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    saveButtonSuccess: {
        backgroundColor: '#16A34A',
    },
    saveButtonDisabled: {
        opacity: 0.85,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    accountInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    accountLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
    },
    accountValue: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.dangerLight,
        borderRadius: radius.md,
    },
    signOutText: {
        color: colors.danger,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    placeholder: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    placeholderTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.md,
    },
    placeholderText: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    signedOutContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    largeIcon: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    signedOutTitle: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: radius.md,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    primaryButtonText: {
        color: colors.textWhite,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});
