
"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

import type { AdminProgram } from "../../types";

interface ProgramDeleteDialogProps {
  program: AdminProgram;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ProgramDeleteDialog({
  program,
  onClose,
  onConfirm,
}: ProgramDeleteDialogProps) {
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
        err instanceof Error
          ? err.message
          : "Program kerja gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open
      eyebrow="Konfirmasi penghapusan"
      title="Hapus program kerja?"
      description={
        <>
          Program{" "}
          <strong className="font-semibold text-bg-dark">
            {program.name}
          </strong>{" "}
          akan dihapus. Tindakan ini tidak dapat dibatalkan.
        </>
      }
      confirmLabel="Ya, hapus program"
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
