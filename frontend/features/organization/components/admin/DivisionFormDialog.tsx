"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getApiErrorMessage } from "@/lib/api/errors";

import type { AdminDivision, AdminPeriod } from "../../types";

export interface DivisionFormValues {
  name: string;
  description: string | null;
  sort_order: number;
}

/**
 * Panel tambah/ubah divisi, mengikuti `divisionForm()` di Design/admin.
 * Urutan tidak diisi di sini: divisi baru masuk paling bawah (`defaultSortOrder`),
 * lalu dipindah dengan tombol ↑ ↓ di daftar.
 */
export default function DivisionFormDialog({
  period,
  division,
  defaultSortOrder,
  onDelete,
  onClose,
  onSubmit,
}: {
  period: AdminPeriod;
  division?: AdminDivision;
  /** Untuk divisi baru: urutan terbesar + 10. */
  defaultSortOrder: number;
  /** Bila diisi, form ubah menampilkan "Zona berbahaya" dengan tombol hapus. */
  onDelete?: () => void;
  onClose: () => void;
  onSubmit: (values: DivisionFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(division?.name ?? "");
  const [description, setDescription] = useState(division?.description ?? "");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setNameError(cleanName ? "Minimal 2 karakter." : "Wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        name: cleanName,
        description: description.trim() || null,
        sort_order: division?.sort_order ?? defaultSortOrder,
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Divisi gagal disimpan."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow={`Periode ${period.name}`}
      title={division ? "Ubah divisi" : "Tambah divisi"}
      busy={isSaving}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          <FormField label="Nama divisi" hint="Harus unik di dalam periode ini." required error={nameError}>
            <Input
              value={name}
              maxLength={100}
              onChange={(event) => {
                setName(event.target.value);
                setNameError("");
              }}
            />
          </FormField>

          <FormField label="Deskripsi" hint="Opsional. Tampil di beranda situs.">
            <Textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormField>

          {division ? null : (
            <p className="text-xs text-muted">
              Divisi baru masuk di urutan paling bawah. Pindahkan dengan tombol ↑ ↓ di daftar.
            </p>
          )}

          {onDelete ? (
            <div className="mt-2 border-t border-line pt-[18px]">
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Divisi hanya bisa dihapus bila tidak punya anggota dan tidak dipakai program kerja.
              </p>
              <Button variant="danger-outline" onClick={onDelete} disabled={isSaving}>
                <Trash2 aria-hidden="true" /> Hapus divisi
              </Button>
            </div>
          ) : null}

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
            {isSaving ? "Menyimpan..." : division ? "Simpan perubahan" : "Tambah divisi"}
          </Button>
        </footer>
      </form>
    </FormDialog>
  );
}