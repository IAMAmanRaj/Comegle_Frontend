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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  reset: () => void;
  _hydrated: boolean; // internal flag to know when rehydration finished
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      reset: () => set({ user: null, token: null }),
      _hydrated: false,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "auth-storage", // key in storage
      storage: createJSONStorage(() => localStorage), // default is localStorage; can swap to sessionStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // runs after rehydration
        state?.setHydrated();
      },
    }
  )
);
