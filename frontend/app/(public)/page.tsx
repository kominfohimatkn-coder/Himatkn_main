import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CalendarDays, ExternalLink } from "lucide-react";

import { OrganizationSection } from "@/components/public/OrganizationSection";
import { PublicationsSection } from "@/components/public/PublicationsSection";
import {
  PublicButtonAnchor,
  PublicButtonLink,
} from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { PUBLIC_LINKS } from "@/lib/public/link";
import { getPublicNews } from "@/lib/public/news";
import { loadPublicOrganization } from "@/lib/public/organization";
import type { PublicNewsItem } from "@/types/news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Website resmi HIMATKN, himpunan mahasiswa Teknokimia Nuklir.",
};

const pillars = [
  {
    title: "Akademik",
    description:
      "Ruang belajar bersama untuk memahami mata kuliah inti dan saling membantu antaranggota.",
  },
  {
    title: "Riset",
    description:
      "Wadah untuk mengembangkan ide, mendokumentasikan proses, dan membagikan hasil karya.",
  },
  {
    title: "Komunitas",
    description:
      "Kegiatan yang menghubungkan mahasiswa lintas angkatan dalam lingkungan yang inklusif.",
  },
];

async function loadLatestNews(): Promise<{
  items: PublicNewsItem[];
  hasError: boolean;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await getPublicNews({
      limit: 3,
      signal: controller.signal,
    });

    return {
      items: response.items.slice(0, 3),
      hasError: false,
    };
  } catch {
    return {
      items: [],
      hasError: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function HomePage() {
  const [news, organization] = await Promise.all([
    loadLatestNews(),
    loadPublicOrganization(),
  ]);

  const period = organization.data?.period ?? null;
  const memberCount = organization.data?.members.length ?? 0;

  return (
    <>
      <section
        id="beranda"
        className="relative flex min-h-163.5 flex-col justify-center overflow-hidden bg-[#2F3D36] max-[640px]:min-h-155"
        aria-labelledby="home-title"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/hero-group.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%]"
          />
        </div>
        <div
          className="absolute inset-0 bg-[rgba(15,40,30,0.55)] max-[640px]:bg-[linear-gradient(180deg,rgba(15,40,30,0.38)_0%,rgba(15,40,30,0.66)_45%,rgba(15,40,30,0.42)_100%)]"
          aria-hidden="true"
        />

        <div className="site-container relative z-10 pt-30 pb-10 text-white max-[640px]:pt-35 max-[640px]:pb-37.5 max-[640px]:text-center">
          <h1
            id="home-title"
            className="font-serif text-[clamp(36px,3.6vw,56px)] leading-[1.12] font-bold text-white max-[640px]:text-[38px] max-[640px]:leading-[1.18]"
          >
            Himpunan Mahasiswa{" "}
            <em className="block italic">Teknokimia Nuklir</em>
          </h1>
          <p className="mt-4.5 text-base text-white/90 max-[640px]:mx-auto max-[640px]:mt-1.5 max-[640px]:max-w-[22ch] max-[640px]:text-[15px]">
            {period?.name ?? "HIMATKN"} — Beyond Chemistry Into Energy
          </p>
          <div className="mt-6.5 flex flex-wrap gap-3 max-[640px]:mt-5.5 max-[640px]:flex-nowrap max-[640px]:justify-center max-[640px]:gap-2">
            <PublicButtonLink
              href="#program"
              tone="white"
              className="max-[640px]:max-w-41.25 max-[640px]:flex-1 max-[640px]:whitespace-nowrap"
            >
              Lihat program kerja
              <ArrowRight
                className="size-4 max-[640px]:hidden"
                aria-hidden="true"
              />
            </PublicButtonLink>
            <PublicButtonLink
              href="/struktur"
              tone="outlineWhite"
              className="max-[640px]:max-w-41.25 max-[640px]:flex-1 max-[640px]:whitespace-nowrap"
            >
              Kenali pengurus
            </PublicButtonLink>
          </div>

          {period ? (
            <div className="mt-27.5 flex max-w-228.75 gap-14 border-t border-white/45 pt-4 max-[640px]:hidden">
              <div>
                <strong className="block font-serif text-[13px] font-bold tracking-[0.04em] uppercase">
                  {period.name}
                </strong>
                <span className="mt-1 block text-[10px] font-medium tracking-[0.08em] text-white/75 uppercase">
                  Periode aktif
                </span>
              </div>
              <div>
                <strong className="block font-serif text-[13px] font-bold tracking-[0.04em] uppercase">
                  {memberCount}
                </strong>
                <span className="mt-1 block text-[10px] font-medium tracking-[0.08em] text-white/75 uppercase">
                  Anggota
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section
        id="tentang"
        className="bg-mint py-24 max-[640px]:py-18"
        aria-labelledby="about-title"
      >
        <div className="site-container grid gap-10 min-[961px]:grid-cols-[1fr_1.25fr] min-[961px]:gap-16">
          <div>
            <PublicLabel>Tentang kami</PublicLabel>
            <h2
              id="about-title"
              className="mt-3.5 font-serif text-[clamp(28px,2.6vw,34px)] leading-[1.32] font-bold text-green-900"
            >
              Ruang untuk benar-benar paham apa yang kami pelajari.
            </h2>
            <p className="mt-5.5 max-w-[46ch] text-base text-muted">
              HIMATKN adalah himpunan mahasiswa Teknokimia Nuklir. Kami
              menghubungkan pembelajaran, riset, dan komunitas dalam satu ruang
              gerak organisasi.
            </p>
          </div>

          <ul className="border-t border-[#C9D7CF]">
            {pillars.map((pillar) => (
              <li
                key={pillar.title}
                className="grid grid-cols-[110px_1fr] gap-4 border-b border-[#C9D7CF] py-6.5 max-[640px]:grid-cols-1 max-[640px]:gap-1.5 max-[640px]:py-5.5"
              >
                <PublicLabel className="pt-1.25 max-[640px]:pt-0">
                  {pillar.title}
                </PublicLabel>
                <p className="text-sm text-muted">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="program"
        className="border-t border-line bg-paper py-24 max-[640px]:py-18"
        aria-labelledby="program-title"
      >
        <div className="site-container">
          <div className="max-w-140">
            <PublicLabel>Program kerja</PublicLabel>
            <h2
              id="program-title"
              className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-tight font-bold text-green-900"
            >
              Inisiatif dan agenda strategis HIMATKN
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft">
              Program kerja resmi akan tampil di sini setelah daftar kegiatannya
              siap dipublikasikan.
            </p>
          </div>

          <PublicStateBox
            icon={<CalendarDays className="size-5.5" />}
            label="Program kerja"
            title="Belum ada program kerja"
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
            Kami tidak menampilkan contoh agenda sebagai data resmi. Ikuti
            Instagram @himatknuklir untuk kabar kegiatan terbaru.
          </PublicStateBox>
        </div>
      </section>

      <PublicationsSection items={news.items} hasError={news.hasError} />

      <OrganizationSection
        data={organization.data}
        hasError={organization.hasError}
      />
    </>
  );
}
