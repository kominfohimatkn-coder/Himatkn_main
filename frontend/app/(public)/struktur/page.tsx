import type { Metadata } from "next";

import { StructurePage } from "@/features/organization/components/StructurePage";
import { loadPublicOrganization } from "@/features/organization/public-api";
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

export default async function StrukturPage() {
  const [organization, settingsResult] = await Promise.all([
    loadPublicOrganization(),
    loadPublicSettings(),
  ]);
  const settings = resolvePublicSettings(settingsResult);

  return (
    <StructurePage
      data={organization.data}
      hasError={organization.hasError}
      eyebrow={settings.structure_eyebrow}
      title={settings.structure_title}
      description={settings.structure_description}
    />
  );
}
