"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/features/dashboard/admin-api";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}


export default function DashboardPage() {
  const { admin } = useAuth();
  const adminId = admin?.id ?? null;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const hasDashboardPermission =
    admin?.permissions.includes("dashboard.view") ?? false;

useEffect(() => {
  if (adminId === null || !hasDashboardPermission) {
    return;
  }

    let active = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboardStats();

        if (active) {
          setStats(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Data dashboard gagal dimuat.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [adminId, hasDashboardPermission]);

  if (!admin) {
    return null;
  }

  if (!hasDashboardPermission) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">        
        <div className="mx-auto max-w-7xl">
          <section className="border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
              Akses Ditolak
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Dashboard tidak tersedia
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Akun kamu tidak memiliki permission{" "}
              <code className="font-mono text-zinc-900">
                dashboard.view
              </code>
              .
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-950 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
            Admin HIMATKN
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-zinc-600">
                Selamat datang kembali, {admin.username}.
              </p>
            </div>

            <p className="text-xs text-zinc-400">
              Ringkasan data organisasi
            </p>
          </div>
        </header>

        {isLoading && (
          <section className="mt-6">
            <div className="border border-zinc-200 p-6">
              <p className="text-sm text-zinc-500">
                Memuat data dashboard...
              </p>
            </div>
          </section>
        )}

        {!isLoading && error && (
          <section className="mt-6">
            <div className="border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                Gagal memuat dashboard
              </p>

              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </section>
        )}

        {!isLoading && !error && stats && (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="border border-zinc-200 p-5">
                <p className="text-sm text-zinc-500">Publikasi</p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatNumber(stats.news_total)}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Total berita
                </p>
              </div>

              <div className="border border-zinc-200 p-5">
                <p className="text-sm text-zinc-500">Program Kerja</p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatNumber(stats.programs_total)}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Total program
                </p>
              </div>

              <div className="border border-zinc-200 p-5">
                <p className="text-sm text-zinc-500">Anggota</p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatNumber(stats.members_total)}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Data pengurus
                </p>
              </div>

              <div className="border border-zinc-200 p-5">
                <p className="text-sm text-zinc-500">Agenda</p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatNumber(stats.agendas_total)}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Total agenda
                </p>
              </div>

              <div className="border border-zinc-200 p-5">
                <p className="text-sm text-zinc-500">Pengunjung</p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatNumber(stats.visitors_total)}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Total kunjungan
                </p>
              </div>
            </section>

            <section className="mt-8 border border-zinc-200">
              <div className="border-b border-zinc-200 px-5 py-4">
                <h2 className="text-sm font-semibold">Ringkasan</h2>
              </div>

              <div className="grid gap-0 sm:grid-cols-2">
                <div className="border-b border-zinc-200 px-5 py-4 sm:border-r">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                    Status Publikasi
                  </p>

                  <p className="mt-2 text-sm text-zinc-700">
                    {stats.news_total > 0
                      ? "Website sudah memiliki publikasi."
                      : "Belum ada publikasi."}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                    Data Organisasi
                  </p>

                  <p className="mt-2 text-sm text-zinc-700">
                    {stats.members_total > 0
                      ? `${formatNumber(stats.members_total)} data anggota tersedia.`
                      : "Belum ada data anggota."}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}