import { ExternalLink, FileText, TriangleAlert } from "lucide-react";

import { PublicButtonAnchor, PublicButtonLink } from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import type { PublicLink } from "@/features/settings/links";
import { NewsList } from "./NewsList";
import type { PublicNewsItem } from "../../types";

type PublicationsSectionProps = {
  items: PublicNewsItem[];
  hasError: boolean;
  eyebrow: string;
  title: string;
  emptyText: string;
  instagram: PublicLink | null;
};

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
        <div data-reveal>
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
            <NewsList items={visibleItems} className="mt-10" />

            <div data-reveal className="mt-10 flex justify-center">
              <PublicButtonLink href="/publikasi" tone="outline">
                Lihat Semua Publikasi →
              </PublicButtonLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
}