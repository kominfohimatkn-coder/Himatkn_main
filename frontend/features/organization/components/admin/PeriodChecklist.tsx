"use client";

import type { ReactNode } from "react";

import { Can } from "@/components/admin/shared/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

import { organizationPrimaryActionClass } from "./OrganizationPrimitives";

import type { AdminPeriod } from "../../types";

interface PeriodChecklistProps {
  period: AdminPeriod;
  divisionCount: number;
  divisionsLoading: boolean;
  onActivate: (period: AdminPeriod) => void;
}

function ChecklistItem({
  index,
  label,
  hint,
  done = false,
  informational = false,
  action,
}: {
  index: number;
  label: string;
  hint: string;
  done?: boolean;
  informational?: boolean;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={[
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
          done
            ? "border-green-700 bg-green-700 text-white"
            : "border-paper-line bg-bg-light text-ink-soft",
        ].join(" ")}
      >
        {done ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="size-3.5"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        ) : informational ? (
          "–"
        ) : (
          index
        )}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-bg-dark">{label}</p>

        <p className="mt-0.5 text-xs leading-5 text-ink-soft">{hint}</p>

        {action && <div className="mt-2">{action}</div>}
      </div>
    </li>
  );
}

export default function PeriodChecklist({
  period,
  divisionCount,
  divisionsLoading,
  onActivate,
}: PeriodChecklistProps) {
  const hasDivisions = !divisionsLoading && divisionCount > 0;

  return (
    <section
      aria-labelledby="period-checklist-title"
      className="mt-6 border border-gold/40 bg-gold/10 p-5"
    >
      <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
        Menyiapkan periode {period.name}
      </p>

      <h2
        id="period-checklist-title"
        className="mt-1 font-serif text-lg font-semibold text-bg-dark"
      >
        Checklist periode baru
      </h2>

      <p className="mt-1 text-sm leading-6 text-ink-soft">
        Data anggota belum dimuat di halaman ini; anggota tetap dikelola di
        bagian Anggota.
      </p>

      <ol className="mt-4 space-y-4">
        <ChecklistItem
          index={1}
          label="Divisi sudah ada"
          done={hasDivisions}
          hint={
            divisionsLoading
              ? "Memuat divisi..."
              : hasDivisions
                ? `${divisionCount} divisi tersedia di periode ini.`
                : "Belum ada divisi di periode ini. Tambahkan atau salin divisi terlebih dahulu."
          }
        />

        <ChecklistItem
          index={2}
          label="Anggota sudah ada"
          informational
          hint="Dikelola di bagian Anggota."
        />

        <ChecklistItem
          index={3}
          label="Siap diaktifkan"
          hint="Situs publik akan langsung memakai periode ini setelah diaktifkan."
          action={
            <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
              <button
                type="button"
                onClick={() => onActivate(period)}
                className={organizationPrimaryActionClass}
              >
                Aktifkan periode
              </button>
            </Can>
          }
        />
      </ol>
    </section>
  );
}
