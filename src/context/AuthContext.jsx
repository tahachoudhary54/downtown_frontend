'use client';

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("downtown_token");
      const storedUser = localStorage.getItem("downtown_user");

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
    localStorage.setItem("downtown_token", newToken);
    localStorage.setItem("downtown_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("downtown_token");
    localStorage.removeItem("downtown_user");
  };

  // Update user profile (e.g., name, phone)
  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("downtown_user", JSON.stringify(updated));
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
