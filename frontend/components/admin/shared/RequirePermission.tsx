"use client";

import type { ReactNode } from "react";

import { Lock } from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { StateBlock } from "@/components/admin/shared/StateBlock";
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted">Memuat...</p>
      </div>
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
      <AdminPage>
        <div className="rounded-[4px] border border-line bg-white">
          <StateBlock
            icon={<Lock />}
            label="Akses ditolak"
            title="Anda tidak punya akses ke halaman ini"
            action={
              <ButtonLink href="/admin/dashboard" variant="outline">
                Kembali ke dashboard
              </ButtonLink>
            }
          >
            Hubungi superadmin bila Anda memerlukan akses ke halaman ini.
          </StateBlock>
        </div>
      </AdminPage>
    );
  }

  return <>{children}</>;
}