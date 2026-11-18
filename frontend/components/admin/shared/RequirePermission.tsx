"use client";

import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import type { PermissionName } from "@/features/auth/permissions";

export type RequirePermissionProps = {
  permission?: PermissionName;
  anyOf?: readonly PermissionName[];
  superadminOnly?: boolean;
  children: ReactNode;
};

/**
 * Pembungkus halaman admin. Tidak melakukan redirect otomatis saat akses
 * ditolak; pengguna diberi panel dan tombol menuju Dashboard.
 */
export function RequirePermission({
  permission,
  anyOf,
  superadminOnly = false,
  children,
}: RequirePermissionProps) {
  const { can, isSuperadmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="admin-theme flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Memuat...</p>
      </main>
    );
  }

  const hasRequiredPermission = permission
    ? can(permission)
    : anyOf
      ? anyOf.some((name) => can(name))
      : true;

  const allowed =
    (!superadminOnly || isSuperadmin) &&
    (isSuperadmin || hasRequiredPermission);

  if (!allowed) {
    return (
      <main className="admin-theme min-h-screen bg-bg-light px-4 py-8 text-ink">
        <section className="mx-auto max-w-5xl border border-paper-line bg-paper p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase">
            Akses ditolak
          </p>

          <h1 className="mt-3 font-serif text-2xl font-semibold text-bg-dark sm:text-3xl">
            Anda tidak memiliki akses ke halaman ini
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Hubungi administrator jika Anda memerlukan akses ke halaman
            ini.
          </p>

          <div className="mt-5">
            <ButtonLink href="/admin/dashboard" variant="outline">
              Kembali ke Dashboard
            </ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
