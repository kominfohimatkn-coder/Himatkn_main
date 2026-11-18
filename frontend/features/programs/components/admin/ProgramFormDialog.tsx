
"use client";

import { useEffect, useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { getAdminDivisions } from "@/features/organization/admin-api";
import {
  normalizeProgramStatus,
  programStatusLabel,
} from "../../status";

import { PROGRAM_STATUSES } from "../../types";
import type {
  AdminProgram,
  CreateProgramPayload,
} from "../../types";
import type { AdminDivision, AdminPeriod } from "@/features/organization/types";

interface ProgramFormDialogProps {
  program?: AdminProgram;
  periods: AdminPeriod[];
  periodsError: string;
  onClose: () => void;
  onSubmit: (payload: CreateProgramPayload) => Promise<void>;
}

interface ProgramFormState {
  period_id: string;
  division_id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface DivisionLoadState {
  periodId: number;
  items: AdminDivision[];
  error: string;
}

const inputStyle =
  "min-h-11 w-full border border-paper-line bg-bg-light px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelStyle = "mb-1.5 block text-sm font-medium text-ink";

export default function ProgramFormDialog({
  program,
  periods,
  periodsError,
  onClose,
  onSubmit,
}: ProgramFormDialogProps) {
  const [form, setForm] = useState<ProgramFormState>(() => ({
    period_id: String(program?.period_id ?? periods[0]?.id ?? ""),
    division_id:
      program?.division_id == null ? "" : String(program.division_id),
    name: program?.name ?? "",
    slug: program?.slug ?? "",
    description: program?.description ?? "",
    status: program?.status ?? "planned",
    start_date: program?.start_date?.slice(0, 10) ?? "",
    end_date: program?.end_date?.slice(0, 10) ?? "",
  }));

  const [divisionState, setDivisionState] =
    useState<DivisionLoadState | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPeriodId = Number(form.period_id);

  useEffect(() => {
    if (
      !Number.isInteger(selectedPeriodId) ||
      selectedPeriodId <= 0
    ) {
      return;
    }

    const controller = new AbortController();

    void getAdminDivisions(selectedPeriodId, {
      signal: controller.signal,
    })
      .then((result) => {
        setDivisionState({
          periodId: selectedPeriodId,
          items: result.items,
          error: "",
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setDivisionState({
          periodId: selectedPeriodId,
          items: [],
          error:
            err instanceof Error
              ? err.message
              : "Daftar divisi gagal dimuat.",
        });
      });

    return () => controller.abort();
  }, [selectedPeriodId]);

  const isDivisionDataReady =
    divisionState?.periodId === selectedPeriodId;

  const divisions = isDivisionDataReady
    ? divisionState.items
    : [];

  const divisionError = isDivisionDataReady
    ? divisionState.error
    : "";

  const selectedStatus = normalizeProgramStatus(form.status);

  const hasLegacyStatus =
    form.status.trim().length > 0 && selectedStatus === null;

  function updateField(
    field: keyof ProgramFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const periodId = Number(form.period_id);

    if (!Number.isInteger(periodId) || periodId <= 0) {
      setError("Pilih periode yang valid.");
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

    const status = normalizeProgramStatus(form.status);

    if (!status) {
      setError(
        "Pilih salah satu dari empat status program yang valid.",
      );
      return;
    }

    const payload: CreateProgramPayload = {
      period_id: periodId,
      division_id: form.division_id
        ? Number(form.division_id)
        : null,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    setIsSaving(true);

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Program kerja gagal disimpan.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Manajemen program"
      title={
        program ? "Edit program kerja" : "Tambah program kerja"
      }
      description="Lengkapi informasi program sesuai periode organisasi."
      size="lg"
      busy={isSaving}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5 sm:p-7"
      >
        {periodsError && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          >
            Daftar periode gagal dimuat: {periodsError}
          </div>
        )}

        {periods.length === 0 && !program && (
          <div
            role="alert"
            className="border border-gold/40 bg-gold/10 p-3 text-sm leading-6 text-ink"
          >
            Periode belum tersedia atau akun tidak memiliki izin untuk
            membacanya. Program baru belum bisa dibuat.
          </div>
        )}

        <div>
          <label htmlFor="program-name" className={labelStyle}>
            Nama program
          </label>

          <input
            id="program-name"
            name="name"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            minLength={2}
            maxLength={255}
            required
            className={inputStyle}
            placeholder="Contoh: Seminar Nasional"
          />
        </div>

        <div>
          <label htmlFor="program-slug" className={labelStyle}>
            Slug
          </label>

          <input
            id="program-slug"
            name="slug"
            value={form.slug}
            onChange={(event) =>
              updateField("slug", event.target.value)
            }
            minLength={2}
            maxLength={255}
            required
            className={inputStyle}
            placeholder="seminar-nasional"
          />

          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Gunakan format singkat tanpa spasi, misalnya
            seminar-nasional.
          </p>
        </div>

        <div>
          <label htmlFor="program-period" className={labelStyle}>
            Periode organisasi
          </label>

          <select
            id="program-period"
            name="period_id"
            value={form.period_id}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                period_id: event.target.value,
                division_id: "",
              }));
            }}
            required
            className={inputStyle}
          >
            {!form.period_id && (
              <option value="">Pilih periode</option>
            )}

            {program &&
              !periods.some(
                (period) => period.id === program.period_id,
              ) && (
                <option value={String(program.period_id)}>
                  Periode #{program.period_id} (saat ini)
                </option>
              )}

            {periods.map((period) => (
              <option key={period.id} value={String(period.id)}>
                {period.name}
                {period.is_active ? " (aktif)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="program-division" className={labelStyle}>
            Divisi
          </label>

          <select
            id="program-division"
            name="division_id"
            value={form.division_id}
            onChange={(event) =>
              updateField("division_id", event.target.value)
            }
            disabled={!form.period_id || Boolean(divisionError)}
            className={inputStyle}
          >
            <option value="">Tidak terkait divisi tertentu</option>

            {form.division_id &&
              !divisions.some(
                (division) =>
                  division.id === Number(form.division_id),
              ) && (
                <option value={form.division_id}>
                  Divisi #{form.division_id} (saat ini)
                </option>
              )}

            {divisions.map((division) => (
              <option
                key={division.id}
                value={String(division.id)}
              >
                {division.name}
              </option>
            ))}
          </select>

          {divisionError && (
            <p role="alert" className="mt-1 text-xs text-red-700">
              Daftar divisi gagal dimuat: {divisionError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="program-description"
            className={labelStyle}
          >
            Deskripsi
          </label>

          <textarea
            id="program-description"
            name="description"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            rows={4}
            className={inputStyle}
            placeholder="Jelaskan tujuan program kerja..."
          />
        </div>

        <div>
          <label htmlFor="program-status" className={labelStyle}>
            Status
          </label>

          <select
            id="program-status"
            name="status"
            value={selectedStatus ?? ""}
            onChange={(event) =>
              updateField("status", event.target.value)
            }
            required
            className={inputStyle}
          >
            <option value="" disabled>
              {hasLegacyStatus
                ? `Status lain (${form.status.trim()})`
                : "Pilih status"}
            </option>

            {PROGRAM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {programStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="program-start-date"
              className={labelStyle}
            >
              Tanggal mulai
            </label>

            <input
              id="program-start-date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={(event) =>
                updateField("start_date", event.target.value)
              }
              className={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="program-end-date"
              className={labelStyle}
            >
              Tanggal selesai
            </label>

            <input
              id="program-end-date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={(event) =>
                updateField("end_date", event.target.value)
              }
              className={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          >
            {error}
          </div>
        )}

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
            disabled={isSaving || (!program && periods.length === 0)}
            className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Menyimpan..."
              : program
                ? "Simpan perubahan"
                : "Simpan program"}
          </button>
        </footer>
      </form>
    </FormDialog>
  );
}
