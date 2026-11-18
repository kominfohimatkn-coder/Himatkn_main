"use client";

import { Can } from "@/components/admin/shared/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

import {
  organizationActionClass,
  organizationDangerActionClass,
  organizationPrimaryActionClass,
} from "./OrganizationPrimitives";

import type { AdminDivision } from "../../types";

interface DivisionsSectionProps {
  periodName: string;
  divisions: AdminDivision[];
  isLoading: boolean;
  error: string;
  onReload: () => void;
  onCreate: () => void;
  onEdit: (division: AdminDivision) => void;
  onDelete: (division: AdminDivision) => void;
  onCopy: () => void;
}

export default function DivisionsSection({
  periodName,
  divisions,
  isLoading,
  error,
  onReload,
  onCreate,
  onEdit,
  onDelete,
  onCopy,
}: DivisionsSectionProps) {
  return (
    <section aria-labelledby="division-list-title" className="mt-6">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="division-list-title"
            className="font-serif text-lg font-semibold text-bg-dark"
          >
            Divisi periode {periodName}
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs leading-5 text-ink-soft"
          >
            {isLoading
              ? "Memuat divisi..."
              : `${divisions.length} divisi, diurutkan berdasarkan urutan lalu nama`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
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
              onClick={onCopy}
              disabled={isLoading}
              className={organizationActionClass}
            >
              Salin dari periode lain
            </button>

            <button
              type="button"
              onClick={onCreate}
              disabled={isLoading}
              className={organizationPrimaryActionClass}
            >
              Tambah divisi
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
            <p className="text-sm text-ink-soft">Memuat daftar divisi...</p>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse bg-bg-light-2 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="px-5 py-8">
            <h3 className="text-sm font-semibold">
              Divisi belum dapat dimuat
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={onReload}
              className={`${organizationActionClass} mt-4`}
            >
              Coba lagi
            </button>
          </div>
        ) : divisions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-bg-dark">
              Periode ini belum punya divisi
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              Salin divisi dari periode sebelumnya agar tidak perlu mengetik
              ulang, lalu sesuaikan.
            </p>

            <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onCopy}
                  className={organizationActionClass}
                >
                  Salin divisi
                </button>

                <button
                  type="button"
                  onClick={onCreate}
                  className={organizationPrimaryActionClass}
                >
                  Tambah divisi
                </button>
              </div>
            </Can>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-125 border-collapse text-left">
              <thead className="border-b border-paper-line bg-bg-light-2">
                <tr className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  <th scope="col" className="w-20 px-5 py-3">
                    Urutan
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Divisi
                  </th>
                  <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                    <th scope="col" className="px-5 py-3">
                      Aksi
                    </th>
                  </Can>
                </tr>
              </thead>

              <tbody className="divide-y divide-paper-line">
                {divisions.map((division) => (
                  <tr
                    key={division.id}
                    className="align-top transition-colors hover:bg-bg-light-2/60"
                  >
                    <td className="px-5 py-4 text-sm text-ink-soft">
                      {division.sort_order}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-bg-dark">
                        {division.name}
                      </p>

                      {division.description && (
                        <p className="mt-1 max-w-xl text-sm leading-5 text-ink-soft">
                          {division.description}
                        </p>
                      )}
                    </td>

                    <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(division)}
                            className={organizationActionClass}
                          >
                            Ubah
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(division)}
                            className={organizationDangerActionClass}
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
        )}
      </div>
    </section>
  );
}
