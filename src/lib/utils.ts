import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
const URL = import.meta.env.VITE_MAIN_SERVER_URL as string;

export const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

// Only attach the access token; no response interceptor needed now
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
