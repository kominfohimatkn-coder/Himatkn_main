import type { AdminProgram } from "../../types";
import type { AdminPeriod } from "@/features/organization/types";

import { Can } from "@/components/admin/shared/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

import {
  formatProgramDate,
  ProgramStatusBadge,
} from "./ProgramPrimitives";

interface ProgramsListProps {
  items: AdminProgram[];
  periods: AdminPeriod[];
  isLoading: boolean;
  error: string;
  offset: number;
  hasNextPage: boolean;
  onReload: () => void;
  onPageChange: (offset: number) => void;
  onCreate: () => void;
  onEdit: (program: AdminProgram) => void;
  onDelete: (program: AdminProgram) => void;
}

const PAGE_SIZE = 20;

const buttonStyle =
  "inline-flex min-h-10 items-center justify-center border border-paper-line px-3 py-2 text-sm font-medium transition-colors hover:border-gold/70 hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

export default function ProgramsList({
  items,
  periods,
  isLoading,
  error,
  offset,
  hasNextPage,
  onReload,
  onPageChange,
  onCreate,
  onEdit,
  onDelete,
}: ProgramsListProps) {
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const periodNames = new Map(
    periods.map((period) => [period.id, period.name]),
  );

  return (
    <section aria-labelledby="program-list-title" className="mt-6">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="program-list-title"
            className="font-serif text-lg font-semibold text-bg-dark"
          >
            Daftar program kerja
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs leading-5 text-ink-soft"
          >
            {isLoading
              ? "Memuat program kerja..."
              : `${items.length} program pada halaman ini`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className={buttonStyle}
          >
            Muat ulang
          </button>

          <Can permission={PERMISSIONS.PROGRAMS_MANAGE}>
            <button
              type="button"
              onClick={onCreate}
              disabled={isLoading}
              className={`${buttonStyle} border-bg-dark bg-bg-dark text-white hover:border-bg-dark hover:bg-bg-dark/90`}
            >
              Tambah program
            </button>
          </Can>
        </div>
      </div>

      <div
        aria-busy={isLoading}
        className="border border-paper-line bg-bg-light"
      >
        {isLoading ? (
          <div className="space-y-4 p-6" role="status">
            <p className="text-sm text-ink-soft">
              Memuat daftar program kerja...
            </p>

            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse bg-bg-light-2 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="px-5 py-8">
            <h3 className="text-sm font-semibold">
              Program kerja belum dapat dimuat
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={onReload}
              className={`${buttonStyle} mt-4`}
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-bg-dark">
              Belum ada program kerja
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Program yang tersedia akan muncul di bagian ini.
            </p>

            <Can permission={PERMISSIONS.PROGRAMS_MANAGE}>
              <button
                type="button"
                onClick={onCreate}
                className={`${buttonStyle} mt-5`}
              >
                Tambah program pertama
              </button>
            </Can>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 border-collapse text-left">
                <thead className="border-b border-paper-line bg-bg-light-2">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <th scope="col" className="px-5 py-3">
                      Program
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Periode
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Jadwal
                    </th>
                    <Can permission={PERMISSIONS.PROGRAMS_MANAGE}>
                      <th scope="col" className="px-5 py-3">
                        Aksi
                      </th>
                    </Can>
                  </tr>
                </thead>

                <tbody className="divide-y divide-paper-line">
                  {items.map((program) => (
                    <tr
                      key={program.id}
                      className="align-top transition-colors hover:bg-bg-light-2/60"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-bg-dark">
                          {program.name}
                        </p>

                        <p className="mt-1 break-all text-xs text-ink-soft">
                          {program.slug}
                        </p>

                        {program.description && (
                          <p className="mt-2 max-w-sm text-sm leading-5 text-ink-soft">
                            {program.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink">
                        {periodNames.get(program.period_id) ??
                          `Periode #${program.period_id}`}
                      </td>

                      <td className="px-5 py-4">
                        <ProgramStatusBadge status={program.status} />
                      </td>

                      <td className="px-5 py-4 text-sm leading-6 text-ink">
                        <p>
                          {formatProgramDate(program.start_date)}
                        </p>
                        <p className="text-xs text-ink-soft">
                          sampai {formatProgramDate(program.end_date)}
                        </p>
                      </td>

                      <Can permission={PERMISSIONS.PROGRAMS_MANAGE}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(program)}
                              className={buttonStyle}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(program)}
                              className={`${buttonStyle} text-red-700 hover:border-red-200 hover:bg-red-50`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </Can>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-paper-line px-5 py-4">
              <p className="text-sm text-ink-soft">
                Halaman {currentPage}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onPageChange(Math.max(0, offset - PAGE_SIZE))
                  }
                  disabled={isLoading || offset === 0}
                  className={buttonStyle}
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  onClick={() => onPageChange(offset + PAGE_SIZE)}
                  disabled={isLoading || !hasNextPage}
                  className={buttonStyle}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}