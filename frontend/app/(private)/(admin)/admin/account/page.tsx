"use client";

import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { useAuth } from "@/features/auth/AuthContext";
import { formatAdminLastLogin } from "@/features/accounts/format";

export default function AccountPage() {
  const { admin, isSuperadmin } = useAuth();

  if (!admin) return null;

  return (
    <main className="min-h-screen bg-bg-light text-ink">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="border-b border-paper-line pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Akun / Akun saya
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-bg-dark sm:text-4xl">
            Akun saya
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Informasi akun dan kata sandi Anda.
          </p>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-5">
          <section
            aria-labelledby="account-profile-title"
            className="border border-paper-line bg-bg-light p-5 sm:p-6 lg:col-span-2"
          >
            <h2
              id="account-profile-title"
              className="font-serif text-lg font-semibold text-bg-dark"
            >
              Profil
            </h2>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-bg-dark text-sm font-semibold text-white">
                {admin.username.trim().charAt(0).toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium text-bg-dark">
                  {admin.username}
                </p>

                <span
                  className={[
                    "mt-1 inline-flex items-center border px-2 py-0.5 text-xs font-medium",
                    isSuperadmin
                      ? "border-gold/50 bg-gold/10 text-ink"
                      : "border-paper-line bg-bg-light-2 text-ink-soft",
                  ].join(" ")}
                >
                  {isSuperadmin ? "Superadmin" : "Pengurus"}
                </span>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-paper-line border-t border-paper-line text-sm">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-ink-soft">Username</dt>
                <dd className="text-right font-medium text-ink">
                  {admin.username}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-ink-soft">Peran</dt>
                <dd className="text-right font-medium text-ink">
                  {isSuperadmin ? "Superadmin" : "Pengurus"}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-ink-soft">Login terakhir</dt>
                <dd className="text-right font-medium text-ink">
                  {formatAdminLastLogin(admin.last_login_at)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-ink-soft">Jumlah izin</dt>
                <dd className="text-right font-medium text-ink">
                  {admin.permissions.length} izin
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-5 text-ink-soft">
              Username dan peran hanya bisa diubah oleh superadmin.
            </p>
          </section>

          <section
            aria-labelledby="change-password-title"
            className="border border-paper-line bg-bg-light p-5 sm:p-6 lg:col-span-3"
          >
            <h2
              id="change-password-title"
              className="font-serif text-lg font-semibold text-bg-dark"
            >
              Ganti password
            </h2>

            <p className="mt-1 text-sm leading-6 text-ink-soft">
              Masukkan kata sandi saat ini untuk membuat kata sandi baru.
              Sesi di perangkat lain akan diakhiri.
            </p>

            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
