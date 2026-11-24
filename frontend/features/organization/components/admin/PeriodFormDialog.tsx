"use client";

import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api/errors";

import type { AdminPeriod } from "../../types";

export interface PeriodFormValues {
  name: string;
  start_date: string | null;
  end_date: string | null;
}

type Field = "name" | "end_date";

/** Panel buat/ubah periode, mengikuti `periodForm()` di Design/admin. */
export default function PeriodFormDialog({
  period,
  onClose,
  onSubmit,
}: {
  period?: AdminPeriod;
  onClose: () => void;
  onSubmit: (values: PeriodFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(period?.name ?? "");
  const [startDate, setStartDate] = useState(period?.start_date?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(period?.end_date?.slice(0, 10) ?? "");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const found: Partial<Record<Field, string>> = {};
    if (cleanName.length < 2) found.name = cleanName ? "Minimal 2 karakter." : "Wajib diisi.";
    if (startDate && endDate && endDate < startDate)
      found.end_date = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setIsSaving(true);
    try {
      await onSubmit({ name: cleanName, start_date: startDate || null, end_date: endDate || null });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Periode gagal disimpan."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Struktur organisasi"
      title={period ? `Ubah periode ${period.name}` : "Buat periode baru"}
      busy={isSaving}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          <FormField label="Nama periode" hint="Contoh: 2026/2027. Harus unik." required error={errors.name}>
            <Input
              value={name}
              maxLength={50}
              placeholder="2026/2027"
              onChange={(event) => setName(event.target.value)}
            />
          </FormField>

          <div className="grid items-start gap-3.5 min-[641px]:grid-cols-2">
            <FormField label="Mulai">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Selesai" error={errors.end_date}>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </FormField>
          </div>

          {period ? null : (
            <Notice icon={<Info aria-hidden="true" />}>
              Periode baru dibuat dalam keadaan <strong>tidak aktif</strong>. Lengkapi
              divisi dan anggotanya dulu, lalu aktifkan.
            </Notice>
          )}

          {error ? (
            <p role="alert" className="rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-white px-6 py-3.5">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : period ? "Simpan perubahan" : "Buat periode"}
          </Button>
        </footer>
      </form>
    </FormDialog>
  );
}