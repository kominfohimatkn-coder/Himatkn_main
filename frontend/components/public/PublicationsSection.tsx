import type { PublicNewsItem } from "@/types/news";

import { PublicImage } from "@/components/public/PublicImage";
import { RefreshButton } from "@/components/public/RefreshButton";
import { ButtonLink } from "@/components/ui/Button";

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
      className="public-section bg-paper"
      aria-labelledby="publications-title"
    >
      <div className="site-container">
        <div className="max-w-180">
          <p className="kicker">Publikasi terkini</p>
          <h2
            id="publications-title"
            className="section-title mt-3"
          >
            Kabar dan Dokumentasi Kami
          </h2>
        </div>

        {hasError ? (
          <div className="empty-panel" role="alert">
            <h3 className="empty-panel__title">
              Publikasi belum dapat dimuat.
            </h3>
            <p className="empty-panel__copy">
              Koneksi ke layanan publikasi sedang bermasalah. Coba muat
              kembali halaman ini.
            </p>
            <div className="empty-panel__actions">
              <RefreshButton />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-panel">
            <h3 className="empty-panel__title">
              Belum Ada Berita Terbaru
            </h3>
            <p className="empty-panel__copy">
              Pantau kabar terbaru HIMATKN melalui kanal informasi yang
              tersedia.
            </p>
            <div className="empty-panel__actions">
              <ButtonLink href="#beranda" variant="outline">
                Kembali ke atas
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="publication-list">
            {items.map((item) => (
              <article key={item.id} className="publication-row">
                <PublicImage
                  src={getImage(item)}
                  alt={item.title}
                  className="publication-thumb"
                />

                <div>
                  <h3 className="publication-title">{item.title}</h3>
                </div>

                <div className="publication-detail">
                  <time
                    className="meta"
                    dateTime={item.published_at ?? undefined}
                  >
                    {formatPublishedAt(item.published_at)}
                  </time>
                  <span className="publication-action">
                    Detail segera hadir
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
