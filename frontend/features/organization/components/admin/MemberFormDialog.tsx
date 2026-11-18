"use client";

import { useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import { getApiErrorMessage } from "@/lib/api/errors";

import MemberPhotoField from "./MemberPhotoField";
import {
  organizationDangerActionClass,
  OrganizationNotice,
} from "./OrganizationPrimitives";

import type {
  AdminDivision,
  AdminMember,
  AdminPeriod,
  AdminPosition,
} from "../../types";

export interface MemberFormValues {
  name: string;
  position_id: number;
  division_id: number | null;
  sort_order: number;
  photo_url: string | null;
}

interface MemberFormDialogProps {
  period: AdminPeriod;
  member?: AdminMember;
  divisions: AdminDivision[];
  positions: AdminPosition[];
  defaultDivisionId?: number | null;
  defaultSortOrder: number;
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  onRequestDelete?: (member: AdminMember) => void;
}

interface MemberFormState {
  name: string;
  position_id: string;
  division_id: string;
  sort_order: string;
}

export default function MemberFormDialog({
  period,
  member,
  divisions,
  positions,
  defaultDivisionId = null,
  defaultSortOrder,
  onClose,
  onSubmit,
  onRequestDelete,
}: MemberFormDialogProps) {
  const [form, setForm] = useState<MemberFormState>(() => ({
    name: member?.name ?? "",
    position_id: member ? String(member.position_id) : "",
    division_id:
      member?.division_id !== null && member?.division_id !== undefined
        ? String(member.division_id)
        : member
          ? ""
          : defaultDivisionId !== null
            ? String(defaultDivisionId)
            : "",
    sort_order: String(member?.sort_order ?? defaultSortOrder),
  }));

  const [photoUrl, setPhotoUrl] = useState<string | null>(
    member?.photo_url ?? null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const busy = isSaving || isUploading;

  function updateField(field: keyof MemberFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isUploading) {
      setError("Tunggu unggahan foto selesai sebelum menyimpan.");
      return;
    }

    const name = form.name.trim();
    const positionId = Number(form.position_id);
    const sortOrder = Number(form.sort_order);

    if (!name) {
      setError("Nama anggota wajib diisi.");
      return;
    }

    if (!Number.isInteger(positionId) || positionId <= 0) {
      setError("Jabatan wajib dipilih.");
      return;
    }

    if (
      form.sort_order.trim() === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError("Urutan harus berupa angka bulat 0 atau lebih.");
      return;
    }

    const divisionId =
      form.division_id === "" ? null : Number(form.division_id);

    if (
      divisionId !== null &&
      (!Number.isInteger(divisionId) || divisionId <= 0)
    ) {
      setError("Divisi yang dipilih tidak valid.");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        position_id: positionId,
        division_id: divisionId,
        sort_order: sortOrder,
        photo_url: photoUrl,
      });

      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Anggota gagal disimpan."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow={`Periode ${period.name}`}
      title={member ? "Ubah anggota" : "Tambah anggota"}
      description="Foto opsional. Jabatan diambil dari daftar jabatan global."
      size="md"
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <div className="space-y-2">
          <span className="block text-sm font-medium text-ink">Foto</span>

          <MemberPhotoField
            name={form.name}
            photoUrl={photoUrl}
            disabled={isSaving}
            onPhotoChange={setPhotoUrl}
            onUploadingChange={setIsUploading}
          />
        </div>

        <FormField label="Nama lengkap" required>
          <Input
            id="member-name"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            maxLength={255}
            required
            placeholder="Contoh: Nama Anggota"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Jabatan"
            hint="Daftar jabatan berlaku untuk semua periode."
            required
          >
            <Select
              id="member-position"
              name="position_id"
              value={form.position_id}
              onChange={(event) =>
                updateField("position_id", event.target.value)
              }
              placeholder="Pilih jabatan"
              disabled={positions.length === 0}
              required
            >
              {positions.map((position) => (
                <option key={position.id} value={String(position.id)}>
                  {position.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Divisi"
            hint="Hanya divisi dari periode yang dipilih."
          >
            <Select
              id="member-division"
              name="division_id"
              value={form.division_id}
              onChange={(event) =>
                updateField("division_id", event.target.value)
              }
            >
              <option value="">Tanpa divisi</option>

              {divisions.map((division) => (
                <option key={division.id} value={String(division.id)}>
                  {division.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {positions.length === 0 && (
          <OrganizationNotice tone="error">
            Daftar jabatan belum tersedia, sehingga anggota belum dapat
            disimpan. Muat ulang halaman lalu coba lagi.
          </OrganizationNotice>
        )}

        <FormField
          label="Urutan tampil"
          hint="Angka kecil tampil lebih dulu di dalam divisi."
          required
        >
          <Input
            id="member-sort-order"
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

        <footer className="flex flex-col-reverse gap-3 border-t border-paper-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {member && onRequestDelete && (
              <button
                type="button"
                onClick={() => onRequestDelete(member)}
                disabled={busy}
                className={organizationDangerActionClass}
              >
                Hapus anggota
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium hover:bg-bg-light-2 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={busy || positions.length === 0}
              className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Menyimpan..."
                : member
                  ? "Simpan perubahan"
                  : "Tambah anggota"}
            </button>
          </div>
        </footer>
      </form>
    </FormDialog>
  );
}
