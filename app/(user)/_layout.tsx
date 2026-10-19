
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveFrame } from '@/components/layout/ResponsiveFrame';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function UserLayout() {
  const { isDesktop } = useResponsive();
  const { colors } = useAppTheme();

  return (
    <ResponsiveFrame>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarPosition: isDesktop ? 'left' : 'bottom',
          tabBarVariant: isDesktop ? 'material' : 'uikit',
          tabBarStyle: isDesktop
            ? {
                backgroundColor: colors.surface,
                borderRightColor: colors.borderLight,
                borderRightWidth: 1,
              }
            : {
                backgroundColor: colors.surface,
                borderTopColor: colors.borderLight,
                borderTopWidth: 1,
                paddingTop: 4,
                height: 60,
              },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="reports"
          options={{
            title: 'My Reports',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="document-text"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="lost-found"
          options={{
            title: 'Lost & Found',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="emergency"
          options={{ href: null }}
        />
      </Tabs>
    </ResponsiveFrame>
  );
}
