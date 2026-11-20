import { ArrowRight, Users } from "lucide-react";

import { PublicButtonLink } from "@/components/public/PublicButton";
import { PublicLabel } from "@/components/public/PublicLabel";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { RefreshButton } from "@/components/public/RefreshButton";
import type { PublicOrganizationResponse } from "../types";

type OrganizationSectionProps = {
  data: PublicOrganizationResponse | null;
  hasError: boolean;
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  buttonLabel: string;
};

export function OrganizationSection({
  data,
  hasError,
  eyebrow,
  title,
  description,
  note,
  buttonLabel,
}: OrganizationSectionProps) {
  const period = data?.period ?? null;
  const members = data?.members ?? [];

  return (
    <section
      id="struktur"
      className="bg-green-950 py-24 text-white max-[640px]:py-18"
      aria-labelledby="structure-title"
    >
      <div className="site-container">
        <div className="max-w-140">
          {eyebrow ? <PublicLabel tone="dark">{eyebrow}</PublicLabel> : null}
          <h2
            id="structure-title"
            className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-tight font-bold text-white"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4.5 text-base text-on-dark-soft">{description}</p>
          ) : null}
        </div>

        {hasError ? (
          <PublicStateBox
            tone="dark"
            icon={<Users className="size-5.5" />}
            label="Gagal memuat"
            title="Struktur belum dapat dimuat"
            action={<RefreshButton tone="outlineWhite" />}
          >
            Koneksi ke layanan organisasi sedang bermasalah. Coba muat kembali
            halaman ini.
          </PublicStateBox>
        ) : !period ? (
          <PublicStateBox
            tone="dark"
            icon={<Users className="size-5.5" />}
            label="Kepengurusan"
            title="Belum ada periode kepengurusan aktif"
          >
            Susunan pengurus akan tampil setelah periode aktif dipublikasikan.
          </PublicStateBox>
        ) : (
          <>
            <dl className="mt-11 grid grid-cols-2 rounded-sm border border-line-on-dark">
              <div className="px-3 py-5.5 text-center">
                <dt className="text-[10px] font-medium tracking-widest text-on-dark-soft uppercase">
                  Periode
                </dt>
                <dd className="mt-1.5 font-serif text-[22px] leading-tight font-bold text-white">
                  {period.name}
                </dd>
              </div>
              <div className="border-l border-line-on-dark px-3 py-5.5 text-center">
                <dt className="text-[10px] font-medium tracking-widest text-on-dark-soft uppercase">
                  Anggota
                </dt>
                <dd className="mt-1.5 font-serif text-[22px] leading-tight font-bold text-white">
                  {members.length}
                </dd>
              </div>
            </dl>

            <div className="mt-8.5 flex flex-wrap items-center justify-between gap-5 text-[13px] text-on-dark-soft">
              {note ? <p>{note}</p> : null}
              {buttonLabel ? (
                <PublicButtonLink href="/struktur" tone="white">
                  {buttonLabel}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </PublicButtonLink>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
