"use client";

import { Can } from "@/components/admin/shared/Can";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { PERMISSIONS } from "@/features/auth/permissions";

import {
  formatOrganizationRange,
  organizationActionClass,
  organizationDangerActionClass,
  organizationPrimaryActionClass,
  OrganizationNotice,
  OrganizationStatusBadge,
} from "./OrganizationPrimitives";

import type { AdminPeriod } from "../../types";

interface PeriodToolbarProps {
  periods: AdminPeriod[];
  selectedPeriod: AdminPeriod | null;
  isLoading: boolean;
  error: string;
  onReload: () => void;
  onSelect: (periodId: number) => void;
  onCreate: () => void;
  onEdit: (period: AdminPeriod) => void;
  onActivate: (period: AdminPeriod) => void;
  onDelete: (period: AdminPeriod) => void;
}

export default function PeriodToolbar({
  periods,
  selectedPeriod,
  isLoading,
  error,
  onReload,
  onSelect,
  onCreate,
  onEdit,
  onActivate,
  onDelete,
}: PeriodToolbarProps) {
  return (
    <section
      aria-labelledby="period-toolbar-title"
      className="mt-6 border border-paper-line bg-bg-light p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="period-toolbar-title" className="sr-only">
          Pemilih periode
        </h2>

        <div className="w-full sm:max-w-sm">
          <FormField
            label="Periode"
            hint="Periode aktif ditandai (aktif) dan menjadi default."
          >
            <Select
              id="organization-period"
              name="period_id"
              value={selectedPeriod ? String(selectedPeriod.id) : ""}
              onChange={(event) => {
                const periodId = Number(event.target.value);

                if (Number.isInteger(periodId) && periodId > 0) {
                  onSelect(periodId);
                }
              }}
              placeholder="Pilih periode"
              disabled={isLoading || periods.length === 0}
            >
              {periods.map((period) => (
                <option key={period.id} value={String(period.id)}>
                  {period.name}
                  {period.is_active ? " (aktif)" : ""}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className={organizationActionClass}
          >
            Muat ulang
          </button>

          <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
            <button
              type="button"
              onClick={onCreate}
              className={organizationPrimaryActionClass}
            >
              Periode baru
            </button>
          </Can>
        </div>
      </div>

      {isLoading ? (
        <p
          role="status"
          className="mt-4 border-t border-paper-line pt-4 text-sm text-ink-soft"
        >
          Memuat periode...
        </p>
      ) : error ? (
        <div className="mt-4 border-t border-paper-line pt-4">
          <OrganizationNotice tone="error">
            <p className="font-medium">Periode belum dapat dimuat</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={onReload}
              className={`${organizationActionClass} mt-3`}
            >
              Coba lagi
            </button>
          </OrganizationNotice>
        </div>
      ) : !selectedPeriod ? (
        <div className="mt-4 border-t border-paper-line pt-4">
          <OrganizationNotice tone="info">
            Belum ada periode organisasi. Buat periode pertama untuk mulai
            mengelola divisi.
          </OrganizationNotice>
        </div>
      ) : (
        <div className="mt-4 border-t border-paper-line pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                Periode terpilih
              </p>

              <p className="mt-1 font-serif text-xl font-semibold text-bg-dark">
                {selectedPeriod.name}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-soft">
                <OrganizationStatusBadge active={selectedPeriod.is_active} />

                <span>
                  {formatOrganizationRange(
                    selectedPeriod.start_date,
                    selectedPeriod.end_date,
                  )}
                </span>
              </div>
            </div>

            <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(selectedPeriod)}
                  className={organizationActionClass}
                >
                  Edit periode
                </button>

                {!selectedPeriod.is_active && (
                  <button
                    type="button"
                    onClick={() => onActivate(selectedPeriod)}
                    className={organizationPrimaryActionClass}
                  >
                    Aktifkan periode
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(selectedPeriod)}
                  disabled={selectedPeriod.is_active}
                  title={
                    selectedPeriod.is_active
                      ? "Periode aktif tidak bisa dihapus. Aktifkan periode lain terlebih dahulu."
                      : undefined
                  }
                  className={organizationDangerActionClass}
                >
                  Hapus periode
                </button>
              </div>
            </Can>
          </div>

          {selectedPeriod.is_active && (
            <p className="mt-3 text-xs leading-5 text-ink-soft">
              Periode aktif tidak bisa dihapus. Aktifkan periode lain terlebih
              dahulu untuk menggantinya.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
