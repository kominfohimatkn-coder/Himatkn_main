import { apiFetch } from "./client";
import type { AuthResponse, LoginRequest } from "@/types/auth";

export function login(data: LoginRequest) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentAdmin() {
  return apiFetch<AuthResponse>("/auth/me", {
    method: "GET",
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}