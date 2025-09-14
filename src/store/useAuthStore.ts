import { create } from "zustand";

interface User {
  fullName?: string;
  username?: string;
  email?: string;
  gender?: string;
  age?: number;
  avatarUrl?: string;
  college?: {
    id: number;
    name: string;
    emailDomain?: string;
    country?: string;
    state?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
