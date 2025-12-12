import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

type UserType = { id: string; email: string; roles?: string[] }

type AuthContextType = {
  user: UserType | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string | void>;
  logout: () => void;
  getUserRoles: () => Promise<string[]>;
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
  const [user, setUser] = useState<UserType | null>(() => {
  const id = localStorage.getItem("userId");
  const email = localStorage.getItem("userEmail");
  const rolesString = localStorage.getItem("userRoles"); // <-- store roles
  const roles = rolesString ? JSON.parse(rolesString) : [];
  return id && email ? { id, email ,roles} : null;
  });

  const login = async (email: string, password: string) => {
    const resp = await api.post("/api/Auth/login", { email, password });
    const { access, refresh } = resp.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("userEmail", email);
    
    const meResp = await api.get("/api/Auth/me", {
      headers: { Authorization: `Bearer ${access}` }
    });
    const me = meResp.data;
    localStorage.setItem("userId", me.id);
    setUser({ id: me.id, email: me.email, roles: me.roles });
    localStorage.setItem("userRoles", JSON.stringify(me.roles || [])); // <-- store roles
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

  const getUserRoles = async () =>{
    if (!user) return [];
    const resp =  await api.get(`/api/Admin/users`);
    const me = resp.data.find((u: any) => u.email === user.email);
    return me?.roles || [];
  }

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    const resp = await api.post(
      `/api/Auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(
        code
      )}&newPassword=${encodeURIComponent(newPassword)}`
    );
    return resp.status === 200;
  };
  

 useEffect(() => {}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        getUserRoles,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 