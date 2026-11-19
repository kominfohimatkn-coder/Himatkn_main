"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/features/dashboard/admin-api";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}


export default function DashboardPage() {
  const { admin, can } = useAuth();
  const adminId = admin?.id ?? null;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const hasDashboardPermission = can(PERMISSIONS.DASHBOARD_VIEW);
  const canViewNews = can(PERMISSIONS.NEWS_VIEW);
  const canViewPrograms = can(PERMISSIONS.PROGRAMS_VIEW);
  const canViewOrganization = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canViewVisitors = can(PERMISSIONS.VISITOR_LOGS_VIEW);

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

  const cards = stats
    ? [
        ...(canViewNews
          ? [
              {
                key: "news",
                label: "Publikasi",
                value: stats.news_total,
                caption: "Total berita",
              },
            ]
          : []),
        ...(canViewPrograms
          ? [
              {
                key: "programs",
                label: "Program Kerja",
                value: stats.programs_total,
                caption: "Total program",
              },
            ]
          : []),
        ...(canViewOrganization
          ? [
              {
                key: "members",
                label: "Anggota",
                value: stats.members_total,
                caption: "Data pengurus",
              },
            ]
          : []),
        ...(canViewVisitors
          ? [
              {
                key: "visitors",
                label: "Pengunjung",
                value: stats.visitors_total,
                caption: "Total kunjungan",
              },
            ]
          : []),
      ]
    : [];

  const cardGridClass =
    cards.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : cards.length === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : cards.length === 2
          ? "sm:grid-cols-2"
          : "";

  const summaryItems = stats
    ? [
        ...(canViewNews
          ? [
              {
                key: "news",
                label: "Status Publikasi",
                value:
                  stats.news_total > 0
                    ? "Website sudah memiliki publikasi."
                    : "Belum ada publikasi.",
              },
            ]
          : []),
        ...(canViewOrganization
          ? [
              {
                key: "organization",
                label: "Data Organisasi",
                value:
                  stats.members_total > 0
                    ? `${formatNumber(stats.members_total)} data anggota tersedia.`
                    : "Belum ada data anggota.",
              },
            ]
          : []),
      ]
    : [];

  return (
    <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
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
            {cards.length > 0 && (
              <section className={`mt-6 grid gap-4 ${cardGridClass}`}>
                {cards.map((card) => (
                  <div key={card.key} className="border border-zinc-200 p-5">
                    <p className="text-sm text-zinc-500">{card.label}</p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      {formatNumber(card.value)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      {card.caption}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {summaryItems.length > 0 && (
              <section className="mt-8 border border-zinc-200">
                <div className="border-b border-zinc-200 px-5 py-4">
                  <h2 className="text-sm font-semibold">Ringkasan</h2>
                </div>

                <div
                  className={`grid gap-0 ${
                    summaryItems.length > 1 ? "sm:grid-cols-2" : ""
                  }`}
                >
                  {summaryItems.map((item, index) => (
                    <div
                      key={item.key}
                      className={[
                        "px-5 py-4",
                        index < summaryItems.length - 1
                          ? "border-b border-zinc-200 sm:border-r sm:border-b-0"
                          : "",
                      ].join(" ")}
                    >
                      <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                        {item.label}
                      </p>

                      <p className="mt-2 text-sm text-zinc-700">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      </main>
    </RequirePermission>
  );
}