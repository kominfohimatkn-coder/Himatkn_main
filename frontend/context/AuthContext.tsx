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

/**
 * Satu sumber logika untuk membaca admin aktif.
 * Error autentikasi atau request menghasilkan null.
 */
async function readCurrentAdmin(): Promise<Admin | null> {
  try {
    const response = await getCurrentAdmin();
    return response.admin;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh sesi jika memang dibutuhkan.
   */
  const refreshAuth = useCallback(async (): Promise<Admin | null> => {
    const currentAdmin = await readCurrentAdmin();

    setAdmin(currentAdmin);

    return currentAdmin;
  }, []);

  /**
   * Login menggunakan data admin dari respons login.
   * Tidak perlu meminta /auth/me sekali lagi.
   */
  const login = useCallback(
    async (data: LoginRequest): Promise<Admin> => {
      const response = await loginRequest(data);

      setAdmin(response.admin);

      return response.admin;
    },
    [],
  );

  /**
   * Logout tetap membersihkan state lokal meskipun request gagal.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      setAdmin(null);
    }
  }, []);

  /**
   * Inisialisasi autentikasi saat provider dipasang.
   */
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const currentAdmin = await readCurrentAdmin();

      if (!mounted) {
        return;
      }

      setAdmin(currentAdmin);
      setIsLoading(false);
    }

    void initializeAuth();

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}