import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

export default function NotFound() {
  return (
    <div id="top" className="public-site">
      <SiteHeader />

      <main
        id="main-content"
        data-tone="dark"
        className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center bg-bg-dark px-5 pt-24 pb-16 text-center text-on-dark"
      >
        <div className="w-full max-w-3xl">
          <p className="kicker kicker--dark">Error 404</p>
          <p className="mt-4 font-serif text-[clamp(7rem,20vw,14rem)] leading-none tracking-tighter text-gold-bright">
            404
          </p>
          <h1 className="mt-6 text-[clamp(2.375rem,5vw,3.625rem)] text-on-dark">
            Halaman tidak ditemukan.
          </h1>
          <p className="mx-auto mt-3 max-w-140 text-sm leading-7 text-on-dark-soft">
            Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
            Periksa kembali tautannya atau kembali ke beranda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <ButtonLink href="/" variant="primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali ke beranda
            </ButtonLink>
            <ButtonLink href="/#publikasi" variant="secondary">
              Lihat publikasi
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
