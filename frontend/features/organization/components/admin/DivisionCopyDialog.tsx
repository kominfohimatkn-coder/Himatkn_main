"use client";

import { useEffect, useState } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { getAdminDivisions } from "@/features/organization/admin-api";

import { getApiErrorMessage } from "@/lib/api/errors";

import {
  organizationActionClass,
  organizationPrimaryActionClass,
  OrganizationNotice,
} from "./OrganizationPrimitives";

import type {
  AdminPeriod,
  DivisionCopyResponse,
} from "../../types";

interface DivisionCopyDialogProps {
  targetPeriod: AdminPeriod;
  periods: AdminPeriod[];
  onClose: () => void;
  onCopy: (sourcePeriodId: number) => Promise<DivisionCopyResponse>;
}

interface CountState {
  status: "loading" | "ready" | "error";
  counts: Record<number, number>;
  error: string;
}

export default function DivisionCopyDialog({
  targetPeriod,
  periods,
  onClose,
  onCopy,
}: DivisionCopyDialogProps) {
  const [countState, setCountState] = useState<CountState>({
    status: "loading",
    counts: {},
    error: "",
  });
  const [reloadKey, setReloadKey] = useState(0);

  const [sourceId, setSourceId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DivisionCopyResponse | null>(null);

  useEffect(() => {
    let active = true;

    const otherPeriods = periods.filter(
      (period) => period.id !== targetPeriod.id,
    );

    void Promise.all(
      otherPeriods.map(async (period) => {
        const response = await getAdminDivisions(period.id);

        return [period.id, response.items.length] as const;
      }),
    )
      .then((entries) => {
        if (!active) return;

        setCountState({
          status: "ready",
          counts: Object.fromEntries(entries),
          error: "",
        });
      })
      .catch((err: unknown) => {
        if (!active) return;

        setCountState({
          status: "error",
          counts: {},
          error: getApiErrorMessage(
            err,
            "Jumlah divisi periode lain gagal dimuat.",
          ),
        });
      });

    return () => {
      active = false;
    };
  }, [periods, targetPeriod.id, reloadKey]);

  const sources = periods.filter(
    (period) =>
      period.id !== targetPeriod.id &&
      (countState.counts[period.id] ?? 0) > 0,
  );

  const selectedSourceId =
    sourceId ||
    (sources.length > 0 ? String(sources[0].id) : "");

  const selectedSource =
    sources.find((period) => String(period.id) === selectedSourceId) ?? null;

  async function handleCopy() {
    if (isSaving) return;

    const sourcePeriodId = Number(selectedSourceId);

    if (!Number.isInteger(sourcePeriodId) || sourcePeriodId <= 0) {
      setError("Pilih periode sumber terlebih dahulu.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await onCopy(sourcePeriodId);
      setResult(response);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Divisi gagal disalin."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function retryCounts() {
    setCountState({
      status: "loading",
      counts: {},
      error: "",
    });
    setReloadKey((current) => current + 1);
  }

  return (
    <FormDialog
      open
      eyebrow={`Periode ${targetPeriod.name}`}
      title="Salin divisi dari periode lain"
      description="Hanya nama, deskripsi, dan urutan divisi yang disalin. Anggota tidak ikut disalin."
      size="md"
      busy={isSaving}
      onClose={onClose}
    >
      <div className="space-y-5 p-5 sm:p-7">
        {result ? (
          <>
            <OrganizationNotice tone="warning">
              <p className="font-serif text-lg font-semibold text-bg-dark">
                {result.created.length} divisi disalin,{" "}
                {result.skipped.length} dilewati
              </p>

              <p className="mt-1">
                {result.created.length > 0
                  ? `Divisi dari periode ${selectedSource?.name ?? "sumber"} sudah ditambahkan ke periode ${targetPeriod.name}. Anggota tidak ikut disalin.`
                  : "Semua divisi sudah ada di periode ini."}
              </p>

              {result.skipped.length > 0 && (
                <p className="mt-2">
                  <strong>Dilewati karena namanya sudah ada:</strong>{" "}
                  {result.skipped.join(", ")}
                </p>
              )}
            </OrganizationNotice>

            <footer className="flex justify-end border-t border-paper-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className={organizationPrimaryActionClass}
              >
                Selesai
              </button>
            </footer>
          </>
        ) : countState.status === "loading" ? (
          <p role="status" className="text-sm text-ink-soft">
            Memuat jumlah divisi periode lain...
          </p>
        ) : countState.status === "error" ? (
          <>
            <OrganizationNotice tone="error">
              <p className="font-medium">Periode lain belum dapat diperiksa</p>
              <p className="mt-1">{countState.error}</p>
            </OrganizationNotice>

            <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className={organizationActionClass}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={retryCounts}
                className={organizationPrimaryActionClass}
              >
                Coba lagi
              </button>
            </footer>
          </>
        ) : sources.length === 0 ? (
          <>
            <OrganizationNotice tone="info">
              <strong>Tidak ada divisi untuk disalin.</strong> Belum ada
              periode lain yang punya divisi. Tambahkan divisi secara manual.
            </OrganizationNotice>

            <footer className="flex justify-end border-t border-paper-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className={organizationActionClass}
              >
                Tutup
              </button>
            </footer>
          </>
        ) : (
          <>
            <FormField label="Salin dari periode" required>
              <Select
                id="division-copy-source"
                name="source_period_id"
                value={selectedSourceId}
                onChange={(event) => setSourceId(event.target.value)}
                required
              >
                {sources.map((period) => (
                  <option key={period.id} value={String(period.id)}>
                    {period.name}
                    {period.is_active ? " (aktif)" : ""} ·{" "}
                    {countState.counts[period.id] ?? 0} divisi
                  </option>
                ))}
              </Select>
            </FormField>

            <OrganizationNotice tone="info">
              Yang disalin hanya <strong>nama, deskripsi, dan urutan</strong>{" "}
              divisi. <strong>Anggota tidak ikut disalin.</strong> Divisi yang
              namanya sudah ada di periode {targetPeriod.name} akan dilewati.
            </OrganizationNotice>

            {error && (
              <OrganizationNotice tone="error">{error}</OrganizationNotice>
            )}

            <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className={organizationActionClass}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleCopy();
                }}
                disabled={isSaving}
                className={organizationPrimaryActionClass}
              >
                {isSaving ? "Menyalin..." : "Salin divisi"}
              </button>
            </footer>
          </>
        )}
      </div>
    </FormDialog>
  );
}
