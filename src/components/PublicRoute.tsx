import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function isAuthenticated() {
  const token = useAuthStore.getState().token;
  return !!token;
}

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return isAuthenticated() ? (
    <Navigate to="/landing" state={{ from: location }} replace />
  ) : (
    <>{children}</>
  );
};