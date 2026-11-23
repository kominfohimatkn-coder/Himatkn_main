import type { ReactNode } from "react";
import { RevealObserver } from "@/components/public/RevealObserver";
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
      <a href="#main-content" className="skip-link">
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
      <RevealObserver />
    </div>
  );
}
