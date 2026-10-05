const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("himatkn_csrf="));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.substring("himatkn_csrf=".length));
}

async function ensureCsrfToken(): Promise<string> {
  const existingToken = getCsrfTokenFromCookie();

  if (existingToken) {
    return existingToken;
  }

  const response = await fetch(`${API_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = `CSRF initialization failed: ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Response bukan JSON.
    }

    throw new Error(message);
  }

  const csrfToken = getCsrfTokenFromCookie();

  if (!csrfToken) {
    throw new Error("CSRF token tidak ditemukan setelah inisialisasi.");
  }

  return csrfToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = await ensureCsrfToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Response bukan JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}