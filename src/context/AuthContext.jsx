'use client';

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem("downtown_token");
      const storedUser = sessionStorage.getItem("downtown_user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure phone field exists
        if (!parsedUser.phone) parsedUser.phone = "";
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch {}
    setLoading(false);
  }, []);

  const loginState = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    sessionStorage.setItem("downtown_token", newToken);
    sessionStorage.setItem("downtown_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("downtown_token");
    sessionStorage.removeItem("downtown_user");
  };

  // Update user profile (e.g., name, phone)
  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem("downtown_user", JSON.stringify(updated));
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
