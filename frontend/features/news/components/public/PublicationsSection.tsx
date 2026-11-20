import { ExternalLink, FileText, TriangleAlert } from "lucide-react";

import { PublicImage } from "@/components/public/PublicImage";
import { PublicButtonAnchor } from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import type { PublicLink } from "@/features/settings/links";
import type { PublicNewsItem } from "../../types";

type PublicationsSectionProps = {
  items: PublicNewsItem[];
  hasError: boolean;
  eyebrow: string;
  title: string;
  emptyText: string;
  instagram: PublicLink | null;
};

function formatPublishedAt(value: string | null): string {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getImage(item: PublicNewsItem): string | null {
  const featured = item.featured_image?.trim();
  if (featured) return featured;

  return item.images.find((image) => image.url?.trim())?.url ?? null;
}

function newsExcerpt(value: string, maxLength = 150): string | null {
  const text = value.replace(/\s+/g, " ").trim();

  if (!text) return null;
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.trimEnd()}…`;
}

export function PublicationsSection({
  items,
  hasError,
  eyebrow,
  title,
  emptyText,
  instagram,
}: PublicationsSectionProps) {
  // Beranda mengikuti `#home-news` pada prototype: maksimal dua publikasi.
  const visibleItems = items.slice(0, 2);

  return (
    <section
      id="publikasi"
      className="border-t border-line bg-paper py-24 max-[640px]:py-18"
      aria-labelledby="pub-title"
    >
      <div className="site-container">
        <div>
          {eyebrow ? <PublicLabel>{eyebrow}</PublicLabel> : null}
          <h2
            id="pub-title"
            className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-tight font-bold text-green-900"
          >
            {title}
          </h2>
        </div>

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
        ) : visibleItems.length === 0 ? (
          <PublicStateBox
            icon={<FileText className="size-5.5" />}
            label="Publikasi"
            title={emptyText}
            action={
              instagram ? (
                <PublicButtonAnchor
                  href={instagram.href}
                  target={instagram.target}
                  rel={instagram.rel}
                  tone="outline"
                >
                  {instagram.label}
                  <ExternalLink className="size-4" aria-hidden="true" />
                  <span className="sr-only">
                    (membuka Instagram di tab baru)
                  </span>
                </PublicButtonAnchor>
              ) : undefined
            }
          >
            Dokumentasi dan kabar kegiatan HIMATKN akan diunggah di sini.
          </PublicStateBox>
        ) : (
          <>
            <ul className="mt-10 border-t border-line">
              {visibleItems.map((item) => {
                const excerpt = newsExcerpt(item.excerpt);

                return (
                  <li
                    key={item.id}
                    className="grid grid-cols-[180px_1fr] gap-6 border-b border-line py-[30px] max-[640px]:grid-cols-1 max-[640px]:gap-3.5"
                  >
                    <PublicImage
                      src={getImage(item)}
                      alt={item.title}
                      className="group aspect-3/2 w-[180px] max-w-full rounded-[4px] [&_img]:grayscale [&_img]:transition [&_img]:duration-500 [&_img]:ease-out group-hover:[&_img]:scale-105 group-hover:[&_img]:grayscale-[0.2]"
                    />

                    <div>
                      <h3 className="font-serif text-[17px] font-bold text-green-900">
                        {item.title}
                      </h3>
                      {excerpt ? (
                        <p className="mt-2 text-[15px] leading-6 text-muted">
                          {excerpt}
                        </p>
                      ) : null}
                      <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-muted">
                        <time dateTime={item.published_at ?? undefined}>
                          {formatPublishedAt(item.published_at)}
                        </time>
                        {/* TODO(news-detail): tautan "Baca Selengkapnya →"
                            ditampilkan setelah route detail publikasi tersedia. */}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* TODO(news-list): tampilkan tombol "Lihat Semua Publikasi →"
                setelah route daftar publikasi tersedia. */}
          </>
        )}
      </div>
    </section>
  );
}
