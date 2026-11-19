import type {
  AdminAccount,
  PermissionCatalogResponse,
} from "./types";

const lastLoginFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Format tanggal login terakhir untuk daftar akun dan halaman Akun saya.
 */
export function formatAdminLastLogin(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Belum pernah login";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return lastLoginFormatter.format(date);
}

/**
 * Ringkasan izin akun berdasarkan label modul pada katalog.
 *
 * Izin yang selalu diberikan (`dashboard.view`) tidak dihitung agar akun tanpa
 * izin tambahan tidak menampilkan modul Dashboard seolah-olah pemberian
 * khusus.
 */
export function summarizeAccountPermissions(
  account: AdminAccount,
  catalog: PermissionCatalogResponse | null,
): string {
  if (!catalog) {
    return `${account.permissions.length} izin`;
  }

  const alwaysGranted = new Set(catalog.always_granted);
  const permissions = new Set(
    account.permissions.filter((name) => !alwaysGranted.has(name)),
  );

  const labels = catalog.items
    .filter(
      (module) =>
        module.available &&
        module.permissions.some((permission) =>
          permissions.has(permission.name),
        ),
    )
    .map((module) => module.label);

  return labels.length > 0 ? labels.join(", ") : "Hanya akses dasar";
}
