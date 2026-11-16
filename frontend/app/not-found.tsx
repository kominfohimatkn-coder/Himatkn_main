import type { Metadata } from "next";

import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { PublicButtonLink } from "@/components/public/PublicButton";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

export default function NotFound() {
  return (
    <div id="top" className="public-site">
      <SiteHeader />

      <main
        id="main-content"
        className="grid min-h-[calc(100svh_-_var(--header-h))] place-items-center px-6 py-16 text-center"
      >
        <div className="w-full max-w-[560px]">
          <p
            className="font-serif text-[clamp(88px,12vw,140px)] leading-none font-bold text-mint [-webkit-text-stroke:1px_#B9CBC1]"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="mt-3 font-serif text-[clamp(28px,3vw,36px)] leading-[1.25] font-bold text-green-900">
            Halaman tidak ditemukan
          </h1>
          <p className="mx-auto mt-3 max-w-[44ch] text-muted">
            Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
            Periksa kembali tautannya atau kembali ke beranda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <PublicButtonLink href="/" tone="solid">
              Kembali ke beranda
            </PublicButtonLink>
            <PublicButtonLink href="/#program" tone="outline">
              Lihat program kerja
            </PublicButtonLink>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
