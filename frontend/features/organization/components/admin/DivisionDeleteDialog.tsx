"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

import { getApiErrorMessage } from "@/lib/api/errors";

import type { AdminDivision } from "../../types";

interface DivisionDeleteDialogProps {
  division: AdminDivision;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DivisionDeleteDialog({
  division,
  onClose,
  onConfirm,
}: DivisionDeleteDialogProps) {
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
        getApiErrorMessage(err, "Divisi gagal dihapus."),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open
      eyebrow="Konfirmasi penghapusan"
      title={`Hapus ${division.name}?`}
      description={
        <>
          Divisi{" "}
          <strong className="font-semibold text-bg-dark">
            {division.name}
          </strong>{" "}
          akan dihapus dari periode ini. Divisi yang masih memiliki anggota atau
          dipakai program kerja tidak dapat dihapus.
        </>
      }
      confirmLabel="Ya, hapus divisi"
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
