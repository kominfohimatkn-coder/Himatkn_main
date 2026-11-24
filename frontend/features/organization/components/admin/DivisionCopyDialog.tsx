"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AlertTriangle, Check, Info } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { getAdminDivisions } from "@/features/organization/admin-api";

import { getApiErrorMessage } from "@/lib/api/errors";

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

  const footer = (children: ReactNode) => (
    <footer className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t border-line bg-white px-6 py-3.5">
      {children}
    </footer>
  );

  return (
    <FormDialog
      open
      eyebrow={`Periode ${targetPeriod.name}`}
      title="Salin divisi dari periode lain"
      busy={isSaving}
      onClose={onClose}
    >
      <div className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          {result ? (
            <Notice icon={<Check aria-hidden="true" />}>
              <p className="font-serif text-base font-bold">
                {result.created.length} disalin, {result.skipped.length} dilewati
              </p>
              <p className="mt-1">
                {result.created.length > 0
                  ? `Divisi dari periode ${selectedSource?.name ?? "sumber"} sudah ditambahkan ke periode ${targetPeriod.name}. Anggota tidak ikut disalin.`
                  : "Semua divisi sudah ada di periode ini."}
              </p>
              {result.skipped.length > 0 ? (
                <p className="mt-2">
                  <strong>Dilewati karena namanya sudah ada:</strong> {result.skipped.join(", ")}
                </p>
              ) : null}
            </Notice>
          ) : countState.status === "loading" ? (
            <p role="status" className="text-sm text-muted">
              Memuat jumlah divisi periode lain...
            </p>
          ) : countState.status === "error" ? (
            <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />}>
              <strong>Periode lain belum dapat diperiksa.</strong> {countState.error}
            </Notice>
          ) : sources.length === 0 ? (
            <Notice icon={<Info aria-hidden="true" />}>
              <strong>Tidak ada divisi untuk disalin.</strong> Belum ada periode lain yang
              punya divisi. Tambahkan divisi secara manual.
            </Notice>
          ) : (
            <>
              <FormField label="Salin dari periode" required>
                <Select value={selectedSourceId} onChange={(event) => setSourceId(event.target.value)}>
                  {sources.map((period) => (
                    <option key={period.id} value={String(period.id)}>
                      {period.name}
                      {period.is_active ? " (aktif)" : ""} · {countState.counts[period.id] ?? 0} divisi
                    </option>
                  ))}
                </Select>
              </FormField>

              <Notice icon={<Info aria-hidden="true" />}>
                Yang disalin hanya <strong>nama, deskripsi, dan urutan divisi</strong>.{" "}
                <strong>Anggota tidak ikut disalin.</strong> Divisi yang namanya sudah ada
                di periode {targetPeriod.name} akan dilewati.
              </Notice>

              {error ? (
                <p role="alert" className="rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        {result
          ? footer(<Button onClick={onClose}>Selesai</Button>)
          : countState.status === "error"
            ? footer(
                <>
                  <Button variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button onClick={retryCounts}>Coba lagi</Button>
                </>,
              )
            : countState.status === "ready" && sources.length === 0
              ? footer(
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>,
                )
              : countState.status === "ready"
                ? footer(
                    <>
                      <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Batal
                      </Button>
                      <Button onClick={() => void handleCopy()} disabled={isSaving}>
                        {isSaving ? "Menyalin..." : "Salin divisi"}
                      </Button>
                    </>,
                  )
                : null}
      </div>
    </FormDialog>
  );
}