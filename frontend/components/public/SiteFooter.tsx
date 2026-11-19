import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { PUBLIC_LINKS } from "@/features/settings/links";

type FooterItem = {
  label: string;
  href: string;
  /** Link keluar situs (mis. Bank Soal) memakai <a>, bukan <Link>. */
  external?: boolean;
};

const footerNavigation: FooterItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#tentang" },
  // Sementara: route /kegiatan belum ada. Target diganti saat route tersedia.
  { label: "Kegiatan", href: "/#program" },
  // Sementara: route /publikasi belum ada. Target diganti saat route tersedia.
  { label: "Publikasi", href: "/#publikasi" },
  {
    label: PUBLIC_LINKS.bankSoal.label,
    href: PUBLIC_LINKS.bankSoal.href,
    external: true,
  },
  { label: "Struktur", href: "/struktur" },
];

const footerLinkClass =
  "w-fit py-1.5 text-[13px] text-on-dark-soft transition-colors hover:text-white";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-on-dark bg-green-950 pt-14 text-white">
      <div className="site-container">
        <div className="flex flex-col gap-6 border-b border-line-on-dark pb-8 min-[641px]:flex-row min-[641px]:items-start min-[641px]:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span>
              <span className="block font-serif text-[13px] leading-[1.1] font-bold tracking-[0.01em] text-white uppercase min-[641px]:text-[15px]">
                Hima Teknokimia Nuklir
              </span>
              <span className="mt-0.75 block text-[10px] leading-[1.3] font-medium tracking-[0.08em] text-on-dark-soft uppercase min-[641px]:text-[11px]">
                Politeknik Teknologi Nuklir
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navigasi footer"
            className="grid w-full grid-cols-2 gap-x-6 gap-y-3 min-[641px]:flex min-[641px]:w-auto min-[641px]:gap-6.5"
          >
            {footerNavigation.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel={PUBLIC_LINKS.bankSoal.rel}
                    className={`${footerLinkClass} inline-flex items-center gap-1`}
                  >
                    {item.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                    <span className="sr-only">
                      (membuka Google Drive di tab baru)
                    </span>
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-5.5 pb-7.5 text-xs text-on-dark-soft min-[641px]:flex-row min-[641px]:items-center min-[641px]:justify-between">
          <p>
            © {year} HIMATKN — Himpunan Mahasiswa Teknokimia Nuklir
          </p>

          <a
            href="#top"
            className="w-fit py-1.5 transition-colors hover:text-white"
          >
            Kembali ke atas
          </a>
        </div>
      </div>
    </footer>
  );
}
