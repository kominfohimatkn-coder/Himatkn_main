const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ?? "";

const API_ORIGIN = (() => {
  if (!API_URL) return "";

  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * Backend mengembalikan URL media relatif (mis. `/api/v1/media/...`).
 * Resolver ini mengubahnya menjadi URL absolut tanpa mengubah path kontrak.
 */
export function resolveMediaUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const url = value.trim();

  if (!url) return null;

  if (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return API_ORIGIN ? `${API_ORIGIN}${url}` : null;
  }

  return API_URL ? `${API_URL}/${url.replace(/^\/+/, "")}` : null;
}
