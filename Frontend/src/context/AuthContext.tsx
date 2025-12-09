import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

type AuthContextType = {
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string | void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only set "user" when actually logged in.
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    return id && email ? { id, email } : null;
  });

  useEffect(() => {
    // Optionally refresh tokens or validate on load.
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.post("/api/Auth/login", { email, password });
    const { access, refresh } = resp.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("userEmail", email);
    // Try to preserve userId if backend returned it previously (or keep empty until you provide /me)
    const storedUserId = localStorage.getItem("userId") ?? "";
    setUser({ id: storedUserId, email });
  };

  const register = async (name: string, email: string, password: string) => {
    const resp = await api.post("/api/Auth/register", { name, email, password });
    // returns { userId, message }
    if (resp.data?.userId) {
      // store temporary pending values until verification
      localStorage.setItem("pendingUserId", resp.data.userId);
      localStorage.setItem("pendingUserEmail", email);
      return resp.data.userId;
    }
    return;
  };

  const logout = () => {
    const refresh = localStorage.getItem("refreshToken");
    if (refresh) {
      api.post("/api/Auth/revoke", refresh).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("pendingUserId");
    localStorage.removeItem("pendingUserEmail");
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    // backend expects string in body - axios will send JSON string if passed directly
    await api.post("/api/Auth/forgot-password", email);
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    const resp = await api.post(
      `/api/Auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(
        code
      )}&newPassword=${encodeURIComponent(newPassword)}`
    );
    return resp.status === 200;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 