import Link from "next/link";

import { HighlightedText } from "@/components/public/HighlightedText";
import { ProgramStatusBadge } from "./ProgramStatusBadge";
import type { PublicProgram } from "../../types";

function plainTextExcerpt(value: string | null, maxLength = 118): string | null {
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

type ProgramListProps = {
  programs: PublicProgram[];
  /** Nama brand dipakai bila program tidak punya divisi. */
  brandName: string;
  /** Kata kunci pencarian untuk `<mark>`; kosong di beranda. */
  term?: string | null;
};

/**
 * Baris program kerja mengikuti `.proker` / `.proker__item` pada prototype.
 * Dipakai bersama oleh beranda (`#home-proker`, maksimal tiga item) dan
 * halaman `/program` supaya tampilannya identik.
 */
export function ProgramList({
  programs,
  brandName,
  term,
}: ProgramListProps) {
  return (
    <ul className="mt-10 grid gap-3.5 min-[641px]:block min-[641px]:border-t min-[641px]:border-line">
      {programs.map((program) => {
        const excerpt = plainTextExcerpt(program.description);
        const divisionName =
          program.division?.name?.trim() || brandName || "HIMATKN";
        const detailHref = `/program/${program.slug}`;

        return (
          <li
            key={program.id}
            data-reveal
            className="grid grid-cols-1 gap-0 rounded-[4px] border border-line bg-white p-[18px] transition-colors min-[641px]:grid-cols-[160px_1fr_140px] min-[641px]:gap-x-6 min-[641px]:rounded-none min-[641px]:border-x-0 min-[641px]:border-t-0 min-[641px]:border-b min-[641px]:bg-transparent min-[641px]:px-0 min-[641px]:pt-[26px] min-[641px]:pb-[22px] min-[641px]:hover:bg-mint/35"
          >
            <ProgramStatusBadge status={program.status} />

            <div>
              <h3 className="mt-3 font-serif text-[17px] leading-snug font-bold text-green-900 min-[641px]:mt-2">
                <Link
                  href={detailHref}
                  className="hover:underline hover:underline-offset-3"
                >
                  <HighlightedText text={program.name} term={term} />
                </Link>
              </h3>
              {excerpt ? (
                <p className="mt-2 max-w-[62ch] text-[15px] leading-6 text-muted">
                  <HighlightedText text={excerpt} term={term} />
                </p>
              ) : null}
            </div>

            <div className="hidden pt-2 text-right text-xs leading-normal text-muted min-[641px]:block">
              {divisionName}
              <br />
              {program.period.name}
            </div>

            <Link
              href={detailHref}
              className="col-start-1 mt-2.5 text-right text-[13px] font-semibold whitespace-nowrap text-green-800 underline underline-offset-[3px] transition-colors hover:text-green-700 hover:decoration-2 min-[641px]:col-start-3"
            >
              Baca Selengkapnya →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
