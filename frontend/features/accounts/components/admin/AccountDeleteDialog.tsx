"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { getApiErrorMessage } from "@/lib/api/errors";

import type { AdminAccount } from "../../types";

interface AccountDeleteDialogProps {
  account: AdminAccount;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function AccountDeleteDialog({
  account,
  onClose,
  onConfirm,
}: AccountDeleteDialogProps) {
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
        getApiErrorMessage(err, "Akun gagal dihapus."),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open
      eyebrow="Konfirmasi penghapusan"
      title={`Hapus akun ${account.username}?`}
      description={
        <>
          Akun{" "}
          <strong className="font-semibold text-bg-dark">
            {account.username}
          </strong>{" "}
          tidak bisa login lagi dan semua sesinya diakhiri. Riwayat
          aktivitasnya tetap tersimpan.
        </>
      }
      confirmLabel="Ya, hapus akun"
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
