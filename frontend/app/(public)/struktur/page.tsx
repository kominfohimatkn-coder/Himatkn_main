import type { Metadata } from "next";

import { StructurePage } from "@/features/organization/components/StructurePage";
import { loadPublicOrganization } from "@/features/organization/public-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Susunan Kepengurusan",
  description:
    "Susunan pengurus, divisi, jabatan, dan anggota HIMATKN pada periode aktif.",
};

export default async function StrukturPage() {
  const organization = await loadPublicOrganization();

  return (
    <StructurePage
      data={organization.data}
      hasError={organization.hasError}
    />
  );
}
