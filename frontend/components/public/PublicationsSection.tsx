import { ExternalLink, FileText } from "lucide-react";

import { PublicImage } from "@/components/public/PublicImage";
import { PublicButtonAnchor } from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { PUBLIC_LINKS } from "@/lib/public/link";
import type { PublicNewsItem } from "@/types/news";

type PublicationsSectionProps = {
  items: PublicNewsItem[];
  hasError: boolean;
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

export function PublicationsSection({
  items,
  hasError,
}: PublicationsSectionProps) {
  return (
    <section
      id="publikasi"
      className="border-t border-line bg-paper py-24 max-[640px]:py-[72px]"
      aria-labelledby="publications-title"
    >
      <div className="site-container">
        <div className="max-w-[560px]">
          <PublicLabel>Publikasi terkini</PublicLabel>
          <h2
            id="publications-title"
            className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-[1.25] font-bold text-green-900"
          >
            Kabar dan dokumentasi kami
          </h2>
        </div>

        {hasError ? (
          <PublicStateBox
            tone="error"
            icon={<FileText className="size-[22px]" />}
            label="Gagal memuat"
            title="Publikasi tidak dapat ditampilkan"
            action={<RefreshButton />}
          >
            Terjadi gangguan saat mengambil data publikasi. Periksa koneksi
            internet, lalu coba lagi.
          </PublicStateBox>
        ) : items.length === 0 ? (
          <PublicStateBox
            icon={<FileText className="size-[22px]" />}
            label="Publikasi"
            title="Belum ada publikasi"
            action={
              <PublicButtonAnchor
                href={PUBLIC_LINKS.instagram.href}
                target={PUBLIC_LINKS.instagram.target}
                rel={PUBLIC_LINKS.instagram.rel}
                tone="outline"
              >
                Buka Instagram
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="sr-only">
                  (membuka Instagram di tab baru)
                </span>
              </PublicButtonAnchor>
            }
          >
            Dokumentasi dan kabar kegiatan HIMATKN akan diunggah di sini.
            Sementara itu, ikuti Instagram @himatknuklir.
          </PublicStateBox>
        ) : (
          <div className="mt-10 border-t border-line">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 border-b border-line py-[30px] min-[901px]:grid-cols-[180px_1fr] min-[901px]:gap-6"
              >
                <PublicImage
                  src={getImage(item)}
                  alt={item.title}
                  className="aspect-[3/2] w-[180px] max-w-full rounded-[4px] grayscale"
                />

                <div>
                  <h3 className="font-serif text-[17px] font-semibold text-green-900">
                    {item.title}
                  </h3>

                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
                    <time dateTime={item.published_at ?? undefined}>
                      {formatPublishedAt(item.published_at)}
                    </time>
                    <span>Detail segera hadir</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
