import { applyPermissionImplications } from "./api";

import type {
  AdminAccount,
  PermissionCatalogResponse,
} from "./types";

/**
 * Nama izin yang tercentang karena implikasi izin lain.
 */
export function getImpliedPermissionNames(
  selected: readonly string[],
  catalog: PermissionCatalogResponse,
): Set<string> {
  const implied = new Set<string>();

  for (const name of selected) {
    for (const target of applyPermissionImplications([name], catalog)) {
      if (target !== name) {
        implied.add(target);
      }
    }
  }

  return implied;
}

/**
 * Pilihan awal checklist untuk akun yang sudah ada.
 *
 * `GET /admin/admins` mengirim izin efektif, sehingga izin turunan tidak dapat
 * dibedakan dari izin langsung. Izin yang hanya muncul karena implikasi izin
 * lain tidak dimasukkan sebagai pilihan manual agar dapat ikut dilepas saat
 * izin induknya dilepas.
 */
export function getInitialManualPermissions(
  account: AdminAccount | undefined,
  catalog: PermissionCatalogResponse,
): string[] {
  if (!account || account.is_superadmin) {
    return [];
  }

  const alwaysGranted = new Set(catalog.always_granted);
  const effective = account.permissions.filter(
    (name) => !alwaysGranted.has(name),
  );
  const implied = getImpliedPermissionNames(effective, catalog);

  return effective.filter((name) => !implied.has(name));
}

/**
 * Daftar izin yang dikirim ke backend: hasil ekspansi implikasi tanpa izin
 * yang selalu diberikan.
 */
export function getPayloadPermissions(
  selected: readonly string[],
  catalog: PermissionCatalogResponse,
): string[] {
  const alwaysGranted = new Set(catalog.always_granted);

  return applyPermissionImplications(selected, catalog).filter(
    (name) => !alwaysGranted.has(name),
  );
}
