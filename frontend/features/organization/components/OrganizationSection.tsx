import Link from "next/link";
import { ArrowRight, TriangleAlert, Users } from "lucide-react";

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
  const divisions = data?.divisions ?? [];
  const divisionCount = divisions.length;
  const hasLinkCard = divisionCount % 2 === 1;

  return (
    <section
      id="kepengurusan"
      className="bg-green-950 py-24 text-white max-[640px]:py-18"
      aria-labelledby="struct-title"
    >
      <div className="site-container">
        <div className="mb-11 max-w-[560px]">
          {eyebrow ? <PublicLabel tone="dark">{eyebrow}</PublicLabel> : null}
          <h2
            id="struct-title"
            className="mt-3.5 font-serif text-[clamp(26px,2.6vw,34px)] leading-tight font-bold text-white"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-[18px] text-base text-on-dark-soft">
              {description}
            </p>
          ) : null}
        </div>

        {hasError ? (
          <PublicStateBox
            tone="dark"
            icon={<TriangleAlert className="size-5.5" />}
            label="Gagal memuat"
            title="Struktur kepengurusan tidak dapat ditampilkan"
            action={<RefreshButton tone="outlineWhite" />}
          >
            Terjadi gangguan saat mengambil data. Periksa koneksi internet,
            lalu coba lagi.
          </PublicStateBox>
        ) : !period || divisionCount === 0 ? (
          <PublicStateBox
            tone="dark"
            icon={<Users className="size-5.5" />}
            label="Kepengurusan"
            title="Struktur periode baru sedang disusun"
          >
            Susunan pengurus akan diumumkan setelah pelantikan kabinet.
          </PublicStateBox>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-[4px] border border-line-on-dark max-[640px]:grid max-[640px]:grid-cols-2">
              <div className="px-3 py-[22px] text-center">
                <strong className="block text-[28px] leading-[1.1] font-bold">
                  {divisionCount}
                </strong>
                <span className="text-[10px] font-medium tracking-[0.1em] text-on-dark-soft uppercase">
                  Bagian
                </span>
              </div>
              <div className="border-l border-line-on-dark px-3 py-[22px] text-center">
                <strong className="block pt-2 text-[18px] leading-[1.1] font-bold">
                  {period.name}
                </strong>
                <span className="text-[10px] font-medium tracking-[0.1em] text-on-dark-soft uppercase">
                  Periode
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-[4px] border border-line-on-dark border-t-[6px] border-t-[#1F3E33] max-[640px]:hidden">
              {divisions.map((division) => (
                <div
                  key={division.id}
                  className="border-b border-line-on-dark px-[30px] py-8 transition-colors hover:bg-[#0A2F22] [&:nth-child(odd)]:border-r [&:nth-last-child(-n+2)]:border-b-0"
                >
                  <p className="text-[10px] font-medium tracking-[0.1em] text-on-dark-soft uppercase">
                    Divisi
                  </p>
                  <h3 className="mt-3.5 font-serif text-[17px] font-bold text-white">
                    {division.name}
                  </h3>
                  {division.description ? (
                    <p className="mt-2 max-w-[46ch] text-sm text-on-dark-soft">
                      {division.description}
                    </p>
                  ) : null}
                </div>
              ))}

              {hasLinkCard ? (
                <Link
                  href="/struktur?view=semua"
                  className="flex flex-col justify-center border-b border-line-on-dark px-[30px] py-8 transition-colors hover:bg-[#0B3125] [&:nth-child(odd)]:border-r [&:nth-last-child(-n+2)]:border-b-0"
                >
                  <p className="text-[10px] font-medium tracking-[0.1em] text-on-dark-soft uppercase">
                    Struktur
                  </p>
                  <h3 className="mt-3.5 font-serif text-[17px] font-bold text-white">
                    Lihat seluruh pengurus
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-sm text-on-dark-soft">
                    Nama dan jabatan tiap divisi periode {period.name}.
                  </p>
                </Link>
              ) : null}
            </div>

            <div className="mt-8.5 flex flex-wrap items-center justify-between gap-5 text-[13px] text-on-dark-soft max-[640px]:mt-0">
              {note ? <p className="max-[640px]:hidden">{note}</p> : null}
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
