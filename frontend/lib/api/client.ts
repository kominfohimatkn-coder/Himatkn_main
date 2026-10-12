
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const inFlightGetRequests = new Map<string, Promise<unknown>>();

/**
 * Menyimpan Promise agar request mutasi yang berjalan bersamaan
 * menggunakan satu proses pengambilan token CSRF.
 */
let csrfPromise: Promise<string> | null = null;

/**
 * Mengambil token CSRF dari backend.
 */
async function fetchCsrfToken(): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
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

/**
 * Mendapatkan token CSRF.
 * Request yang bersamaan berbagi Promise yang sama.
 * Promise yang gagal dibuang agar bisa dicoba kembali.
 */
function getCsrfToken(): Promise<string> {
  if (csrfPromise) {
    return csrfPromise;
  }

  const pending: Promise<string> = fetchCsrfToken().catch(
    (error: unknown) => {
      if (csrfPromise === pending) {
        csrfPromise = null;
      }

      throw error;
    },
  );

  csrfPromise = pending;
  return pending;
}

/**
 * Mengosongkan cache token CSRF.
 * Cookie browser tidak dihapus oleh fungsi ini.
 */
export function resetCsrfToken(): void {
  csrfPromise = null;
}

/**
 * Membaca pesan error backend.
 */
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

/**
 * Menjalankan request API.
 *
 * Retry hanya dilakukan satu kali jika backend secara eksplisit
 * menyatakan bahwa request ditolak karena CSRF.
 */
async function request<T>(
  path: string,
  options: RequestInit,
  isRetry: boolean,
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const requiresCsrf = UNSAFE_METHODS.has(method);
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresCsrf) {
    const token = await getCsrfToken();
    headers.set("X-CSRF-Token", token);
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

    if (requiresCsrf && isCsrfFailure && !isRetry) {
      resetCsrfToken();

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
 * Fungsi utama yang digunakan oleh seluruh modul API.
 */
export function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  // Deduplikasi hanya untuk GET biasa di browser.
  // Request dengan AbortSignal tidak digabung agar mekanisme
  // pembatalan request tetap berfungsi sesuai pemiliknya.
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
