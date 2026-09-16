"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentAdmin,
  login as loginRequest,
  logout as logoutRequest,
} from "@/lib/api/auth";

import type { Admin, LoginRequest } from "@/types/auth";

interface AuthContextValue {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<Admin>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<Admin | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async (): Promise<Admin | null> => {
    try {
      const response = await getCurrentAdmin();
      setAdmin(response.admin);
      return response.admin;
    } catch {
      setAdmin(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (data: LoginRequest): Promise<Admin> => {
      await loginRequest(data);

      const authenticatedAdmin = await refreshAuth();

      if (!authenticatedAdmin) {
        throw new Error("Login berhasil, tetapi data admin tidak dapat dimuat.");
      }

      return authenticatedAdmin;
    },
    [refreshAuth],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
        await logoutRequest();
    } finally {
        setAdmin(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const response = await getCurrentAdmin();

        if (mounted) {
          setAdmin(response.admin);
        }
      } catch {
        if (mounted) {
          setAdmin(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isLoading,
      isAuthenticated: admin !== null,
      login,
      logout,
      refreshAuth,
    }),
    [admin, isLoading, login, logout, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}