
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '../types';
import { MOCK_USERS, MOCK_CREDENTIALS } from '../data/users';

const SESSION_DURATION_MS = 90 * 24 * 60 * 60 * 1000;
const AUTH_STORAGE_KEY = 'campussafe-auth-session';

type EditableProfile = Partial<
  Pick<
    User,
    | 'name'
    | 'email'
    | 'avatar'
    | 'emergencyContactName'
    | 'emergencyContactPhone'
    | 'emergencyContactRelationship'
  >
>;

interface AuthState {
  user: User | null;
  sessionExpiresAt: number | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  setHasHydrated: (value: boolean) => void;
  updateProfile: (updates: EditableProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpiresAt: null,
      isLoading: false,
      error: null,
      hasHydrated: false,

      signIn: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const normalizedIdentifier = identifier.trim().toLowerCase();
          const credentials = MOCK_CREDENTIALS[normalizedIdentifier];

          if (!credentials || credentials.password !== password) {
            set({
              isLoading: false,
              error: 'Invalid student ID, email, or password.',
            });
            return;
          }

          const user = MOCK_USERS.find(
            (item) => item.id === credentials.userId,
          );

          if (!user) {
            set({
              isLoading: false,
              error:
                'Account not found. Please contact the administrator.',
            });
            return;
          }

          set({
            user: { ...user },
            sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
            isLoading: false,
            error: null,
          });
        } catch {
          set({
            isLoading: false,
            error: 'Unable to sign in. Please try again.',
          });
        }
      },

      signOut: () => {
        set({
          user: null,
          sessionExpiresAt: null,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;

        if (!currentUser) {
          return;
        }

        set({
          user: {
            ...currentUser,
            ...updates,

            // Keep registered account identity fields unchanged.
            id: currentUser.id,
            studentId: currentUser.studentId,
            role: currentUser.role,
          },
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        sessionExpiresAt: state.sessionExpiresAt,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        const expired =
          !state.sessionExpiresAt ||
          Date.now() >= state.sessionExpiresAt;

        if (state.user && expired) {
          state.signOut();
        }

        state.setHasHydrated(true);
      },
    },
  ),
);
