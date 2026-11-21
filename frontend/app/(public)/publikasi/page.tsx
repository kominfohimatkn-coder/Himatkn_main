import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search, TriangleAlert } from "lucide-react";

import {
  PublicButtonAnchor,
  PublicButtonLink,
} from "@/components/public/PublicButton";
import { PublicSearch } from "@/components/public/PublicSearch";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { NewsList } from "@/features/news/components/public/NewsList";
import { getPublicNews } from "@/features/news/public-api";
import type { PublicNewsListResponse } from "@/features/news/types";
import { getPublicLinks } from "@/features/settings/links";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type PublikasiSearchParams = {
  q?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

type PagerItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Nomor halaman dibatasi maksimal tujuh sel supaya tidak meluber di mobile.
 * Prototipe hanya menggambar tiga nomor; jendela ini dipakai untuk total
 * halaman yang lebih banyak.
 */
function pagerItems(page: number, totalPages: number): PagerItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const items: PagerItem[] = [1];

  if (start > 2) items.push("ellipsis-start");
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);

  return items;
}

function publikasiHref({ page, q }: { page: number; q?: string }): string {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/publikasi?${query}` : "/publikasi";
}

async function loadPublikasi({
  q,
  offset,
}: {
  q: string;
  offset: number;
}): Promise<{ data: PublicNewsListResponse; hasError: boolean }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const data = await getPublicNews({
      q,
      offset,
      limit: PAGE_SIZE,
      signal: controller.signal,
    });

    return { data, hasError: false };
  } catch {
    return {
      data: { items: [], total: 0, offset: 0, limit: PAGE_SIZE },
      hasError: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = resolvePublicSettings(await loadPublicSettings());

  return {
    title: "Publikasi",
    description: `Kabar, liputan kegiatan, dan dokumentasi ${settings.brand_name}.`,
  };
}

export default async function PublikasiPage({
  searchParams,
}: {
  searchParams: Promise<PublikasiSearchParams>;
}) {
  const params = await searchParams;
  const q = firstValue(params.q);
  // Backend hanya mengirim `q` bila minimal 2 karakter.
  const searchTerm = q.length >= 2 ? q : "";
  const requestedPage = parsePage(firstValue(params.page));

  const [firstResult, settingsResult] = await Promise.all([
    loadPublikasi({ q: searchTerm, offset: (requestedPage - 1) * PAGE_SIZE }),
    loadPublicSettings(),
  ]);

  let data = firstResult.data;
  let hasError = firstResult.hasError;
  let page = requestedPage;

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  // Halaman di luar jangkauan: ambil halaman terakhir supaya daftar tidak kosong.
  if (!hasError && data.items.length === 0 && totalPages > 0 && page > totalPages) {
    page = totalPages;
    const lastResult = await loadPublikasi({
      q: searchTerm,
      offset: (totalPages - 1) * PAGE_SIZE,
    });
    data = lastResult.data;
    hasError = lastResult.hasError;
  }

  const settings = resolvePublicSettings(settingsResult);
  const links = getPublicLinks(settings);
  const showPager = !hasError && data.total > 0 && totalPages > 1;

  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <h1 className="text-center font-serif text-[clamp(32px,3.4vw,44px)] leading-[1.25] font-bold text-green-900">
          Publikasi
        </h1>
        <p className="mx-auto mt-3.5 max-w-[56ch] text-center text-muted">
          Kabar, liputan kegiatan, dan dokumentasi {settings.brand_name}.
        </p>
        <hr className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] border-0 bg-line" />

        <PublicSearch
          initialValue={q}
          label="Cari publikasi"
          placeholder="Cari berita atau publikasi…"
        />

        <p
          className="mt-3.5 min-h-5 text-center text-[13px] text-muted"
          aria-live="polite"
        >
          {searchTerm && data.total > 0 ? (
            <>
              <strong className="text-green-900">{data.total}</strong> publikasi
              cocok dengan “{searchTerm}”
            </>
          ) : null}
        </p>

        <div className="mx-auto max-w-(--container)">
          <div aria-live="polite">
            {hasError ? (
              <PublicStateBox
                tone="error"
                icon={<TriangleAlert className="size-5.5" />}
                label="Gagal memuat"
                title="Publikasi tidak dapat ditampilkan"
                action={<RefreshButton />}
              >
                Terjadi gangguan saat mengambil data. Periksa koneksi internet,
                lalu coba lagi.
              </PublicStateBox>
            ) : data.items.length > 0 ? (
              <NewsList
                items={data.items}
                term={searchTerm}
                className="mt-4"
              />
            ) : searchTerm ? (
              <PublicStateBox
                icon={<Search className="size-5.5" />}
                label="Pencarian"
                title={`Tidak ada publikasi untuk “${searchTerm}”`}
                action={
                  <PublicButtonLink href="/publikasi" tone="outline">
                    Hapus pencarian
                  </PublicButtonLink>
                }
              >
                Periksa ejaan atau gunakan kata kunci lain.
              </PublicStateBox>
            ) : (
              <PublicStateBox
                icon={<FileText className="size-5.5" />}
                label="Publikasi"
                title="Belum ada publikasi"
                action={
                  links.instagram ? (
                    <PublicButtonAnchor
                      href={links.instagram.href}
                      target={links.instagram.target}
                      rel={links.instagram.rel}
                      tone="outline"
                    >
                      Buka Instagram
                      <span className="sr-only">
                        (membuka Instagram di tab baru)
                      </span>
                    </PublicButtonAnchor>
                  ) : undefined
                }
              >
                Dokumentasi dan kabar kegiatan akan diunggah di sini. Sementara
                itu, ikuti Instagram kami.
              </PublicStateBox>
            )}
          </div>

          {showPager ? (
            <nav
              className="mt-11 flex justify-center gap-1.5"
              aria-label="Halaman publikasi"
            >
              {page > 1 ? (
                <Link
                  href={publikasiHref({ page: page - 1, q: searchTerm })}
                  className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-line bg-white text-[13px] no-underline transition-colors hover:border-green-800"
                  aria-label="Halaman sebelumnya"
                >
                  ←
                </Link>
              ) : (
                <span
                  className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-line bg-white text-[13px] text-[#8A9590]"
                  aria-hidden="true"
                >
                  ←
                </span>
              )}

              {pagerItems(page, totalPages).map((item) =>
                typeof item === "string" ? (
                  <span
                    key={item}
                    className="grid h-[38px] min-w-[38px] place-items-center text-[13px] text-muted"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : item === page ? (
                  <span
                    key={item}
                    aria-current="page"
                    className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-green-800 bg-green-800 text-[13px] text-white"
                  >
                    {item}
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={publikasiHref({ page: item, q: searchTerm })}
                    className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-line bg-white text-[13px] no-underline transition-colors hover:border-green-800"
                  >
                    {item}
                  </Link>
                ),
              )}

              {page < totalPages ? (
                <Link
                  href={publikasiHref({ page: page + 1, q: searchTerm })}
                  className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-line bg-white text-[13px] no-underline transition-colors hover:border-green-800"
                  aria-label="Halaman berikutnya"
                >
                  →
                </Link>
              ) : (
                <span
                  className="grid h-[38px] min-w-[38px] place-items-center rounded-[3px] border border-line bg-white text-[13px] text-[#8A9590]"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
