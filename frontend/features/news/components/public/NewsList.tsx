import Link from "next/link";

import { HighlightedText } from "@/components/public/HighlightedText";
import { PublicImage } from "@/components/public/PublicImage";
import {
  formatNewsDateShort,
  getNewsCover,
  newsExcerpt,
} from "../../format";
import type { PublicNewsItem } from "../../types";

type NewsListProps = {
  items: PublicNewsItem[];
  /** Kata kunci pencarian untuk `<mark>`; kosong di beranda. */
  term?: string | null;
  className?: string;
};

function NewsCover({
  item,
  href,
}: {
  item: PublicNewsItem;
  href: string;
}) {
  const cover = getNewsCover(item);

  return (
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden="true"
      className="relative block aspect-3/2 w-[180px] max-w-full overflow-hidden rounded-[4px] bg-[#DCE5E0]"
    >
      {cover ? (
        <PublicImage
          src={cover}
          alt=""
          className="size-full [&_img]:grayscale [&_img]:transition [&_img]:duration-500 [&_img]:ease-out group-hover:[&_img]:scale-105 group-hover:[&_img]:grayscale-[0.2]"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
          Foto
        </span>
      )}
    </Link>
  );
}

/**
 * Baris publikasi mengikuti `.pubs` / `.pub` pada prototype. Dipakai bersama
 * oleh beranda (`#home-news`, maksimal dua item) dan halaman `/publikasi`.
 */
export function NewsList({ items, term, className = "" }: NewsListProps) {
  return (
    <ul className={`border-t border-line ${className}`.trim()}>
      {items.map((item) => {
        const href = `/publikasi/${item.slug}`;
        const excerpt = newsExcerpt(item);
        const date = formatNewsDateShort(item.published_at);

        return (
          <li
            key={item.id}
            className="group grid grid-cols-1 gap-3.5 border-b border-line py-[30px] transition-colors min-[641px]:grid-cols-[180px_1fr] min-[641px]:gap-6"
          >
            <NewsCover item={item} href={href} />

            <div>
              <h3 className="font-serif text-[17px] leading-snug font-bold text-green-900">
                <Link
                  href={href}
                  className="hover:underline hover:underline-offset-3"
                >
                  <HighlightedText text={item.title} term={term} />
                </Link>
              </h3>
              {excerpt ? (
                <p className="mt-2 text-[15px] leading-6 text-muted">
                  <HighlightedText text={excerpt} term={term} />
                </p>
              ) : null}
              <div className="mt-3.5 flex items-center justify-between gap-4 text-xs text-muted">
                <time dateTime={item.published_at ?? undefined}>
                  {date ?? "Tanggal belum tersedia"}
                </time>
                <Link
                  href={href}
                  className="text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2"
                >
                  Baca Selengkapnya →
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
