"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { Avatar } from "@/components/admin/shared/Avatar";
import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import { PageHead } from "@/components/admin/shared/PageHead";
import { formatAdminLastLogin } from "@/features/accounts/format";
import { useAuth } from "@/features/auth/AuthContext";
import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";

/** Halaman Akun Saya, mengikuti `viewAccount()` di Design/admin. */
export default function AccountPage() {
  const { admin, isSuperadmin } = useAuth();

  if (!admin) return null;

  const role = isSuperadmin ? "Superadmin" : "Pengurus";
  const profile: [string, string][] = [
    ["Username", admin.username],
    ["Peran", role],
    ["Login terakhir", formatAdminLastLogin(admin.last_login_at)],
    ["Izin", isSuperadmin ? "Semua izin" : `${admin.permissions.length} izin`],
  ];

  return (
    <AdminPage>
      <PageHead label="Akun" title="Akun Saya" description="Informasi akun dan kata sandi Anda." />

      <div className="grid items-start gap-5 min-[901px]:grid-cols-2">
        <Card title="Ubah kata sandi">
          <ChangePasswordForm />
        </Card>

        {/* Di ponsel profil tampil lebih dulu. */}
        <Card title="Profil" className="max-[900px]:order-first">
          <div className="flex items-center gap-3.5">
            <Avatar name={admin.username} size="xl" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-green-900">{admin.username}</p>
              <div className="mt-1.5">
                <Badge tone={isSuperadmin ? "green" : "mint"}>{role}</Badge>
              </div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-[110px_1fr] border-t border-line text-sm">
            {profile.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="border-b border-line py-2.5 text-muted">{label}</dt>
                <dd className="border-b border-line py-2.5 font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-xs text-muted">
            Username dan peran hanya bisa diubah oleh superadmin.
          </p>
        </Card>
      </div>
    </AdminPage>
  );
}