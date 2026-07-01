'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { refreshSession, logout as apiLogout, setupFetchInterceptor } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error", err);
    }
    setToken(null);
    setUser(null);
  };

  // Attempt to refresh session on mount and initialize interceptor
  useEffect(() => {
    setupFetchInterceptor(setToken, logout);

    const initAuth = async () => {
      try {
        const res = await refreshSession();
        if (res && res.success && res.token && res.user) {
          const parsedUser = res.user;
          if (!parsedUser.phone) parsedUser.phone = "";
          setToken(res.token);
          setUser(parsedUser);
        }
      } catch (err) {
        // Refresh failed, no session
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Only runs once on mount

  // Handle background refresh and visibility change when logged in
  useEffect(() => {
    if (!token) return; // Do not run timer if not logged in

    const doRefresh = async () => {
      try {
        const res = await refreshSession();
        if (res && res.success && res.token) {
          setToken(res.token);
        }
      } catch (err) {
        console.error("Background token refresh failed", err);
      }
    };

    const interval = setInterval(doRefresh, 10 * 60 * 1000); // 10 minutes

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        doRefresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token]);

  const loginState = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // Update user profile (e.g., name, phone)
  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginState, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

