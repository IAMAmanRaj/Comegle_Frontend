import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id?: string;
  full_name?: string;
  username?: string;
  email?: string;
  gender?: string;
  country?: string;
  age?: number;
  avatar_url?: string;
  bio?: string;
  tags?: string[];
  college?: {
    id: string;
    name: string;
    email_domain?: string;
    country?: string;
    state?: string;
  };
  socialLinks?: {
    linked_in?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  selectedCommunity: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedCommunity: (community: string | null) => void;
  reset: () => void;
  _hydrated: boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedCommunity: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setSelectedCommunity: (community) => set({ selectedCommunity: community }),
      reset: () => set({ user: null, token: null, selectedCommunity: null }),
      _hydrated: false,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedCommunity: state.selectedCommunity,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);