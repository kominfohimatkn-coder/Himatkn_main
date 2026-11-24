"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { getApiErrorMessage } from "@/lib/api/errors";

import MemberPhotoField from "./MemberPhotoField";

import type { AdminDivision, AdminMember, AdminPeriod, AdminPosition } from "../../types";

export interface MemberFormValues {
  name: string;
  position_id: number;
  division_id: number | null;
  sort_order: number;
  photo_url: string | null;
}

type Field = "name" | "position_id";

/**
 * Panel tambah/ubah anggota, mengikuti `memberForm()` di Design/admin.
 * Urutan tidak diisi di sini (sama seperti divisi): anggota tampil menurut
 * urutan jabatan; anggota baru masuk paling bawah di antara jabatan yang sama.
 */
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
}: {
  period: AdminPeriod;
  member?: AdminMember;
  divisions: AdminDivision[];
  positions: AdminPosition[];
  defaultDivisionId?: number | null;
  /** Untuk anggota baru: urutan terbesar + 10. */
  defaultSortOrder: number;
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  onRequestDelete?: (member: AdminMember) => void;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [positionId, setPositionId] = useState(member ? String(member.position_id) : "");
  const [divisionId, setDivisionId] = useState(
    member ? (member.division_id === null ? "" : String(member.division_id)) : defaultDivisionId === null ? "" : String(defaultDivisionId),
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(member?.photo_url ?? null);

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const busy = isSaving || isUploading;

  const sortedPositions = [...positions].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isUploading) {
      setError("Tunggu unggahan foto selesai sebelum menyimpan.");
      return;
    }

    const cleanName = name.trim();
    const found: Partial<Record<Field, string>> = {};
    if (!cleanName) found.name = "Wajib diisi.";
    if (!positionId) found.position_id = "Pilih jabatan.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setIsSaving(true);
    try {
      await onSubmit({
        name: cleanName,
        position_id: Number(positionId),
        division_id: divisionId === "" ? null : Number(divisionId),
        sort_order: member?.sort_order ?? defaultSortOrder,
        photo_url: photoUrl,
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Anggota gagal disimpan."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow={`Periode ${period.name}`}
      title={member ? "Ubah anggota" : "Tambah anggota"}
      busy={busy}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          <div>
            <span className="mb-2 block text-xs font-semibold tracking-[0.06em] text-ink uppercase">Foto</span>
            <MemberPhotoField
              name={name}
              photoUrl={photoUrl}
              disabled={isSaving}
              onPhotoChange={setPhotoUrl}
              onUploadingChange={setIsUploading}
            />
          </div>

          <FormField label="Nama lengkap" required error={errors.name}>
            <Input
              value={name}
              maxLength={255}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
            />
          </FormField>

          <div className="grid items-start gap-3.5 min-[641px]:grid-cols-2">
            <FormField label="Jabatan" hint="Berlaku untuk semua periode." required error={errors.position_id}>
              <SelectMenu
                size="md"
                label="Jabatan"
                hideLabel
                placeholder="Pilih jabatan"
                value={positionId}
                disabled={positions.length === 0}
                onChange={(value) => {
                  setPositionId(value);
                  setErrors((current) => ({ ...current, position_id: undefined }));
                }}
                options={sortedPositions.map((position) => ({
                  value: String(position.id),
                  label: position.name,
                }))}
              />
            </FormField>

            <FormField label="Divisi" hint={`Divisi periode ${period.name}.`}>
              <SelectMenu
                size="md"
                label="Divisi"
                hideLabel
                value={divisionId}
                onChange={setDivisionId}
                options={[
                  { value: "", label: "Tanpa divisi" },
                  ...divisions.map((division) => ({
                    value: String(division.id),
                    label: division.name,
                  })),
                ]}
              />
            </FormField>
          </div>

          {positions.length === 0 ? (
            <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />}>
              Daftar jabatan belum tersedia, jadi anggota belum dapat disimpan. Muat ulang halaman lalu coba lagi.
            </Notice>
          ) : null}

          {member && onRequestDelete ? (
            <div className="mt-2 border-t border-line pt-[18px]">
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Anggota dihapus dari struktur periode {period.name}.
              </p>
              <Button variant="danger-outline" onClick={() => onRequestDelete(member)} disabled={busy}>
                <Trash2 aria-hidden="true" /> Hapus anggota
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
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button type="submit" disabled={busy || positions.length === 0}>
            {isSaving ? "Menyimpan..." : member ? "Simpan perubahan" : "Tambah anggota"}
          </Button>
        </footer>
      </form>
    </FormDialog>
  );
}