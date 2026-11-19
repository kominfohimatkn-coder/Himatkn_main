"use client";

import { useState } from "react";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

import { getApiErrorMessage } from "@/lib/api/errors";

import type { AdminMember } from "../../types";

interface MemberDeleteDialogProps {
  member: AdminMember;
  periodName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function MemberDeleteDialog({
  member,
  periodName,
  onClose,
  onConfirm,
}: MemberDeleteDialogProps) {
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
        getApiErrorMessage(err, "Anggota gagal dihapus."),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open
      eyebrow="Konfirmasi penghapusan"
      title="Hapus anggota?"
      description={
        <>
          <strong className="font-semibold text-bg-dark">
            {member.name}
          </strong>{" "}
          akan dihapus dari struktur periode {periodName}. Tindakan ini tidak
          dapat dibatalkan.
        </>
      }
      confirmLabel="Ya, hapus anggota"
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
