
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface NotificationPreferences {
  emergencyAlerts: boolean;
  reportUpdates: boolean;
  lostFoundUpdates: boolean;
}

interface SettingsState {
  themePreference: ThemePreference;
  notifications: NotificationPreferences;
  setThemePreference: (theme: ThemePreference) => void;
  setNotification: (
    key: keyof NotificationPreferences,
    enabled: boolean
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'system',

      notifications: {
        emergencyAlerts: true,
        reportUpdates: true,
        lostFoundUpdates: true,
      },

      setThemePreference: (themePreference) =>
        set({ themePreference }),

      setNotification: (key, enabled) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: enabled,
          },
        })),
    }),
    {
      name: 'campussafe-user-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themePreference: state.themePreference,
        notifications: state.notifications,
      }),
    }
  )
);
