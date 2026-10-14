import { AdminProgram } from "@/types/programs";
import { apiFetch } from "../client";

export async function getPrograms(options: { signal?: AbortSignal } = {}) {
  return apiFetch<AdminProgram[]>("/admin/programs", {
    method: "GET",
    signal: options.signal,
  });
}