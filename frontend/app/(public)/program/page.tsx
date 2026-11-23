import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Search, TriangleAlert } from "lucide-react";

import { PublicButtonLink } from "@/components/public/PublicButton";
import { PublicSearch } from "@/components/public/PublicSearch";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { ProgramList } from "@/features/programs/components/public/ProgramList";
import { getPublicPrograms } from "@/features/programs/public-api";
import {
  isProgramStatus,
  normalizeProgramStatus,
  programStatusLabel,
} from "@/features/programs/status";
import type {
  ProgramStatus,
  PublicProgram,
  PublicProgramListResponse,
} from "@/features/programs/types";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";

export const dynamic = "force-dynamic";

type ProgramSearchParams = {
  q?: string | string[];
  status?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

function programHref({
  q,
  status,
}: {
  q?: string;
  status?: ProgramStatus | null;
}): string {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (q) params.set("q", q);

  const query = params.toString();

  return query ? `/program?${query}` : "/program";
}

function normalized(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function loadProgramPage(): Promise<{
  data: PublicProgramListResponse;
  hasError: boolean;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const data = await getPublicPrograms({
      limit: 50,
      signal: controller.signal,
    });

    return { data, hasError: false };
  } catch {
    return {
      data: { items: [], total: 0, offset: 0, limit: 50, period: null },
      hasError: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = resolvePublicSettings(await loadPublicSettings());

  return {
    title: "Program Kerja",
    description: `Seluruh inisiatif dan agenda strategis ${settings.brand_name}.`,
  };
}

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<ProgramSearchParams>;
}) {
  const params = await searchParams;
  const q = firstValue(params.q);
  const statusValue = firstValue(params.status);
  const status = isProgramStatus(statusValue) ? statusValue : null;

  const [programPage, settingsResult] = await Promise.all([
    loadProgramPage(),
    loadPublicSettings(),
  ]);

  const settings = resolvePublicSettings(settingsResult);
  const { data, hasError } = programPage;
  const allItems: PublicProgram[] = data.items;
  const periodName = data.period?.name ?? null;
  const intro = periodName
    ? `Seluruh inisiatif dan agenda strategis ${settings.brand_name} periode ${periodName}.`
    : `Seluruh inisiatif dan agenda strategis ${settings.brand_name}.`;

  const counts = {
    all: allItems.length,
    planned: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const program of allItems) {
    const value = normalizeProgramStatus(program.status);
    if (value) counts[value] += 1;
  }

  const normalizedTerm = normalized(q);
  const visibleItems = allItems.filter((program) => {
    if (status && normalizeProgramStatus(program.status) !== status) {
      return false;
    }

    if (!normalizedTerm) return true;

    return normalized(`${program.name} ${program.description ?? ""}`).includes(
      normalizedTerm,
    );
  });

  const statusTabs: Array<{
    value: ProgramStatus | null;
    label: string;
    count: number;
  }> = [
    { value: null, label: "Semua", count: counts.all },
    { value: "ongoing", label: programStatusLabel("ongoing"), count: counts.ongoing },
    { value: "planned", label: programStatusLabel("planned"), count: counts.planned },
    {
      value: "completed",
      label: programStatusLabel("completed"),
      count: counts.completed,
    },
  ];

  if (counts.cancelled > 0) {
    statusTabs.push({
      value: "cancelled",
      label: programStatusLabel("cancelled"),
      count: counts.cancelled,
    });
  }

  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <PublicPageHeader
          title="Program Kerja"
          intro={intro}
        />

        <PublicSearch
          initialValue={q}
          label="Cari program kerja"
          placeholder="Cari program kerja…"
          preserve={["status"]}
        />

        <p
          className="mt-3.5 min-h-5 text-center text-[13px] text-muted"
          aria-live="polite"
        >
          {q && visibleItems.length > 0 ? (
            <>
              <strong className="text-green-900">{visibleItems.length}</strong>{" "}
              program kerja cocok dengan “{q}”
            </>
          ) : null}
        </p>

        <div className="mt-2 flex justify-center">
          <div
            className="inline-flex max-w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-[4px] border border-line bg-paper p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[641px]:flex-wrap min-[641px]:justify-center min-[641px]:overflow-visible"
            role="tablist"
            aria-label="Filter status"
          >
            {statusTabs.map((tab) => {
              const active = tab.value === status;
              const href = programHref({ q, status: tab.value });

              return (
                <Link
                  key={tab.value ?? "all"}
                  href={href}
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-[3px] px-4 py-[11px] text-xs font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors min-[641px]:px-[22px] min-[641px]:py-3 ${
                    active
                      ? "bg-green-800 text-white hover:text-white"
                      : "text-muted hover:text-green-900"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 font-medium opacity-70">
                    {tab.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-(--container)">
          <div aria-live="polite">
            {hasError ? (
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
            ) : visibleItems.length > 0 ? (
              <ProgramList
                programs={visibleItems}
                brandName={settings.brand_name}
                term={q}
              />
            ) : q ? (
              <PublicStateBox
                icon={<Search className="size-5.5" />}
                label="Pencarian"
                title={`Tidak ada program kerja untuk “${q}”`}
                action={
                  <PublicButtonLink
                    href={programHref({ status })}
                    tone="outline"
                  >
                    Hapus pencarian
                  </PublicButtonLink>
                }
              >
                Periksa ejaan atau gunakan kata kunci lain.
              </PublicStateBox>
            ) : status ? (
              <PublicStateBox
                icon={<Search className="size-5.5" />}
                label="Filter"
                title={`Tidak ada program berstatus “${programStatusLabel(
                  status,
                )}”`}
                action={
                  <PublicButtonLink href={programHref({ q })} tone="outline">
                    Tampilkan semua
                  </PublicButtonLink>
                }
              >
                Coba pilih status lain untuk melihat program kerja yang
                tersedia.
              </PublicStateBox>
            ) : (
              <PublicStateBox
                icon={<CalendarDays className="size-5.5" />}
                label="Program kerja"
                title="Belum ada program kerja"
              >
                Program kerja periode aktif akan tampil di sini setelah
                dipublikasikan.
              </PublicStateBox>
            )}
          </div>

          {!hasError && data.total > 50 ? (
            <p className="mt-5 text-center text-xs text-muted">
              Menampilkan 50 dari {data.total} program kerja. Gunakan pencarian
              atau filter status untuk mempersempit daftar.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}