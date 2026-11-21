"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  ListChecks,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { Badge, type BadgeTone } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/features/dashboard/admin-api";
import { getAdminNews } from "@/features/news/admin-api";
import type { AdminNews, NewsStatus } from "@/features/news/types";
import { getPublicOrganization } from "@/features/organization/public-api";
import { relativeTime } from "@/lib/relative-time";

/** `NEWS_STATUS` di Design/admin/assets/admin.js. */
const newsStatus: Record<NewsStatus, [string, BadgeTone]> = {
  published: ["Terbit", "green"],
  draft: ["Draft", "amber"],
  archived: ["Arsip", "grey"],
};

const numberFormat = new Intl.NumberFormat("id-ID");

function StatSkeleton() {
  return (
    <div className="h-[110px] animate-pulse rounded-[4px] border border-line bg-white" />
  );
}

/** Dashboard mengikuti `viewDashboard()` di Design/admin/assets/admin.js. */
export default function DashboardPage() {
  const { admin, can, isSuperadmin } = useAuth();

  const canViewNews = can(PERMISSIONS.NEWS_VIEW);
  const canViewPrograms = can(PERMISSIONS.PROGRAMS_VIEW);
  const canViewOrganization = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canViewVisitors = can(PERMISSIONS.VISITOR_LOGS_VIEW);
  const canCreateNews = can(PERMISSIONS.NEWS_CREATE);
  const canManageOrganization = can(PERMISSIONS.ORGANIZATION_MANAGE);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latest, setLatest] = useState<AdminNews[]>([]);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!admin) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const [statsResult, newsResult, organization] = await Promise.all([
          getDashboardStats({ signal }),
          canViewNews
            ? getAdminNews({ limit: 5 }, { signal })
            : Promise.resolve(null),
          getPublicOrganization({ signal }).catch(() => null),
        ]);

        if (signal.aborted) return;

        setStats(statsResult);
        setLatest(newsResult?.items ?? []);
        setPeriodName(organization?.period?.name ?? null);
      } catch (loadError) {
        if (signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Data dashboard gagal dimuat.",
        );
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [admin, canViewNews, reloadKey]);

  if (!admin) return null;

  const statCards = stats
    ? [
        canViewNews && {
          href: "/admin/news",
          label: "Publikasi",
          value: stats.news_total,
          icon: <FileText />,
        },
        canViewPrograms && {
          href: "/admin/programs",
          label: "Program kerja",
          value: stats.programs_total,
          icon: <ListChecks />,
        },
        canViewOrganization && {
          href: "/admin/organization",
          label: "Anggota (semua periode)",
          value: stats.members_total,
          icon: <Users />,
        },
        canViewVisitors && {
          href: "/admin/visitor-logs",
          label: "Kunjungan",
          value: stats.visitors_total,
          icon: <BarChart3 />,
        },
      ].filter((card) => card !== false)
    : [];

  const quickActions = [
    canCreateNews && { href: "/admin/news/new", label: "Tulis publikasi" },
    canManageOrganization && {
      href: "/admin/organization",
      label: "Tambah anggota",
    },
  ].filter((action) => action !== false);

  return (
    <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
      <AdminPage>
        {/* `.hero-card` */}
        <section className="relative mb-4 flex flex-wrap items-end justify-between gap-6 overflow-hidden rounded-[4px] bg-green-950 px-7 py-[26px] text-white after:absolute after:-top-[60px] after:-right-[60px] after:size-60 after:rounded-full after:border after:border-line-on-dark after:shadow-[0_0_0_40px_rgba(28,61,49,0.25),0_0_0_80px_rgba(28,61,49,0.15)]">
          <div className="relative z-10">
            <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-on-dark-muted uppercase">
              {periodName ? `Periode aktif ${periodName}` : "Belum ada periode aktif"}
            </p>
            <h1 className="mt-2.5 font-serif text-[26px] leading-[1.25] font-bold text-white">
              Selamat datang, {admin.username}
            </h1>
            <p className="mt-1.5 text-on-dark-muted">
              Anda masuk sebagai{" "}
              <strong className="text-white">
                {isSuperadmin ? "Superadmin" : "Admin"}
              </strong>
              .
            </p>
          </div>

          {quickActions.length > 0 ? (
            <div className="relative z-10 flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border px-4 text-[11.5px] leading-none font-semibold tracking-[0.08em] uppercase no-underline transition-colors [&_svg]:size-[15px] ${
                    index === 0
                      ? "border-transparent bg-white text-green-900 hover:bg-mint"
                      : "border-white/35 bg-transparent text-white hover:border-white hover:bg-white/5"
                  }`}
                >
                  <Plus aria-hidden="true" />
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <Card>
            <StateBlock
              tone="error"
              icon={<TriangleAlert />}
              label="Gagal memuat"
              title="Data dashboard tidak dapat ditampilkan"
              action={
                <Button
                  variant="outline"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Coba lagi
                </Button>
              }
            >
              {error}
            </StateBlock>
          </Card>
        ) : (
          <>
            {/* `.grid--stats` */}
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
              {isLoading
                ? [0, 1, 2, 3].map((item) => <StatSkeleton key={item} />)
                : statCards.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="block rounded-[4px] border border-line bg-white px-[18px] pt-[18px] pb-4 no-underline transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_8px_22px_rgba(6,38,27,0.06)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted-light uppercase">
                          {card.label}
                        </span>
                        <span className="grid size-8 place-items-center rounded-full bg-mint text-green-800 [&_svg]:size-4">
                          {card.icon}
                        </span>
                      </div>
                      <div className="mt-4 font-serif text-[30px] leading-[1.1] font-bold text-green-900">
                        {numberFormat.format(card.value)}
                      </div>
                    </Link>
                  ))}
            </div>

            {canViewNews ? (
              <Card
                title="Publikasi terbaru"
                bodyClassName="p-0"
                action={
                  <ButtonLink href="/admin/news" variant="ghost" size="sm">
                    Lihat semua
                  </ButtonLink>
                }
              >
                {isLoading ? (
                  <div className="space-y-3 p-5">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded bg-green-900/5"
                      />
                    ))}
                  </div>
                ) : latest.length === 0 ? (
                  <StateBlock
                    icon={<FileText />}
                    title="Belum ada publikasi"
                    action={
                      canCreateNews ? (
                        <ButtonLink href="/admin/news/new">Tulis publikasi</ButtonLink>
                      ) : undefined
                    }
                  >
                    Publikasi pertama akan muncul di sini.
                  </StateBlock>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {latest.map((news) => {
                      const [statusLabel, statusTone] = newsStatus[news.status];

                      return (
                        <li
                          key={news.id}
                          className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-b-0"
                        >
                          <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-line bg-mint-50 text-green-800 [&_svg]:size-3.5">
                            <FileText aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/admin/news/${news.id}`}
                              className="font-medium text-ink no-underline hover:text-green-800 hover:underline"
                            >
                              {news.title}
                            </Link>
                            <div className="mt-0.5 text-xs text-muted">
                              Diperbarui {relativeTime(news.updated_at)}
                            </div>
                          </div>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            ) : null}
          </>
        )}
      </AdminPage>
    </RequirePermission>
  );
}