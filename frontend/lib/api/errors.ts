// frontend/lib/api/errors.ts

export interface ApiErrorOptions {
  /**
   * HTTP status code, atau 0 bila request gagal sebelum mendapat respons
   * (misalnya masalah jaringan).
   */
  status: number;
  /** Pesan aman yang juga dipakai sebagai `message`. */
  detail: string;
  /** Error per-field dari respons 422 PATCH settings. */
  errors?: Record<string, string>;
  /** Detik tunggu dari header `Retry-After` pada respons 429. */
  retryAfter?: number;
}

/**
 * Error terstruktur untuk seluruh pemanggilan API.
 *
 * `message` sengaja tetap sama dengan pesan sebelumnya agar pemanggil lama
 * tidak berubah perilakunya. Gunakan `detail`/`status` untuk membedakan
 * jenis kegagalan.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;
  readonly errors?: Record<string, string>;
  readonly retryAfter?: number;

  constructor(options: ApiErrorOptions) {
    super(options.detail);

    this.name = "ApiError";
    this.status = options.status;
    this.detail = options.detail;
    this.errors = options.errors;
    this.retryAfter = options.retryAfter;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export function isUnauthorized(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return isApiError(error) && error.status === 403;
}

export function isRateLimited(error: unknown): boolean {
  return isApiError(error) && error.status === 429;
}
