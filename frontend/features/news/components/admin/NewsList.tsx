
import type { ReactNode } from "react";

import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";

import type { AdminNews, NewsStatus } from "../../types";

import { NewsListSkeleton } from "./NewsOverlays";
import {
  NewsTags,
  StatusBadge,
} from "./NewsPrimitives";

export type NewsStatusFilter = "all" | NewsStatus;

type NewsListProps = {
  items: AdminNews[];
  isLoading: boolean;
  listError: string;
  statusFilter: NewsStatusFilter;
  offset: number;
  hasNextPage: boolean;
  canCreate: boolean;
  onStatusChange: (status: NewsStatusFilter) => void;
  onReload: () => void;
  onCreate: () => void;
  onPageChange: (offset: number) => void;
  renderActions: (news: AdminNews) => ReactNode;
};

const styles = {
  secondary:
    "inline-flex min-h-12 items-center justify-center gap-2 border border-paper-line bg-bg-light px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/70 hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "Tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function NewsList({
  items,
  isLoading,
  listError,
  statusFilter,
  offset,
  hasNextPage,
  canCreate,
  onStatusChange,
  onReload,
  onCreate,
  onPageChange,
  renderActions,
}: NewsListProps) {
  const currentPage = Math.floor(offset / 20) + 1;
  const canPrevious = offset > 0;

  return (
    <section aria-labelledby="news-list-title" className="mt-6">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="news-list-title"
            className="font-serif text-lg font-semibold text-bg-dark"
          >
            Daftar berita
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs leading-5 text-ink-soft"
          >
            {isLoading
              ? "Memuat publikasi..."
              : `${items.length} berita pada halaman ini`}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:w-auto">
          <div className="sm:w-44">
            <FormField label="Status">
              <Select
                id="news-filter"
                value={statusFilter}
                onChange={(event) =>
                  onStatusChange(
                    event.target.value as NewsStatusFilter,
                  )
                }
                disabled={isLoading}
              >
                <option value="all">Semua status</option>
                <option value="draft">Draft</option>
                <option value="published">Terbit</option>
                <option value="archived">Arsip</option>
              </Select>
            </FormField>
          </div>

          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className={styles.secondary}
          >
            Muat ulang
          </button>
        </div>
      </div>

      <div
        aria-busy={isLoading}
        className="border border-paper-line bg-bg-light shadow-sm"
      >
        {isLoading ? (
          <NewsListSkeleton />
        ) : listError ? (
          <div role="alert" className="px-4 py-8 sm:px-6">
            <h3 className="text-sm font-semibold">
              Daftar berita belum dapat ditampilkan
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {listError}
            </p>

            <button
              type="button"
              onClick={onReload}
              className={`${styles.secondary} mt-4`}
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 sm:px-6 sm:py-16">
            <h3 className="font-serif text-xl font-semibold text-bg-dark">
              {offset > 0
                ? "Tidak ada berita di halaman ini"
                : "Belum ada berita"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
              {offset > 0
                ? "Kembali ke halaman sebelumnya untuk melihat berita yang tersedia."
                : "Berita yang tersedia akan ditampilkan di bagian ini."}
            </p>

            {canCreate && offset === 0 && (
              <button
                type="button"
                onClick={onCreate}
                className={`${styles.secondary} mt-5`}
              >
                Tambah berita
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Tampilan mobile */}
            <ul className="divide-y divide-paper-line lg:hidden">
              {items.map((news) => (
                <li key={news.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={news.status} />

                    <span className="text-xs text-ink-soft/75">
                      ID {news.id}
                    </span>
                  </div>

                  <h3 className="mt-2 wrap-break-word text-base font-semibold leading-6">
                    {news.title}
                  </h3>

                  <p className="mt-1 break-all text-xs leading-5 text-ink-soft/75">
                    /{news.slug}
                  </p>

                  <div className="mt-3">
                    <NewsTags tags={news.tags} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-paper-line/70 pt-3">
                    <p className="text-xs leading-5 text-ink-soft">
                      Diperbarui{" "}
                      {formatDate(news.updated_at ?? news.created_at)}
                    </p>

                    {renderActions(news)}
                  </div>
                </li>
              ))}
            </ul>

            {/* Tampilan desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  Daftar berita organisasi
                </caption>

                <thead className="border-b border-paper-line bg-bg-light">
                  <tr className="text-xs font-medium text-ink-soft">
                    <th scope="col" className="w-[40%] px-5 py-3">
                      Berita
                    </th>
                    <th scope="col" className="w-[12%] px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="w-[18%] px-4 py-3">
                      Tag
                    </th>
                    <th scope="col" className="w-[16%] px-4 py-3">
                      Diperbarui
                    </th>
                    <th
                      scope="col"
                      className="w-[14%] px-4 py-3 text-right"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-paper-line/70">
                  {items.map((news) => (
                    <tr
                      key={news.id}
                      className="hover:bg-bg-light-2/60"
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="wrap-break-word text-sm font-medium leading-6">
                          {news.title}
                        </p>

                        <p className="mt-1 break-all text-xs leading-5 text-ink-soft/75">
                          /{news.slug}
                        </p>

                        <p className="mt-1 text-xs text-ink-soft/75">
                          ID {news.id}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={news.status} />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <NewsTags tags={news.tags} />
                      </td>

                      <td className="px-4 py-4 align-top text-xs leading-5 text-ink-soft">
                        {formatDate(news.updated_at ?? news.created_at)}
                      </td>

                      <td className="px-2 py-2 align-top">
                        <div className="flex justify-end">
                          {renderActions(news)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoading && !listError && (
          <footer className="flex flex-col gap-3 border-t border-paper-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs leading-5 text-ink-soft">
              Halaman {currentPage}

              {items.length > 0 && (
                <span className="ml-2 text-ink-soft/75">
                  Data {offset + 1} sampai {offset + items.length}
                </span>
              )}
            </p>

            <nav
              aria-label="Navigasi halaman berita"
              className="grid grid-cols-2 gap-2 sm:flex"
            >
              <button
                type="button"
                disabled={!canPrevious}
                onClick={() => onPageChange(Math.max(0, offset - 20))}
                className={styles.secondary}
              >
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => onPageChange(offset + 20)}
                className={styles.secondary}
              >
                Berikutnya
              </button>
            </nav>
          </footer>
        )}
      </div>
    </section>
  );
}
