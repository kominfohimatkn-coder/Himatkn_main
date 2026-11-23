import type { Metadata } from "next";
import { CalendarDays, TriangleAlert } from "lucide-react";

import { PublicHeroImage } from "@/components/public/PublicHeroImage";
import { OrganizationSection } from "@/features/organization/components/OrganizationSection";
import { PublicationsSection } from "@/features/news/components/public/PublicationsSection";
import { PublicButtonLink } from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { getPublicLinks } from "@/features/settings/links";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";
import { getPublicNews } from "@/features/news/public-api";
import { getPublicPrograms } from "@/features/programs/public-api";
import { ProgramList } from "@/features/programs/components/public/ProgramList";
import { loadPublicOrganization } from "@/features/organization/public-api";
import type { PublicNewsItem } from "@/features/news/types";
import type { PublicProgram } from "@/features/programs/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = resolvePublicSettings(await loadPublicSettings());

  return {
    title: "Beranda",
    description: `Website resmi ${settings.brand_name}.`,
  };
}

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

async function loadLatestPrograms(): Promise<{
  items: PublicProgram[];
  hasError: boolean;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await getPublicPrograms({
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
  const [news, organization, programs, settingsResult] = await Promise.all([
    loadLatestNews(),
    loadPublicOrganization(),
    loadLatestPrograms(),
    loadPublicSettings(),
  ]);

  const settings = resolvePublicSettings(settingsResult);
  const links = getPublicLinks(settings);
  const period = organization.data?.period ?? null;
  const divisionCount = organization.data?.divisions.length ?? 0;
  const memberCount = organization.data?.members.length ?? 0;
  const heroImageAlt =
    settings.hero_image_alt.trim() || "Mahasiswa berfoto bersama";

  const heroStats = [
    period ? { value: period.name, label: "Periode aktif" } : null,
    divisionCount > 0
      ? { value: String(divisionCount), label: "Divisi" }
      : null,
    memberCount > 0 ? { value: String(memberCount), label: "Anggota" } : null,
  ].filter((stat): stat is { value: string; label: string } => stat !== null);

  const pillars = [
    {
      tag: settings.about_item_1_tag,
      title: settings.about_item_1_title,
      description: settings.about_item_1_description,
    },
    {
      tag: settings.about_item_2_tag,
      title: settings.about_item_2_title,
      description: settings.about_item_2_description,
    },
    {
      tag: settings.about_item_3_tag,
      title: settings.about_item_3_title,
      description: settings.about_item_3_description,
    },
  ].filter((pillar) => pillar.title.trim() !== "");

  return (
    <>
      <section
        id="beranda"
        className="relative flex min-h-163.5 flex-col justify-center overflow-hidden bg-[#2F3D36] max-[640px]:min-h-155"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0">
          <PublicHeroImage
            key={settings.hero_image || "static-hero"}
            src={settings.hero_image}
            alt={heroImageAlt}
            className="size-full! object-cover object-center motion-safe:animate-hero-zoom"
            />
        </div>
        <div
          className="absolute inset-0 bg-[rgba(15,40,30,0.55)] max-[640px]:bg-[linear-gradient(180deg,rgba(15,40,30,0.38)_0%,rgba(15,40,30,0.66)_45%,rgba(15,40,30,0.42)_100%)]"
          aria-hidden="true"
        />

        <div className="site-container relative z-10 pt-30 pb-10 text-white max-[640px]:pt-35 max-[640px]:pb-37.5 max-[640px]:text-center">
          <h1
            id="hero-title"
            style={{ animationDelay: "100ms" }}
            className="motion-safe:animate-fade-up font-serif text-[clamp(36px,3.6vw,56px)] leading-[1.12] font-bold text-white max-[640px]:text-[38px] max-[640px]:leading-[1.18]"
          >
            {settings.hero_title}{" "}
            {settings.hero_emphasis ? (
              <em className="block italic">{settings.hero_emphasis}</em>
            ) : null}
          </h1>
          {settings.hero_description ? (
            <p
              style={{ animationDelay: "220ms" }}
              className="mt-[18px] text-base text-white/[0.88] motion-safe:animate-fade-up max-[640px]:mx-auto max-[640px]:mt-1.5 max-[640px]:max-w-[22ch] max-[640px]:text-[15px]"
            >
              {settings.hero_description}
            </p>
          ) : null}
          <div
            style={{ animationDelay: "340ms" }}
            className="mt-[26px] flex flex-wrap gap-3 motion-safe:animate-fade-up max-[640px]:mt-[22px] max-[640px]:flex-nowrap max-[640px]:justify-center max-[640px]:gap-2"
          >
            {settings.hero_primary_label ? (
              <PublicButtonLink
                href="/program"
                tone="white"
                className="max-[640px]:max-w-[165px] max-[640px]:flex-1 max-[640px]:px-3.5 max-[640px]:py-[13px] max-[640px]:text-[10.5px] max-[640px]:tracking-[0.06em] max-[640px]:whitespace-nowrap"
              >
                {settings.hero_primary_label}
                <span aria-hidden="true" className="max-[640px]:hidden">
                  ↗
                </span>
              </PublicButtonLink>
            ) : null}
            {settings.hero_secondary_label ? (
              <PublicButtonLink
                href="/struktur"
                tone="outlineWhite"
                className="max-[640px]:max-w-[165px] max-[640px]:flex-1 max-[640px]:px-3.5 max-[640px]:py-[13px] max-[640px]:text-[10.5px] max-[640px]:tracking-[0.06em] max-[640px]:whitespace-nowrap"
              >
                {settings.hero_secondary_label}
              </PublicButtonLink>
            ) : null}
          </div>

          {heroStats.length > 0 ? (
            <div
              style={{ animationDelay: "500ms" }}
              className="mt-[110px] flex max-w-[915px] gap-14 border-t border-white/45 pt-4 motion-safe:animate-fade-up max-[640px]:hidden"
            >
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <strong className="block font-serif text-[13px] font-bold tracking-[0.04em] uppercase">
                    {stat.value}
                  </strong>
                  <span className="mt-1 block text-[10px] font-medium tracking-[0.08em] text-white/75 uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section
        id="tentang"
        className="bg-mint py-24 max-[640px]:py-18"
        aria-labelledby="tentang-title"
      >
        <div className="site-container grid gap-10 min-[961px]:grid-cols-[1fr_1.25fr] min-[961px]:gap-16">
          <div data-reveal>
            {settings.about_eyebrow ? (
              <PublicLabel>{settings.about_eyebrow}</PublicLabel>
            ) : null}
            <h2
              id="tentang-title"
              className="mt-3.5 font-serif text-[clamp(28px,2.6vw,34px)] leading-[1.32] font-bold text-green-900"
            >
              {settings.about_title}
            </h2>
            {settings.about_description ? (
              <p className="mt-5.5 max-w-[46ch] text-base text-muted">
                {settings.about_description}
              </p>
            ) : null}
          </div>

          <ul className="border-t border-[#C9D7CF]">
            {pillars.map((pillar) => (
              <li
                key={`${pillar.tag}-${pillar.title}`}
                data-reveal
                className="grid grid-cols-[110px_1fr] gap-4 border-b border-[#C9D7CF] py-[26px] max-[640px]:grid-cols-1 max-[640px]:gap-1.5 max-[640px]:py-[22px]"
              >
                <span className="text-[11px] font-medium tracking-[0.1em] text-green-700 uppercase">
                  {pillar.tag}
                </span>
                <div>
                  <h3 className="font-serif text-[17px] leading-snug font-bold text-green-900 max-[640px]:text-base">
                    {pillar.title}
                  </h3>
                  {pillar.description ? (
                    <p className="mt-2 text-sm text-muted">
                      {pillar.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="program-kerja"
        className="border-t border-line bg-paper py-24 max-[640px]:py-18"
        aria-labelledby="proker-title"
      >
        <div className="site-container">
          <div data-reveal>
            {settings.program_eyebrow ? (
              <PublicLabel>{settings.program_eyebrow}</PublicLabel>
            ) : null}
            <h2
              id="proker-title"
              className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-tight font-bold text-green-900"
            >
              {settings.program_title}
            </h2>
          </div>

          {programs.hasError ? (
            <PublicStateBox
              tone="error"
              icon={<TriangleAlert className="size-5.5" />}
              label="Gagal memuat"
              title="Program kerja tidak dapat ditampilkan"
              action={<RefreshButton />}
            >
              Terjadi gangguan saat mengambil data. Periksa koneksi internet,
              lalu coba lagi.
            </PublicStateBox>
          ) : programs.items.length === 0 ? (
            <PublicStateBox
              icon={<CalendarDays className="size-5.5" />}
              label="Program kerja"
              title={settings.program_empty_text}
            >
              Program kerja periode aktif akan tampil di sini setelah
              dipublikasikan.
            </PublicStateBox>
          ) : (
            <ProgramList
              programs={programs.items}
              brandName={settings.brand_name}
            />
          )}

          {programs.hasError ? null : (
            <div data-reveal className="mt-10 flex justify-center">
              <PublicButtonLink href="/program" tone="outline">
                Lihat Semua Program Kerja →
              </PublicButtonLink>
            </div>
          )}
        </div>
      </section>

      <PublicationsSection
        items={news.items}
        hasError={news.hasError}
        eyebrow={settings.news_eyebrow}
        title={settings.news_title}
        emptyText={settings.news_empty_text}
        instagram={links.instagram}
      />

      <OrganizationSection
        data={organization.data}
        hasError={organization.hasError}
        eyebrow={settings.structure_eyebrow}
        title={settings.structure_title}
        description={settings.structure_description}
        note={settings.structure_note}
        buttonLabel={settings.structure_button_label}
      />
    </>
  );
}