"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, ApiError } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "admin" | "intern";
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ devResetUrl?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api<{ ok: true; user: AuthUser }>("/api/auth/me");
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ ok: true; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const res = await api<{ ok: true; user: AuthUser }>("/api/auth/signup", {
        method: "POST",
        body: input,
      });
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await api<{ ok: true; message: string; devResetUrl?: string }>(
      "/api/auth/forgot-password",
      { method: "POST", body: { email } }
    );
    return { devResetUrl: res.devResetUrl };
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await api("/api/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refresh,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
