import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { getPublicLinks } from "@/features/settings/links";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const settings = resolvePublicSettings(await loadPublicSettings());
  const links = getPublicLinks(settings);

  return (
    <div id="top" className="public-site">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-3 left-3 z-50 px-4 py-2.5 bg-green-800 text-white text-xs font-bold transition-all duration-150 ease-in">
        Lewati ke konten
      </a>
      <SiteHeader
        brandName={settings.brand_name}
        brandSubtitle={settings.brand_subtitle}
        bankSoal={links.bankSoal}
        instagram={links.instagram}
      />
      <main id="main-content">{children}</main>
      <SiteFooter
        brandName={settings.brand_name}
        brandSubtitle={settings.brand_subtitle}
        footerCopyright={settings.footer_copyright}
        footerInstitution={settings.footer_institution}
        mapsUrl={settings.maps_url}
        mapsEmbedUrl={settings.maps_embed_url}
        address={settings.secretariat_address}
      />
    </div>
  );
}
