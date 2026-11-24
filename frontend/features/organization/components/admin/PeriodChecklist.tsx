"use client";

import type { ReactNode } from "react";
import { Check, Copy, Plus, Power } from "lucide-react";

import { Button } from "@/components/ui/Button";

import type { AdminPeriod } from "../../types";

/**
 * Langkah menyiapkan periode baru, mengikuti `.checklist` di Design/admin.
 * Hanya tampil untuk periode tidak aktif yang divisi atau anggotanya masih kosong.
 */
export default function PeriodChecklist({
  period,
  divisionCount,
  memberCount,
  onCopy,
  onOpenDivisions,
  onAddMember,
  onActivate,
}: {
  period: AdminPeriod;
  divisionCount: number;
  memberCount: number;
  onCopy: () => void;
  onOpenDivisions: () => void;
  onAddMember: () => void;
  onActivate: () => void;
}) {
  const steps: [string, boolean, ReactNode][] = [
    ["Buat periode", true, null],
    [
      "Salin divisi dari periode lain",
      divisionCount > 0,
      <Button key="copy" variant="outline" size="xs" onClick={onCopy}>
        <Copy aria-hidden="true" /> Salin divisi
      </Button>,
    ],
    [
      "Sesuaikan divisi (tambah, ubah, hapus)",
      divisionCount > 0 && memberCount > 0,
      <Button key="divs" variant="ghost" size="xs" onClick={onOpenDivisions}>
        Buka daftar divisi
      </Button>,
    ],
    [
      "Isi anggota",
      memberCount > 0,
      <Button key="member" variant="outline" size="xs" onClick={onAddMember}>
        <Plus aria-hidden="true" /> Tambah anggota
      </Button>,
    ],
    [
      "Aktifkan periode",
      period.is_active,
      <Button key="activate" size="xs" onClick={onActivate}>
        <Power aria-hidden="true" /> Aktifkan
      </Button>,
    ],
  ];
  const next = steps.findIndex(([, done]) => !done);
  const doneCount = steps.filter(([, done]) => done).length;

  return (
    <section
      aria-label={`Langkah menyiapkan periode ${period.name}`}
      className="mb-[18px] rounded-[4px] border border-green-800 bg-white"
    >
      <div className="border-b border-line px-5 py-4">
        <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-green-700 uppercase">
          Menyiapkan periode {period.name}
        </p>
        <h2 className="mt-1 font-serif text-base font-bold text-green-900">
          {doneCount} dari {steps.length} langkah selesai
        </h2>
      </div>

      <ol className="grid gap-0.5 px-5 pt-2 pb-4">
        {steps.map(([label, done, action], index) => {
          const isNext = index === next;

          return (
            <li key={label} className="flex flex-wrap items-center gap-3 py-2">
              <span
                aria-hidden="true"
                className={`grid size-[26px] shrink-0 place-items-center rounded-full border-[1.5px] text-xs font-bold [&_svg]:size-3.5 ${
                  done
                    ? "border-green-800 bg-green-800 text-white"
                    : isNext
                      ? "border-green-800 text-green-800"
                      : "border-line-strong text-muted"
                }`}
              >
                {done ? <Check /> : index + 1}
              </span>
              <span
                className={`min-w-40 flex-1 ${
                  done ? "text-ink" : isNext ? "font-semibold text-green-900" : "text-muted"
                }`}
              >
                {label}
                {done ? <span className="sr-only"> (selesai)</span> : null}
              </span>
              {isNext ? action : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}