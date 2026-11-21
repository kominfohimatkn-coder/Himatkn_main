import { TriangleAlert, Users } from "lucide-react";
import type { Metadata } from "next";

import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import { StructureView } from "@/features/organization/components/public/StructureView";
import { loadPublicOrganization } from "@/features/organization/public-api";
import { buildStructure } from "@/features/organization/structure";
import {
  loadPublicSettings,
  resolvePublicSettings,
} from "@/features/settings/public-api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = resolvePublicSettings(await loadPublicSettings());

  return {
    title: settings.structure_title,
    description: `Susunan pengurus, divisi, jabatan, dan anggota ${settings.brand_name} pada periode aktif.`,
  };
}

type StrukturPageProps = {
  searchParams: Promise<{ view?: string; div?: string }>;
};

export default async function StrukturPage({ searchParams }: StrukturPageProps) {
  const [organization, settingsResult, params] = await Promise.all([
    loadPublicOrganization(),
    loadPublicSettings(),
    searchParams,
  ]);
  const settings = resolvePublicSettings(settingsResult);
  const data = organization.data;
  const divisions = data?.period ? buildStructure(data) : [];

  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <h1 className="text-center font-serif text-[clamp(32px,3.4vw,44px)] leading-[1.25] font-bold text-green-900">
          {settings.structure_title}
        </h1>
        <hr className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] border-0 bg-line" />

        {organization.hasError ? (
          <div className="mt-12">
            <PublicStateBox
              tone="error"
              icon={<TriangleAlert className="size-5.5" />}
              label="Gagal memuat"
              title="Struktur kepengurusan tidak dapat ditampilkan"
              action={<RefreshButton />}
            >
              Terjadi gangguan saat mengambil data. Periksa koneksi internet,
              lalu coba lagi.
            </PublicStateBox>
          </div>
        ) : !data?.period || divisions.length === 0 ? (
          <div className="mt-12">
            <PublicStateBox
              icon={<Users className="size-5.5" />}
              label="Kepengurusan"
              title="Struktur periode baru sedang disusun"
            >
              Susunan pengurus akan tampil setelah pelantikan kabinet.
            </PublicStateBox>
          </div>
        ) : (
          <StructureView
            divisions={divisions}
            periodName={data.period.name}
            initialView={params.view === "semua" ? "semua" : "divisi"}
            initialDivisionId={params.div ?? null}
          />
        )}
      </div>
    </section>
  );
}
