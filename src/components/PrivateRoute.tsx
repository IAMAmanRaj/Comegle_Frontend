import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";

export const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  //destructure token and setUser and setToken in one line

  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const resetStore = (useAuthStore.getState() as any).reset;

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/user/session");
        if (cancelled) return;

        if (res.data?.success) {
          const { user, accessToken } = res.data.data;
          setUser(user);
          setToken(accessToken);
        } else {
          handleAuthFailure("Unauthorized");
          return;
        }
      } catch (err) {
        if (cancelled) return;
        const axErr = err as AxiosError<any>;
        const status = axErr?.response?.status;
        const message = axErr?.response?.data?.message;

        if (status === 403) {
          handleAuthFailure(message);
          return;
        } else {
          toast.dismiss();
          toast.error("Failed to establish session");
          logoutAndRedirect();
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAuthFailure(message?: string) {
    toast.dismiss();
    switch (message) {
      case "Token Not Present":
        toast.error("Invalid Token");
        break;
      case "Invalid Refresh Token":
        toast.error("Session Timed Out");
        break;
      case "Refresh Token Not Present":
        toast.error("Session Not Found");
        break;
      default:
        toast.error("Unauthorized");
        break;
    }
    logoutAndRedirect();
  }

  function logoutAndRedirect() {
    if (resetStore) resetStore();
    // tiny timeout to let toast paint (optional)
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 10);
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};
