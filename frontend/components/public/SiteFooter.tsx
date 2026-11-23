import Link from "next/link";

import { PUBLIC_SETTINGS_FALLBACK } from "@/features/settings/fallback";

type FooterItem = {
  label: string;
  href: string;
};

const footerNavigation: FooterItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Kegiatan", href: "/program" },
  { label: "Berita", href: "/publikasi" },
  { label: "Dokumen", href: "/dokumen" },
  { label: "Struktur", href: "/struktur" },
];

const footerLinkClass =
  "w-fit py-1.5 text-[13px] text-on-dark-soft transition-colors hover:text-white";

type SiteFooterProps = {
  brandName?: string;
  brandSubtitle?: string;
  footerCopyright?: string;
  footerInstitution?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  address?: string;
};

export function SiteFooter({
  brandName = PUBLIC_SETTINGS_FALLBACK.brand_name,
  brandSubtitle = PUBLIC_SETTINGS_FALLBACK.brand_subtitle,
  footerCopyright = PUBLIC_SETTINGS_FALLBACK.footer_copyright,
  footerInstitution = PUBLIC_SETTINGS_FALLBACK.footer_institution,
  mapsUrl = PUBLIC_SETTINGS_FALLBACK.maps_url,
  mapsEmbedUrl = PUBLIC_SETTINGS_FALLBACK.maps_embed_url,
  address = PUBLIC_SETTINGS_FALLBACK.secretariat_address,
}: SiteFooterProps = {}) {
  const copyright = footerCopyright.trim();
  const institution = footerInstitution.trim();
  const mapsHref = mapsUrl.trim();
  const embedSrc = mapsEmbedUrl.trim();
  const secretariat = address.trim();
  const hasMap = Boolean(embedSrc || secretariat);

  return (
    <footer className="border-t border-line-on-dark bg-green-950 pt-14 text-white">
      <div className="site-container">
        <div
          data-reveal
          className="flex flex-col gap-6 border-b border-line-on-dark pb-8 min-[641px]:flex-row min-[641px]:items-start min-[641px]:justify-between"
        >
          <Link href="/" className="flex items-center gap-3">
            <span>
              <span className="block font-serif text-[13px] leading-[1.1] font-bold tracking-[0.01em] text-white uppercase min-[641px]:text-[15px]">
                {brandName}
              </span>
              <span className="mt-0.75 block text-[10px] leading-[1.3] font-medium tracking-[0.08em] text-on-dark-soft uppercase min-[641px]:text-[11px]">
                {brandSubtitle}
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navigasi footer"
            className="grid w-full grid-cols-2 gap-x-6 gap-y-3 min-[641px]:flex min-[641px]:w-auto min-[641px]:gap-[26px]"
          >
            {footerNavigation.map((item) => (
              <Link key={item.href} href={item.href} className={footerLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {hasMap ? (
          <div data-reveal className="py-[34px] pb-[26px]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-on-dark-soft uppercase">
                Lokasi Kami
              </p>
              {mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold tracking-[0.08em] text-white uppercase underline underline-offset-[3px]"
                >
                  Buka Google Maps <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>

            {embedSrc ? (
              <div className="relative h-[220px] overflow-hidden rounded-[4px] border border-[#2A4A3D] bg-[#E5E3DF] max-[640px]:h-[180px]">
                <iframe
                  src={embedSrc}
                  title={`Peta lokasi ${brandName}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="size-full border-0"
                />
              </div>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-[4px] border border-[#2A4A3D] bg-[#0B3125] px-5 text-center max-[640px]:h-[180px]">
                <span className="text-xs font-semibold tracking-[0.1em] text-on-dark-soft uppercase">
                  Peta tidak dapat dimuat
                </span>
                <strong className="font-serif text-base font-bold">
                  {brandName}
                </strong>
                <p className="text-[13px] text-on-dark-soft">{secretariat}</p>
                {mapsHref ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center justify-center rounded-[4px] border border-white/55 px-[22px] py-[15px] text-xs font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:border-white hover:bg-white/10"
                  >
                    Buka di Google Maps
                  </a>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {copyright || institution ? (
          <div className="flex flex-col gap-3 py-[22px] pb-[30px] text-xs text-on-dark-soft min-[641px]:flex-row min-[641px]:justify-between">
            {copyright ? <span>{copyright}</span> : null}
            {institution ? <span>{institution}</span> : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}