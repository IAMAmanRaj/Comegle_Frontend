import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function isOnboarded() {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;
  
  if (!token && user ) return true;
  return false;
}

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // If user is NOT onboarded (i.e., user is null), navigate to /landing
  return isOnboarded() ? (
    <>{children}</>
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};