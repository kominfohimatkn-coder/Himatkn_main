"use client";

import { useState } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";

import { getApiErrorMessage } from "@/lib/api/errors";

import { OrganizationNotice } from "./OrganizationPrimitives";

import type { AdminPeriod } from "../../types";

interface PeriodActivateDialogProps {
  period: AdminPeriod;
  activePeriod: AdminPeriod | null;
  onClose: () => void;
  onActivate: () => Promise<string[]>;
}

export default function PeriodActivateDialog({
  period,
  activePeriod,
  onClose,
  onActivate,
}: PeriodActivateDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  async function handleActivate() {
    if (isSaving) return;

    setError("");
    setIsSaving(true);

    try {
      const nextWarnings = await onActivate();

      if (nextWarnings.length === 0) {
        onClose();
        return;
      }

      setWarnings(nextWarnings);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Periode gagal diaktifkan."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  const description = `Situs publik akan langsung menampilkan struktur periode ${period.name}.${
    activePeriod
      ? ` Periode ${activePeriod.name} otomatis menjadi tidak aktif.`
      : ""
  }`;

  return (
    <FormDialog
      open
      eyebrow="Konfirmasi aktivasi"
      title={`Aktifkan periode ${period.name}?`}
      description={description}
      size="sm"
      busy={isSaving}
      onClose={onClose}
    >
      <div className="space-y-5 p-5 sm:p-6">
        {warnings.length > 0 && (
          <OrganizationNotice tone="warning">
            <p className="font-medium">Periode sudah aktif, dengan catatan:</p>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>

            <p className="mt-2">
              Situs publik dapat tampil kosong sampai datanya dilengkapi.
            </p>
          </OrganizationNotice>
        )}

        {error && <OrganizationNotice tone="error">{error}</OrganizationNotice>}

        <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-4 sm:flex-row sm:justify-end">
          {warnings.length > 0 ? (
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90"
            >
              Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium hover:bg-bg-light-2 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleActivate();
                }}
                disabled={isSaving}
                className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Mengaktifkan..." : "Aktifkan periode"}
              </button>
            </>
          )}
        </footer>
      </div>
    </FormDialog>
  );
}
