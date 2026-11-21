import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";

import { PlainTextBody } from "@/components/public/PlainTextBody";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { ProgramStatusBadge } from "@/features/programs/components/public/ProgramStatusBadge";
import { getPublicProgramBySlug } from "@/features/programs/public-api";
import type { PublicProgram } from "@/features/programs/types";
import { getPublicLinks } from "@/features/settings/links";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";
import { formatDateRange } from "@/lib/format-date";

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function descriptionExcerpt(value: string | null, maxLength = 160): string {
  if (!value) return "";

  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");

  return `${(lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

async function loadProgram(slug: string): Promise<{
  program: PublicProgram | null;
  hasError: boolean;
}> {
  try {
    return { program: await getPublicProgramBySlug(slug), hasError: false };
  } catch {
    return { program: null, hasError: true };
  }
}

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublicProgramBySlug(slug).catch(() => null);

  if (!program) {
    return { title: "Program Kerja" };
  }

  const description = descriptionExcerpt(program.description);

  return {
    title: program.name,
    description: description || `Program kerja periode ${program.period.name}.`,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  const [programResult, settingsResult] = await Promise.all([
    loadProgram(slug),
    loadPublicSettings(),
  ]);

  if (!programResult.hasError && !programResult.program) {
    notFound();
  }

  const settings = resolvePublicSettings(settingsResult);
  const links = getPublicLinks(settings);
  const program = programResult.program;

  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <div className="mx-auto max-w-[720px]">
          <form
            role="search"
            action="/program"
            method="get"
            className="mb-7 flex flex-col gap-2 min-[641px]:flex-row"
          >
            <label className="sr-only" htmlFor="detail-q">
              Cari program kerja
            </label>
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="detail-q"
                name="q"
                type="search"
                required
                placeholder="Cari program kerja lain…"
                autoComplete="off"
                className="h-11 w-full rounded-[4px] border border-line bg-[#F7F9F8] py-[13px] pr-3.5 pl-10 text-sm text-ink transition-[border-color,box-shadow] focus:border-green-800 focus:shadow-[0_0_0_3px_rgba(15,77,54,0.12)] focus:outline-none"
              />
            </div>
            <PublicButton type="submit" tone="solid" className="flex-none">
              Cari
            </PublicButton>
          </form>
        </div>

        <article className="mx-auto max-w-[720px]" aria-live="polite">
          {programResult.hasError || !program ? (
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
          ) : (
            <>
              <p className="text-xs tracking-[0.04em] text-muted">
                <Link
                  href="/"
                  className="text-green-800 no-underline hover:underline"
                >
                  Beranda
                </Link>{" "}
                /{" "}
                <Link
                  href="/program"
                  className="text-green-800 no-underline hover:underline"
                >
                  Program Kerja
                </Link>
              </p>

              <h1 className="mt-[18px] font-serif text-[clamp(28px,3.2vw,40px)] leading-[1.25] font-bold text-green-900">
                {program.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3.5 text-[13px] text-muted">
                <ProgramStatusBadge status={program.status} />
                <span>
                  {program.division?.name?.trim() || settings.brand_name} ·{" "}
                  {program.period.name}
                </span>
                {formatDateRange(program.start_date, program.end_date) ? (
                  <span>
                    {formatDateRange(program.start_date, program.end_date)}
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <PlainTextBody text={program.description} />
              </div>

              <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
                <Link
                  href="/program"
                  className="text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2"
                >
                  ← Kembali ke Program Kerja
                </Link>
                {links.instagram ? (
                  <a
                    href={links.instagram.href}
                    target={links.instagram.target}
                    rel={links.instagram.rel}
                    className="text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2"
                  >
                    Dokumentasi di Instagram →
                  </a>
                ) : null}
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
