
"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getAdminNews } from "@/lib/api/admin/news";
import type {
  AdminNews,
  NewsStatus,
  NewsListResponse,
} from "@/types/news";

const PAGE_SIZE = 20;

type StatusFilter = "all" | NewsStatus;

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: NewsStatus): string {
  const labels: Record<NewsStatus, string> = {
    draft: "Draft",
    published: "Terbit",
    archived: "Arsip",
  };

  return labels[status];
}

function getStatusClass(status: NewsStatus): string {
  const classes: Record<NewsStatus, string> = {
    draft: "bg-amber-50 text-amber-800",
    published: "bg-emerald-50 text-emerald-800",
    archived: "bg-zinc-100 text-zinc-600",
  };

  return classes[status];
}

export default function NewsPage() {
  const { admin } = useAuth();

  const [response, setResponse] =
    useState<NewsListResponse<AdminNews> | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const canViewNews =
    admin?.permissions.includes("news.view") ?? false;

  const loadNews = useCallback(
    async (
      requestedOffset: number,
      requestedStatus: StatusFilter,
      showLoading = true,
    ) => {
      if (showLoading) {
        setIsLoading(true);
        setError("");
      }

      try {
        const data = await getAdminNews({
          offset: requestedOffset,
          limit: PAGE_SIZE,
          ...(requestedStatus !== "all"
            ? { status: requestedStatus }
            : {}),
        });

        setResponse(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Daftar berita gagal dimuat.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

    useEffect(() => {
    if (!admin || !canViewNews) return;

    let active = true;

    async function loadInitialNews() {
        try {
        const data = await getAdminNews({
            offset: 0,
            limit: PAGE_SIZE,
        });

        if (active) {
            setResponse(data);
            setError("");
        }
        } catch (err) {
        if (active) {
            setError(
            err instanceof Error
                ? err.message
                : "Daftar berita gagal dimuat.",
            );
        }
        } finally {
        if (active) {
            setIsLoading(false);
        }
        }
    }

    void loadInitialNews();

    return () => {
        active = false;
    };
    }, [admin, canViewNews]);

  if (!admin) return null;

  if (!canViewNews) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
              Akses ditolak
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Daftar berita tidak tersedia
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Akun kamu tidak memiliki permission{" "}
              <code className="font-mono text-zinc-900">
                news.view
              </code>
              .
            </p>
          </section>
        </div>
      </main>
    );
  }

  const currentOffset = response?.offset ?? 0;
  const currentItems = response?.items ?? [];

  const canGoPrevious = currentOffset > 0;
  const canGoNext = currentItems.length === PAGE_SIZE;

  const currentPage =
    Math.floor(currentOffset / PAGE_SIZE) + 1;

  function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const nextStatus = event.target.value as StatusFilter;

    setStatusFilter(nextStatus);
    void loadNews(0, nextStatus);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-950 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
            Admin HIMATKN
          </p>

          <div className="mt-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Berita
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Kelola dan pantau publikasi berita organisasi.
            </p>
          </div>
        </header>

        <section className="mt-6">
          <div className="flex flex-col gap-4 border border-zinc-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-semibold">
                Daftar publikasi
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Data diambil langsung dari API berita admin.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:w-52">
              <label
                htmlFor="news-status"
                className="text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Filter status
              </label>

              <select
                id="news-status"
                value={statusFilter}
                onChange={handleStatusChange}
                disabled={isLoading}
                className="min-h-11 border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-600 disabled:cursor-not-allowed disabled:bg-zinc-50"
              >
                <option value="all">Semua status</option>
                <option value="draft">Draft</option>
                <option value="published">Terbit</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
          </div>
        </section>

        {isLoading && (
          <section className="mt-4 border border-zinc-200 p-6">
            <p className="text-sm text-zinc-500">
              Memuat daftar berita...
            </p>
          </section>
        )}

        {!isLoading && error && (
          <section
            role="alert"
            className="mt-4 border border-red-200 bg-red-50 p-5"
          >
            <h2 className="text-sm font-semibold text-red-800">
              Gagal memuat berita
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadNews(
                  currentOffset,
                  statusFilter,
                )
              }
              className="mt-4 min-h-10 border border-red-300 px-4 text-sm font-medium text-red-800 hover:bg-red-100"
            >
              Coba lagi
            </button>
          </section>
        )}

        {!isLoading && !error && response && (
          <section className="mt-4 border border-zinc-200">
            {currentItems.length === 0 ? (
              <div className="px-5 py-14 text-center sm:py-20">
                <h2 className="text-base font-semibold">
                  Belum ada berita
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Tidak ada berita yang cocok dengan status
                  yang dipilih.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-zinc-200 px-4 py-3 sm:px-5">
                  <p className="text-xs text-zinc-500">
                    Menampilkan {currentOffset + 1}–
                    {currentOffset + currentItems.length} pada
                    halaman {currentPage}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-170 border-collapse text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50">
                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Berita
                        </th>

                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Status
                        </th>

                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Tag
                        </th>

                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Diperbarui
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((news) => (
                        <tr
                          key={news.id}
                          className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/70"
                        >
                          <td className="px-5 py-4 align-top">
                            <p className="max-w-md text-sm font-medium text-zinc-900">
                              {news.title}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              /{news.slug} · ID {news.id}
                            </p>
                          </td>

                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-medium ${getStatusClass(news.status)}`}
                            >
                              {getStatusLabel(news.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4 align-top">
                            {news.tags.length > 0 ? (
                              <div className="flex max-w-56 flex-wrap gap-1.5">
                                {news.tags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="border border-zinc-200 px-2 py-1 text-xs text-zinc-600"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-zinc-400">
                                Tanpa tag
                              </span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-zinc-600">
                            {formatDate(
                              news.updated_at ??
                                news.created_at,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 sm:px-5">
                  <p className="text-xs text-zinc-500">
                    Halaman {currentPage}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!canGoPrevious || isLoading}
                      onClick={() =>
                        void loadNews(
                          Math.max(0, currentOffset - PAGE_SIZE),
                          statusFilter,
                        )
                      }
                      className="min-h-10 border border-zinc-300 px-3 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>

                    <button
                      type="button"
                      disabled={!canGoNext || isLoading}
                      onClick={() =>
                        void loadNews(
                          currentOffset + PAGE_SIZE,
                          statusFilter,
                        )
                      }
                      className="min-h-10 border border-zinc-300 px-3 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
