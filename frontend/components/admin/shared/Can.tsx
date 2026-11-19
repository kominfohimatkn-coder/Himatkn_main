"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import type { PermissionName } from "@/features/auth/permissions";

export type CanProps = {
  permission?: PermissionName;
  anyOf?: readonly PermissionName[];
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Menyembunyikan elemen (misalnya tombol) bila admin tidak punya izin.
 * Backend tetap menjadi penentu akhir; ini hanya gerbang tampilan.
 */
export function Can({
  permission,
  anyOf,
  fallback = null,
  children,
}: CanProps) {
  const { can, isSuperadmin } = useAuth();

  const allowed =
    isSuperadmin ||
    (permission
      ? can(permission)
      : anyOf
        ? anyOf.some((name) => can(name))
        : false);

  return <>{allowed ? children : fallback}</>;
}
