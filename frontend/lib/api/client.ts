// frontend/lib/api/client.ts

import { ApiError } from "./errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return API_URL;
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const inFlightGetRequests = new Map<string, Promise<unknown>>();

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let csrfRefreshPromise: Promise<string> | null = null;
let csrfGeneration = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function summarizeValidationDetail(detail: unknown[]): string {
  const messages = detail
    .slice(0, 3)
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      if (isRecord(entry) && typeof entry.msg === "string") {
        return entry.msg.trim();
      }

      return "";
    })
    .filter((message) => message.length > 0);

  if (messages.length === 0) {
    return "Data yang dikirim tidak valid.";
  }

  return `Data yang dikirim tidak valid: ${messages.join("; ")}`;
}

function readDetail(data: unknown): string | null {
  if (!isRecord(data) || !("detail" in data)) {
    return null;
  }

  const detail = data.detail;

  if (typeof detail === "string") {
    const trimmed = detail.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(detail)) {
    return summarizeValidationDetail(detail);
  }

  return null;
}

function readFieldErrors(
  data: unknown,
): Record<string, string> | undefined {
  if (!isRecord(data) || !("errors" in data)) {
    return undefined;
  }

  const raw = data.errors;

  if (!isRecord(raw)) {
    return undefined;
  }

  const entries = Object.entries(raw).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string",
  );

  return entries.length > 0
    ? Object.fromEntries(entries)
    : undefined;
}

function readRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("Retry-After");

  if (!header) {
    return undefined;
  }

  const seconds = Number.parseInt(header, 10);

  return Number.isFinite(seconds) && seconds >= 0
    ? seconds
    : undefined;
}

async function fetchCsrfToken(): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}/auth/csrf`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError({
      status: 0,
      detail:
        "Tidak dapat mengambil token keamanan. Periksa koneksi kamu.",
    });
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      detail:
        readDetail(data) ??
        `Inisialisasi CSRF gagal (${response.status}).`,
    });
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("csrf_token" in data) ||
    typeof data.csrf_token !== "string" ||
    data.csrf_token.length === 0
  ) {
    throw new ApiError({
      status: response.status,
      detail: "Token CSRF tidak ditemukan pada respons backend.",
    });
  }

  return data.csrf_token;
}

function getCsrfToken(): Promise<string> {
  if (csrfToken !== null) {
    return Promise.resolve(csrfToken);
  }

  if (csrfPromise !== null) {
    return csrfPromise;
  }

  const generation = csrfGeneration;

  const pending = fetchCsrfToken()
    .then((token) => {
      if (generation === csrfGeneration) {
        csrfToken = token;
      }

      return token;
    })
    .finally(() => {
      if (csrfPromise === pending) {
        csrfPromise = null;
      }
    });

  csrfPromise = pending;

  return pending;
}

function refreshCsrfToken(rejectedToken: string): Promise<string> {
  if (csrfRefreshPromise !== null) {
    return csrfRefreshPromise;
  }

  if (csrfToken !== null && csrfToken !== rejectedToken) {
    return Promise.resolve(csrfToken);
  }

  const generation = csrfGeneration;

  const pending = fetchCsrfToken()
    .then((token) => {
      if (generation === csrfGeneration) {
        csrfToken = token;
      }

      return token;
    })
    .finally(() => {
      if (csrfRefreshPromise === pending) {
        csrfRefreshPromise = null;
      }
    });

  csrfRefreshPromise = pending;

  return pending;
}

/**
 * Mengosongkan cache token CSRF.
 * Fungsi ini tidak menghapus cookie browser secara langsung.
 */
export function resetCsrfToken(): void {
  csrfGeneration += 1;
  csrfToken = null;
  csrfPromise = null;
  csrfRefreshPromise = null;
}

async function readErrorResponse(
  response: Response,
): Promise<ApiError> {
  const data: unknown = await response.json().catch(() => null);

  return new ApiError({
    status: response.status,
    detail:
      readDetail(data) ??
      `Permintaan API gagal (${response.status}).`,
    errors: readFieldErrors(data),
    retryAfter: readRetryAfter(response),
  });
}

async function request<T>(
  path: string,
  options: RequestInit,
  isRetry: boolean,
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const requiresCsrf = UNSAFE_METHODS.has(method);
  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (
    options.body !== undefined &&
    options.body !== null &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let usedCsrfToken: string | null = null;

  if (requiresCsrf) {
    usedCsrfToken = await getCsrfToken();
    headers.set("X-CSRF-Token", usedCsrfToken);
  }

  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError({
      status: 0,
      detail:
        "Tidak dapat terhubung ke server. Periksa koneksi kamu.",
    });
  }

  if (!response.ok) {
    const apiError = await readErrorResponse(response);

    const isCsrfFailure =
      response.status === 403 && /\bcsrf\b/i.test(apiError.message);

    if (
      requiresCsrf &&
      isCsrfFailure &&
      !isRetry &&
      usedCsrfToken !== null
    ) {
      await refreshCsrfToken(usedCsrfToken);

      return request<T>(path, options, true);
    }

    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Fungsi utama untuk seluruh modul API.
 *
 * GET biasa yang berjalan bersamaan dapat berbagi Promise.
 * Request dengan AbortSignal atau opsi khusus tidak dideduplikasi.
 */
export function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const canDeduplicate =
    typeof window !== "undefined" &&
    method === "GET" &&
    options.signal === undefined &&
    options.body === undefined &&
    options.headers === undefined &&
    options.cache === undefined &&
    options.mode === undefined &&
    options.redirect === undefined &&
    options.referrer === undefined &&
    options.referrerPolicy === undefined &&
    options.integrity === undefined &&
    options.keepalive === undefined;

  if (!canDeduplicate) {
    return request<T>(path, options, false);
  }

  const key = `${method}:${path}`;
  const existing = inFlightGetRequests.get(key);

  if (existing) {
    return existing as Promise<T>;
  }


  const pending = request<T>(path, options, false).finally(() => {
    if (inFlightGetRequests.get(key) === pending) {
      inFlightGetRequests.delete(key);
    }
  });

  inFlightGetRequests.set(key, pending);

  return pending;
}