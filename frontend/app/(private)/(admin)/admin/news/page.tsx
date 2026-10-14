
"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getAdminNews } from "@/lib/api/admin/news";

import type { AdminNews } from "@/types/news";

import NewsList, { type NewsStatusFilter, } from "@/components/admin/news/NewsList";
const PAGE_SIZE = 20;
const REQUEST_SIZE = PAGE_SIZE + 1;


export default function NewsPage() {
  const { admin } = useAuth();

  const canView = admin?.permissions.includes("news.view") ?? false;

  const [items, setItems] = useState<AdminNews[]>([]);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] =
    useState<NewsStatusFilter>("all");

  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    async function loadNews() {
      try {
        const result = await getAdminNews(
          {
            offset,
            limit: REQUEST_SIZE,
            ...(statusFilter !== "all"
              ? { status: statusFilter }
              : {}),
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        setItems(result.items.slice(0, PAGE_SIZE));
        setHasNext(result.items.length > PAGE_SIZE);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Daftar berita gagal dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadNews();

    return () => controller.abort();
  }, [canView, offset, statusFilter, refreshKey]);

  function reloadNews() {
    setError("");
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function changeStatus(status: NewsStatusFilter) {
    setError("");
    setIsLoading(true);
    setOffset(0);
    setStatusFilter(status);
  }

  function changePage(nextOffset: number) {
    setError("");
    setIsLoading(true);
    setOffset(Math.max(0, nextOffset));
  }

  if (!admin) return null;

  if (!canView) {
    return (
      <main className="min-h-screen bg-bg-light px-4 py-8 text-ink">
        <section className="mx-auto max-w-5xl border border-paper-line p-6">
          <h1 className="font-serif text-2xl font-semibold text-bg-dark">
            Akses tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Akun ini belum memiliki izin news.view untuk melihat berita.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="border-b border-paper-line pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Konten / Publikasi
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-bg-dark sm:text-4xl">
            Manajemen Berita
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Kelola dan pantau berita yang tersimpan dalam sistem.
          </p>
        </header>
        <NewsList
          items={items}
          isLoading={isLoading}
          listError={error}
          statusFilter={statusFilter}
          offset={offset}
          hasNextPage={hasNext}
          canCreate={false}
          onStatusChange={changeStatus}
          onReload={reloadNews}
          onCreate={() => {}}
          onPageChange={changePage}
          renderActions={() => null}
        />
      </div>
    </main>
  );
}
