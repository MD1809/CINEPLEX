import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Dialog Auth Required state
  isAuthModalOpen: boolean;
  authModalRedirectPath: string | null;

  // Actions
  setAuth: (response: AuthResponse) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      isAuthModalOpen: false,
      authModalRedirectPath: null,

      setAuth: (response: AuthResponse) =>
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isAuthModalOpen: false,
        }),

      updateUser: (user: User) =>
        set({
          user,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAuthModalOpen: false,
          authModalRedirectPath: null,
        }),

      openAuthModal: (redirectPath?: string) =>
        set({
          isAuthModalOpen: true,
          authModalRedirectPath: redirectPath || null,
        }),

      closeAuthModal: () =>
        set({
          isAuthModalOpen: false,
          authModalRedirectPath: null,
        }),
    }),
    {
      name: 'cineplex-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
