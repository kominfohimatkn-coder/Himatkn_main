"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/errors";
import type { AdminDivision, AdminPeriod } from "@/features/organization/types";

import { createAdminProgram, updateAdminProgram } from "../../admin-api";
import { normalizeProgramStatus, programStatusLabel } from "../../status";
import { PROGRAM_STATUSES, type AdminProgram, type ProgramStatus } from "../../types";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Field = "name" | "slug" | "period_id" | "status" | "end_date";

/**
 * Panel tambah/edit program kerja, mengikuti `programForm()` di Design/admin.
 */
export default function ProgramFormDialog({
  program,
  periods,
  divisions,
  defaultPeriodId,
  onDelete,
  onClose,
  onSaved,
}: {
  program?: AdminProgram;
  periods: AdminPeriod[];
  /** Semua divisi dari semua periode; disaring sesuai periode terpilih. */
  divisions: AdminDivision[];
  defaultPeriodId?: number;
  /** Bila diisi, form edit menampilkan "Zona berbahaya" dengan tombol hapus. */
  onDelete?: () => void;
  onClose: () => void;
  onSaved: (program: AdminProgram, isNew: boolean) => void;
}) {
  const isNew = !program;
  const [name, setName] = useState(program?.name ?? "");
  const [slug, setSlug] = useState(program?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [periodId, setPeriodId] = useState(
    String(program?.period_id ?? defaultPeriodId ?? periods.find((p) => p.is_active)?.id ?? ""),
  );
  const [divisionId, setDivisionId] = useState(
    program?.division_id == null ? "" : String(program.division_id),
  );
  const [status, setStatus] = useState<ProgramStatus | "">(
    program ? (normalizeProgramStatus(program.status) ?? "") : "planned",
  );
  const [startDate, setStartDate] = useState(program?.start_date ?? "");
  const [endDate, setEndDate] = useState(program?.end_date ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const periodDivisions = divisions
    .filter((division) => String(division.period_id) === periodId)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const found: Partial<Record<Field, string>> = {};
    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName) found.name = "Wajib diisi.";
    else if (cleanName.length < 2) found.name = "Minimal 2 karakter.";
    if (!cleanSlug) found.slug = "Wajib diisi.";
    else if (!SLUG_PATTERN.test(cleanSlug))
      found.slug = "Gunakan huruf kecil, angka, dan tanda hubung saja.";
    if (!periodId) found.period_id = "Wajib diisi.";
    if (!status) found.status = "Pilih salah satu status.";
    if (startDate && endDate && endDate < startDate)
      found.end_date = "Tanggal selesai tidak boleh sebelum tanggal mulai.";

    setErrors(found);
    if (Object.keys(found).length || !status) return;

    const payload = {
      period_id: Number(periodId),
      division_id: divisionId ? Number(divisionId) : null,
      name: cleanName,
      slug: cleanSlug,
      description: description.trim() || null,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
    };

    setSaving(true);
    try {
      const saved = program
        ? await updateAdminProgram(program.id, payload)
        : await createAdminProgram(payload);
      onSaved(saved, isNew);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ slug: "Alamat ini sudah dipakai program lain." });
      } else {
        setFormError(err instanceof Error ? err.message : "Program kerja gagal disimpan.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Program kerja"
      title={isNew ? "Tambah program kerja" : "Edit program kerja"}
      busy={saving}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          <FormField label="Nama program" required error={errors.name}>
            <Input
              value={name}
              maxLength={255}
              onChange={(event) => {
                setName(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
            />
          </FormField>

          <FormField
            label="Alamat halaman"
            required
            hint="Terisi otomatis dari nama. Harus unik."
            error={errors.slug}
          >
            <SlugInput
              value={slug}
              onChange={(value) => {
                setSlugTouched(true);
                setSlug(value);
              }}
            />
          </FormField>

          <div className="grid items-start gap-3.5 min-[641px]:grid-cols-2">
            <FormField label="Periode" required error={errors.period_id}>
              <Select
                value={periodId}
                onChange={(event) => {
                  setPeriodId(event.target.value);
                  setDivisionId("");
                }}
              >
                {!periodId ? <option value="">Pilih periode</option> : null}
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                    {period.is_active ? " (aktif)" : ""}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Divisi" hint="Pilihan mengikuti periode.">
              <Select value={divisionId} onChange={(event) => setDivisionId(event.target.value)}>
                <option value="">Tanpa divisi</option>
                {periodDivisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Status" required error={errors.status}>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProgramStatus)}
            >
              {!status ? (
                <option value="" disabled>
                  {`Status lain (${program?.status ?? "-"})`}
                </option>
              ) : null}
              {PROGRAM_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {programStatusLabel(value)}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid items-start gap-3.5 min-[641px]:grid-cols-2">
            <FormField label="Tanggal mulai">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Tanggal selesai" error={errors.end_date}>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </FormField>
          </div>

          <FormField label="Deskripsi" hint="Ditampilkan di halaman Program Kerja situs.">
            <Textarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormField>

          {onDelete ? (
            <div className="mt-2 border-t border-line pt-[18px]">
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Program yang dihapus hilang dari situs dan tidak bisa dikembalikan.
              </p>
              <Button variant="danger-outline" onClick={onDelete} disabled={saving}>
                <Trash2 aria-hidden="true" /> Hapus program kerja
              </Button>
            </div>
          ) : null}

          {formError ? (
            <p role="alert" className="rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger">
              {formError}
            </p>
          ) : null}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-white px-6 py-3.5">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : isNew ? "Tambah program" : "Simpan perubahan"}
          </Button>
        </footer>
      </form>
    </FormDialog>
  );
}

/** Input slug dengan awalan `/program/` (`.input-group` + `.prefix`). */
function SlugInput({
  value,
  onChange,
  ...aria
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
}) {
  return (
    <div className="flex">
      <span className="grid place-items-center rounded-l-[4px] border border-r-0 border-line bg-mint-50 px-2.5 text-xs whitespace-nowrap text-muted">
        /program/
      </span>
      <input
        {...aria}
        value={value}
        maxLength={255}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full min-w-0 rounded-r-[4px] border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] aria-invalid:border-danger"
      />
    </div>
  );
}