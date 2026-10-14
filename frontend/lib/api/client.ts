// frontend/lib/api/client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const inFlightGetRequests = new Map<string, Promise<unknown>>();

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let csrfRefreshPromise: Promise<string> | null = null;
let csrfGeneration = 0;

async function fetchCsrfToken(): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Tidak dapat mengambil token keamanan. Periksa koneksi kamu.",
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Inisialisasi CSRF gagal (${response.status}).`;

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      message = data.detail;
    }

    throw new Error(message);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("csrf_token" in data) ||
    typeof data.csrf_token !== "string" ||
    data.csrf_token.length === 0
  ) {
    throw new Error("Token CSRF tidak ditemukan pada respons backend.");
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

  let pending: Promise<string>;

  pending = fetchCsrfToken()
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

  let pending: Promise<string>;

  pending = fetchCsrfToken()
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

async function readErrorMessage(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);

  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return `Permintaan API gagal (${response.status}).`;
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
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Tidak dapat terhubung ke server. Periksa koneksi kamu.",
    );
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);

    const isCsrfFailure =
      response.status === 403 && /\bcsrf\b/i.test(message);

    if (
      requiresCsrf &&
      isCsrfFailure &&
      !isRetry &&
      usedCsrfToken !== null
    ) {
      await refreshCsrfToken(usedCsrfToken);

      return request<T>(path, options, true);
    }

    throw new Error(message);
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

  let pending: Promise<T>;

  pending = request<T>(path, options, false).finally(() => {
    if (inFlightGetRequests.get(key) === pending) {
      inFlightGetRequests.delete(key);
    }
  });

  inFlightGetRequests.set(key, pending);

  return pending;
}