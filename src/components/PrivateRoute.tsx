// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuthStore } from "../store/useAuthStore";
export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuthStore.getState();

 if (!token) {
    // 🚨 If not signed in, throw them back to /
    return <Navigate to="/" replace />;
  }

  return children;
};
