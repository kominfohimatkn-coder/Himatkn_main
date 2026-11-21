"use client";

import { useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

import { getApiErrorMessage } from "@/lib/api/errors";

import { OrganizationNotice } from "./OrganizationPrimitives";

import type { AdminPeriod } from "../../types";

export interface PeriodFormValues {
  name: string;
  start_date: string | null;
  end_date: string | null;
}

interface PeriodFormDialogProps {
  period?: AdminPeriod;
  onClose: () => void;
  onSubmit: (values: PeriodFormValues) => Promise<void>;
}

interface PeriodFormState {
  name: string;
  start_date: string;
  end_date: string;
}

export default function PeriodFormDialog({
  period,
  onClose,
  onSubmit,
}: PeriodFormDialogProps) {
  const [form, setForm] = useState<PeriodFormState>(() => ({
    name: period?.name ?? "",
    start_date: period?.start_date?.slice(0, 10) ?? "",
    end_date: period?.end_date?.slice(0, 10) ?? "",
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof PeriodFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();

    if (name.length < 2) {
      setError("Nama periode minimal 2 karakter.");
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });

      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Periode gagal disimpan."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Struktur organisasi"
      title={period ? `Edit periode ${period.name}` : "Buat periode baru"}
      description="Nama periode harus unik dan tanggal selesai tidak boleh sebelum tanggal mulai."
      size="md"
      busy={isSaving}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <FormField
          label="Nama periode"
          hint="Contoh: 2026/2027. Harus unik."
          required
        >
          <Input
            id="period-name"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            minLength={2}
            maxLength={50}
            required
            placeholder="2026/2027"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Mulai">
            <Input
              id="period-start-date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={(event) =>
                updateField("start_date", event.target.value)
              }
            />
          </FormField>

          <FormField label="Selesai">
            <Input
              id="period-end-date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={(event) =>
                updateField("end_date", event.target.value)
              }
            />
          </FormField>
        </div>

        {!period && (
          <OrganizationNotice tone="warning">
            Periode baru dibuat dalam keadaan <strong>tidak aktif</strong>.
            Lengkapi divisi dan anggotanya dulu, lalu aktifkan.
          </OrganizationNotice>
        )}

        {error && <OrganizationNotice tone="error">{error}</OrganizationNotice>}

        <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium hover:bg-bg-light-2 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Menyimpan..."
              : period
                ? "Simpan perubahan"
                : "Buat periode"}
          </button>
        </footer>
      </form>
    </FormDialog>
  );
}
