import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OrganizationSection } from "@/components/public/OrganizationSection";
import { PublicationsSection } from "@/components/public/PublicationsSection";
import { ButtonLink } from "@/components/ui/Button";
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

  return (
    <>
      <section
        id="beranda"
        className="home-hero"
        data-tone="dark"
        aria-labelledby="home-title"
      >
        <div className="home-hero-media" aria-hidden="true">
          <Image
            src="/images/hero-group.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%]"
          />
        </div>
        <div className="home-hero-overlay" aria-hidden="true" />

        <div className="home-hero-inner">
          <h1 id="home-title" className="home-hero-title">
            <span className="block">Himpunan Mahasiswa</span>
            <span className="block">Teknokimia Nuklir</span>
          </h1>
          <p className="home-hero-tagline">
            <span className="block sm:inline">Kabinet Nexus</span>
            <span className="hidden sm:inline"> — </span>
            <span className="block sm:inline">
              Beyond Chemistry Into Energy
            </span>
          </p>
          <div className="home-hero-actions">
            <ButtonLink href="#program" variant="primary">
              Lihat program kerja
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/struktur" variant="secondary">
              Kenali pengurus
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section
        id="tentang"
        className="public-section bg-paper"
        aria-labelledby="about-title"
      >
        <div className="site-container">
          <div className="about-intro">
            <p className="kicker">Tentang kami</p>
            <h2
              id="about-title"
              className="mt-3 text-[clamp(2rem,4vw,3.125rem)]"
            >
              Ruang untuk benar-benar paham apa yang kami pelajari.
            </h2>
            <p className="section-copy">
              HIMATKN adalah himpunan mahasiswa Teknokimia Nuklir. Kami
              menghubungkan pembelajaran, riset, dan komunitas dalam satu
              ruang gerak organisasi.
            </p>
          </div>

          <div className="about-features">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="about-feature">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="program"
        className="public-section program-section bg-paper"
        aria-labelledby="program-title"
      >
        <div className="site-container">
          <div className="max-w-180">
            <p className="kicker">Program kerja</p>
            <h2 id="program-title" className="section-title mt-3">
              Agenda Kabinet Nexus
            </h2>
            <p className="section-copy">
              Program kerja resmi akan tampil di sini setelah daftar
              kegiatannya siap dipublikasikan.
            </p>
          </div>

          <div className="program-empty-panel">
            <h3 className="program-empty-panel__title">
              Belum ada program kerja
            </h3>
            <p className="program-empty-panel__copy">
              Kami tidak menampilkan contoh agenda sebagai data resmi. Pantau
              publikasi HIMATKN untuk informasi kegiatan terbaru.
            </p>
            <Link href="#publikasi" className="program-empty-panel__link">
              Pantau kabar terbaru di Instagram
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <PublicationsSection
        items={news.items}
        hasError={news.hasError}
      />

      <OrganizationSection
        data={organization.data}
        hasError={organization.hasError}
      />

      <section
        id="kontak"
        className="contact-section py-23"
        data-tone="dark"
        aria-labelledby="contact-title"
      >
        <div className="site-container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="kicker kicker--dark">Bergabung</p>
            <h2
              id="contact-title"
              className="mt-3 max-w-170 text-[clamp(2.625rem,6vw,4.25rem)]"
            >
              Jadilah bagian dari Kabinet Nexus.
            </h2>
            <p className="section-copy section-copy--dark">
              Terbuka untuk seluruh mahasiswa aktif Teknokimia Nuklir yang
              ingin berkontribusi.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ButtonLink href="#publikasi" variant="primary">
                Lihat publikasi
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#beranda" variant="secondary">
                Kembali ke atas
              </ButtonLink>
            </div>
          </div>

          <div className="self-end">
            <dl className="contact-details">
              <div className="contact-detail">
                <dt>Email</dt>
                <dd>Menunggu verifikasi</dd>
              </div>
              <div className="contact-detail">
                <dt>Sekretariat</dt>
                <dd>Menunggu verifikasi</dd>
              </div>
              <div className="contact-detail">
                <dt>Lokasi</dt>
                <dd>Menunggu verifikasi</dd>
              </div>
            </dl>
            <p className="mt-4 max-w-sm text-[10px] leading-5 text-on-dark-soft">
              Detail kontak resmi akan dicantumkan setelah alamat, email, dan
              tautan peta dikonfirmasi oleh pengurus.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
