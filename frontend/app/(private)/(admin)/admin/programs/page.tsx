
"use client";

import { useAuth } from "@/context/AuthContext";
export default function ProgramsPage() {
  const { admin } = useAuth();

  if (!admin) {
    return null;
  }

  const hasPermission =
    admin.permissions.includes("programs.view");

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-950 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
            Admin HIMATKN
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Program Kerja
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Pengelolaan program kerja organisasi HIMATKN.
          </p>
        </header>

        <section className="mt-6 border border-zinc-200 p-6 sm:p-8">
          {!hasPermission ? (
            <>
              <h2 className="text-base font-semibold">
                Akses ditolak
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Akun kamu tidak memiliki permission{" "}
                <code className="font-mono text-zinc-900">
                  programs.view
                </code>
                .
              </p>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold">
                Halaman sedang disiapkan
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Halaman daftar, tambah, edit, dan hapus program
                kerja akan diintegrasikan pada tahap berikutnya.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
