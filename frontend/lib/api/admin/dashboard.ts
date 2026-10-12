import { apiFetch } from "../client";

export interface DashboardStats {
  news_total: number;
  programs_total: number;
  members_total: number;
  agendas_total: number;
  visitors_total: number;
}

export function getDashboardStats(options: { signal?: AbortSignal } = {}) {
  return apiFetch<DashboardStats>("/admin/dashboard", {
    method: "GET",
    signal: options.signal,
  });
}