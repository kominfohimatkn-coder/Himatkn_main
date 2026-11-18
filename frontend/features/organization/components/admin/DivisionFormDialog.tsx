"use client";

import { useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { getOrganizationErrorMessage } from "../../errors";

import { OrganizationNotice } from "./OrganizationPrimitives";

import type { AdminDivision, AdminPeriod } from "../../types";

export interface DivisionFormValues {
  name: string;
  description: string | null;
  sort_order: number;
}

interface DivisionFormDialogProps {
  period: AdminPeriod;
  division?: AdminDivision;
  defaultSortOrder: number;
  onClose: () => void;
  onSubmit: (values: DivisionFormValues) => Promise<void>;
}

interface DivisionFormState {
  name: string;
  description: string;
  sort_order: string;
}

export default function DivisionFormDialog({
  period,
  division,
  defaultSortOrder,
  onClose,
  onSubmit,
}: DivisionFormDialogProps) {
  const [form, setForm] = useState<DivisionFormState>(() => ({
    name: division?.name ?? "",
    description: division?.description ?? "",
    sort_order: String(division?.sort_order ?? defaultSortOrder),
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof DivisionFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const sortOrder = Number(form.sort_order);

    if (!name) {
      setError("Nama divisi wajib diisi.");
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setError("Urutan harus berupa angka bulat 0 atau lebih.");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        description: form.description.trim() || null,
        sort_order: sortOrder,
      });

      onClose();
    } catch (err) {
      setError(
        getOrganizationErrorMessage(err, "Divisi gagal disimpan."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow={`Periode ${period.name}`}
      title={division ? "Ubah divisi" : "Tambah divisi"}
      description="Nama divisi harus unik di dalam periode ini."
      size="md"
      busy={isSaving}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <FormField
          label="Nama divisi"
          hint="Harus unik di dalam periode ini."
          required
        >
          <Input
            id="division-name"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            maxLength={255}
            required
            placeholder="Contoh: Media dan Komunikasi"
          />
        </FormField>

        <FormField
          label="Deskripsi"
          hint="Opsional. Tampil di halaman struktur situs."
        >
          <Textarea
            id="division-description"
            name="description"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            rows={4}
            placeholder="Jelaskan tugas atau fokus divisi..."
          />
        </FormField>

        <FormField
          label="Urutan"
          hint="Angka kecil tampil lebih dulu."
          required
        >
          <Input
            id="division-sort-order"
            name="sort_order"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.sort_order}
            onChange={(event) =>
              updateField("sort_order", event.target.value)
            }
            required
          />
        </FormField>

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
              : division
                ? "Simpan perubahan"
                : "Tambah divisi"}
          </button>
        </footer>
      </form>
    </FormDialog>
  );
}
