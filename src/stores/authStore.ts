import { create } from 'zustand';
import type { User } from '../types';
import { MOCK_USERS, MOCK_CREDENTIALS } from '../data/users';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const credentials = MOCK_CREDENTIALS[email.toLowerCase().trim()];
    if (!credentials || credentials.password !== password) {
      set({ isLoading: false, error: 'Invalid email or password. Please try again.' });
      return;
    }

    const user = MOCK_USERS.find((u) => u.id === credentials.userId);
    if (!user) {
      set({ isLoading: false, error: 'User not found.' });
      return;
    }

    set({ user, isLoading: false, error: null });
  },

  signOut: () => {
    set({ user: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
