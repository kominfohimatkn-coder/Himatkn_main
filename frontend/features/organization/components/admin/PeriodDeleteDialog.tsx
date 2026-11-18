"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

import { getOrganizationErrorMessage } from "../../errors";

import type { AdminPeriod } from "../../types";

interface PeriodDeleteDialogProps {
  period: AdminPeriod;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function PeriodDeleteDialog({
  period,
  onClose,
  onConfirm,
}: PeriodDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (isDeleting) return;

    setError("");
    setIsDeleting(true);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(
        getOrganizationErrorMessage(err, "Periode gagal dihapus."),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open
      eyebrow="Konfirmasi penghapusan"
      title={`Hapus periode ${period.name}?`}
      description={
        <>
          Periode{" "}
          <strong className="font-semibold text-bg-dark">
            {period.name}
          </strong>{" "}
          akan dihapus permanen. Periode hanya bisa dihapus jika tidak aktif
          dan tidak memiliki divisi, anggota, atau program kerja.
        </>
      }
      confirmLabel="Ya, hapus periode"
      busyLabel="Menghapus..."
      busy={isDeleting}
      error={error}
      tone="danger"
      onCancel={onClose}
      onConfirm={() => {
        void handleDelete();
      }}
    />
  );
}
