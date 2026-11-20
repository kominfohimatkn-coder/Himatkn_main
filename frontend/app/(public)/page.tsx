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
import {
  normalizeProgramStatus,
  programStatusLabel,
} from "@/features/programs/status";
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

function plainTextExcerpt(
  value: string | null,
  maxLength = 118,
): string | null {
  if (!value) return null;

  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.trimEnd()}…`;
}

function programStatusBadgeClass(value: unknown): string {
  switch (normalizeProgramStatus(value)) {
    case "planned":
      return "border border-amber bg-white text-amber";
    case "ongoing":
      return "bg-mint text-green-900";
    case "completed":
      return "bg-green-800 text-white";
    case "cancelled":
      return "border border-danger/30 bg-danger/5 text-danger";
    default:
      return "border border-line bg-white text-muted";
  }
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
            className="size-full object-cover object-center"
            />
        </div>
        <div
          className="absolute inset-0 bg-[rgba(15,40,30,0.55)] max-[640px]:bg-[linear-gradient(180deg,rgba(15,40,30,0.38)_0%,rgba(15,40,30,0.66)_45%,rgba(15,40,30,0.42)_100%)]"
          aria-hidden="true"
        />

        <div className="site-container relative z-10 pt-30 pb-10 text-white max-[640px]:pt-35 max-[640px]:pb-37.5 max-[640px]:text-center">
          <h1
            id="hero-title"
            className="font-serif text-[clamp(36px,3.6vw,56px)] leading-[1.12] font-bold text-white max-[640px]:text-[38px] max-[640px]:leading-[1.18]"
          >
            {settings.hero_title}{" "}
            {settings.hero_emphasis ? (
              <em className="block italic">{settings.hero_emphasis}</em>
            ) : null}
          </h1>
          {settings.hero_description ? (
            <p className="mt-[18px] text-base text-white/[0.88] max-[640px]:mx-auto max-[640px]:mt-1.5 max-[640px]:max-w-[22ch] max-[640px]:text-[15px]">
              {settings.hero_description}
            </p>
          ) : null}
          <div className="mt-[26px] flex flex-wrap gap-3 max-[640px]:mt-[22px] max-[640px]:flex-nowrap max-[640px]:justify-center max-[640px]:gap-2">
            {settings.hero_primary_label ? (
              <PublicButtonLink
                href="#program-kerja"
                tone="white"
                className="max-[640px]:max-w-[165px] max-[640px]:flex-1 max-[640px]:whitespace-nowrap"
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
                className="max-[640px]:max-w-[165px] max-[640px]:flex-1 max-[640px]:whitespace-nowrap"
              >
                {settings.hero_secondary_label}
              </PublicButtonLink>
            ) : null}
          </div>

          {heroStats.length > 0 ? (
            <div className="mt-[110px] flex max-w-[915px] gap-14 border-t border-white/45 pt-4 max-[640px]:hidden">
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
          <div>
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
          <div>
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
            <ul className="mt-10 border-t border-line max-[640px]:grid max-[640px]:gap-3.5 max-[640px]:border-0">
              {programs.items.map((program) => {
                const excerpt = plainTextExcerpt(program.description);
                const status = normalizeProgramStatus(program.status);
                const divisionName =
                  program.division?.name?.trim() || "HIMATKN";

                return (
                  <li
                    key={program.id}
                    className="grid grid-cols-[160px_1fr_140px] gap-x-6 border-b border-line pt-[26px] pb-[22px] transition-colors hover:bg-mint/35 max-[640px]:grid-cols-1 max-[640px]:gap-0 max-[640px]:rounded-[4px] max-[640px]:border max-[640px]:border-line max-[640px]:bg-white max-[640px]:p-[18px] max-[640px]:hover:bg-white"
                  >
                    <span
                      className={`inline-flex h-[26px] w-fit items-center gap-1.5 self-start rounded-[3px] px-3 text-[11px] leading-none font-semibold tracking-[0.08em] whitespace-nowrap uppercase ${programStatusBadgeClass(program.status)}`}
                    >
                      {status === "ongoing" ? (
                        <span
                          className="size-1.5 rounded-full bg-green-800"
                          aria-hidden="true"
                        />
                      ) : null}
                      {programStatusLabel(program.status)}
                    </span>

                    <div>
                      <h3 className="mt-2 font-serif text-[17px] leading-snug font-bold text-green-900 max-[640px]:mt-3">
                        {program.name}
                      </h3>
                      {excerpt ? (
                        <p className="mt-2 max-w-[62ch] text-[15px] leading-6 text-muted">
                          {excerpt}
                        </p>
                      ) : null}
                      {/* TODO(program-pages): tambahkan tautan "Baca Selengkapnya →"
                          ke /program/[slug] setelah route halaman program tersedia. */}
                    </div>

                    <div className="pt-2 text-right text-xs leading-normal text-muted max-[640px]:hidden">
                      {divisionName}
                      <br />
                      {program.period.name}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {/* TODO(program-pages): tampilkan tombol "Lihat Semua Program Kerja →"
              ke /program setelah route halaman program tersedia. */}
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
