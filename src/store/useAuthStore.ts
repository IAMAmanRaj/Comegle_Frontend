import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  full_name?: string;
  username?: string;
  email?: string;
  gender?: string;
  age?: number;
  avatar_url?: string;
  college?: {
    id: string;
    name: string;
    email_domain?: string;
    country?: string;
    state?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  selectedCommunity: string | null; // <- persisted community name
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedCommunity: (community: string | null) => void; // <- setter
  reset: () => void;
  _hydrated: boolean; // internal flag to know when rehydration finished
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
      name: "auth-storage", // key in storage
      storage: createJSONStorage(() => localStorage), // default is localStorage; can swap to sessionStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedCommunity: state.selectedCommunity, // persist the community name
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // runs after rehydration
        state?.setHydrated();
      },
    }
  )
);