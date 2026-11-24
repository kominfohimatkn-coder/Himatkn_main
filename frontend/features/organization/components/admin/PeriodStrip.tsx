"use client";

import { Pencil, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { formatOrganizationRange } from "./OrganizationPrimitives";

import type { AdminPeriod } from "../../types";

/**
 * Deretan kartu periode, mengikuti `.period-strip` + `.period` di Design/admin.
 * Desktop: grid. Ponsel: satu baris yang digeser, periode aktif paling depan.
 * Jumlah divisi/anggota hanya diketahui untuk periode terpilih.
 */
export default function PeriodStrip({
  periods,
  selectedId,
  selectedCounts,
  canManage,
  onSelect,
  onEdit,
  onActivate,
  onDelete,
}: {
  periods: AdminPeriod[];
  selectedId: number | null;
  selectedCounts: { divisions: number; members: number } | null;
  canManage: boolean;
  onSelect: (periodId: number) => void;
  onEdit: (period: AdminPeriod) => void;
  onActivate: (period: AdminPeriod) => void;
  onDelete: (period: AdminPeriod) => void;
}) {
  return (
    <div
      role="list"
      aria-label="Periode"
      className="mb-[18px] grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5 max-[640px]:-mx-4 max-[640px]:flex max-[640px]:snap-x max-[640px]:snap-mandatory max-[640px]:scroll-px-4 max-[640px]:overflow-x-auto max-[640px]:px-4 max-[640px]:pb-1 max-[640px]:[scrollbar-width:none]"
    >
      {periods.map((period) => {
        const selected = period.id === selectedId;
        const counts = selected ? selectedCounts : null;

        return (
          <div
            key={period.id}
            role="listitem"
            className={`flex flex-col rounded-[4px] border bg-white transition-colors max-[640px]:w-[80%] max-[640px]:shrink-0 max-[640px]:snap-start ${
              selected
                ? "border-green-800 shadow-[inset_0_0_0_1px_var(--color-green-800)]"
                : "border-line hover:border-line-strong"
            } ${period.is_active ? "max-[640px]:order-first" : ""}`}
          >
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(period.id)}
              className="grid cursor-pointer gap-[3px] px-4 pt-3.5 pb-2.5 text-left"
            >
              <span
                className={`text-[11px] leading-[1.2] font-semibold tracking-[0.1em] uppercase ${
                  period.is_active
                    ? "text-green-700 before:mr-1.5 before:inline-block before:size-[7px] before:rounded-full before:bg-green-700 before:align-[1px]"
                    : "text-muted-light"
                }`}
              >
                {period.is_active ? "Periode aktif" : "Tidak aktif"}
              </span>
              <span className="mt-1 mb-0.5 font-serif text-[17px] leading-[1.25] font-bold text-green-900">
                {period.name}
              </span>
              {counts ? (
                <span className="text-xs text-muted">
                  {counts.divisions} divisi · {counts.members} anggota
                </span>
              ) : null}
              <span className="text-xs text-muted">
                {formatOrganizationRange(period.start_date, period.end_date)}
              </span>
            </button>

            {canManage ? (
              <div className="mt-auto flex flex-wrap gap-0.5 border-t border-line px-2 pt-1 pb-2">
                <Button variant="ghost" size="xs" onClick={() => onEdit(period)} aria-label={`Ubah periode ${period.name}`}>
                  <Pencil aria-hidden="true" /> Ubah
                </Button>
                {period.is_active ? null : (
                  <>
                    <Button variant="ghost" size="xs" onClick={() => onActivate(period)} aria-label={`Aktifkan periode ${period.name}`}>
                      <Power aria-hidden="true" /> Aktifkan
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => onDelete(period)} aria-label={`Hapus periode ${period.name}`}>
                      <Trash2 aria-hidden="true" /> Hapus
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}