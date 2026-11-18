
import { apiFetch, resetCsrfToken } from "./client";

import type {
  AuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
} from "@/types/auth";

/**
 * Login administrator.
 * Cache CSRF direset sebelum login dan setelah login berhasil.
 */
export async function login(
  data: LoginRequest,
): Promise<AuthResponse> {
  resetCsrfToken();

  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  resetCsrfToken();

  return response;
}

/**
 * Memeriksa sesi administrator yang sedang aktif.
 */
export function getCurrentAdmin(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/me", {
    method: "GET",
  });
}

/**
 * Mengganti kata sandi akun sendiri.
 * Backend mencabut sesi lain dan mempertahankan sesi saat ini.
 */
export function changePassword(
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Logout administrator.
 * Cache CSRF direset setelah request logout selesai,
 * baik berhasil maupun gagal.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", {
      method: "POST",
    });
  } finally {
    resetCsrfToken();
  }
}
