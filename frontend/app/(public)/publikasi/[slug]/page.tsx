import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicImage } from "@/components/public/PublicImage";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { NewsContent } from "@/features/news/content";
import { getNewsCover, getNewsGalleryImages, formatNewsDateLong } from "@/features/news/format";
import { getPublicNewsBySlug } from "@/features/news/public-api";
import type { PublicNewsDetail } from "@/features/news/types";
import { getPublicLinks } from "@/features/settings/links";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";

type PublikasiDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function plainText(value: string | null): string {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value: string | null, maxLength = 160): string {
  const text = plainText(value);

  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");

  return `${(lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

async function loadNews(slug: string): Promise<{
  news: PublicNewsDetail | null;
  hasError: boolean;
}> {
  try {
    return { news: await getPublicNewsBySlug(slug), hasError: false };
  } catch {
    return { news: null, hasError: true };
  }
}

export async function generateMetadata({
  params,
}: PublikasiDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getPublicNewsBySlug(slug).catch(() => null);

  if (!news) {
    return { title: "Publikasi" };
  }

  const description = excerpt(news.content);
  const cover = getNewsCover(news);

  return {
    title: news.title,
    description: description || undefined,
    openGraph: cover
      ? {
          title: news.title,
          description: description || undefined,
          images: [{ url: cover }],
        }
      : undefined,
  };
}

export default async function PublikasiDetailPage({
  params,
}: PublikasiDetailPageProps) {
  const { slug } = await params;

  const [newsResult, settingsResult] = await Promise.all([
    loadNews(slug),
    loadPublicSettings(),
  ]);

  if (!newsResult.hasError && !newsResult.news) {
    notFound();
  }

  const settings = resolvePublicSettings(settingsResult);
  const links = getPublicLinks(settings);
  const news = newsResult.news;
  const cover = news ? getNewsCover(news) : null;
  const gallery = news ? getNewsGalleryImages(news) : [];
  const date = news ? formatNewsDateLong(news.published_at) : null;

  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <div className="mx-auto max-w-[720px]">
          <form
            role="search"
            action="/publikasi"
            method="get"
            className="mb-7 flex flex-col gap-2 min-[641px]:flex-row"
          >
            <label className="sr-only" htmlFor="detail-q">
              Cari publikasi
            </label>
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="detail-q"
                name="q"
                type="search"
                required
                placeholder="Cari berita atau publikasi lain…"
                autoComplete="off"
                className="h-11 w-full rounded-[4px] border border-line bg-[#F7F9F8] py-[13px] pr-3.5 pl-10 text-sm text-ink transition-[border-color,box-shadow] focus:border-green-800 focus:shadow-[0_0_0_3px_rgba(15,77,54,0.12)] focus:outline-none"
              />
            </div>
            <PublicButton type="submit" tone="solid" className="flex-none">
              Cari
            </PublicButton>
          </form>
        </div>

        <article className="mx-auto max-w-[720px]" aria-live="polite">
          {newsResult.hasError || !news ? (
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
          ) : (
            <>
              <p className="text-xs tracking-[0.04em] text-muted">
                <Link
                  href="/"
                  className="text-green-800 no-underline hover:underline"
                >
                  Beranda
                </Link>{" "}
                /{" "}
                <Link
                  href="/publikasi"
                  className="text-green-800 no-underline hover:underline"
                >
                  Publikasi
                </Link>
              </p>

              <h1 className="mt-[18px] font-serif text-[clamp(28px,3.2vw,40px)] leading-[1.25] font-bold text-green-900">
                {news.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3.5 text-[13px] text-muted">
                {date ? <span>{date}</span> : null}
                {news.tags.map((tag) => (
                  <span key={tag.id}>#{tag.name}</span>
                ))}
              </div>

              {cover ? (
                <div className="my-8 aspect-video w-full overflow-hidden rounded-[4px]">
                  <PublicImage src={cover} alt={news.title} className="size-full" />
                </div>
              ) : null}

              <NewsContent content={news.content} />

              {gallery.length > 0 ? (
                <div className="mt-10 grid grid-cols-2 gap-3">
                  {gallery.map((image) => (
                    <figure key={image.id}>
                      <PublicImage
                        src={image.url}
                        alt={image.caption || news.title}
                        className="aspect-3/2 w-full rounded-[4px]"
                      />
                      {image.caption ? (
                        <figcaption className="mt-2 text-xs leading-normal text-muted">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
                <Link
                  href="/publikasi"
                  className="text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2"
                >
                  ← Kembali ke Publikasi
                </Link>
                {links.instagram ? (
                  <a
                    href={links.instagram.href}
                    target={links.instagram.target}
                    rel={links.instagram.rel}
                    className="text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2"
                  >
                    Dokumentasi di Instagram →
                  </a>
                ) : null}
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
