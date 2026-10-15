"use client";

import { useState } from "react";

import type { AdminProgram } from "@/types/programs";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-delete-title"
        className="w-full max-w-lg border border-paper-line bg-bg-light p-5 shadow-xl sm:p-7"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
          Konfirmasi penghapusan
        </p>

        <h2
          id="program-delete-title"
          className="mt-2 font-serif text-2xl font-semibold text-bg-dark"
        >
          Hapus program kerja?
        </h2>

        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Program <strong className="text-bg-dark">{program.name}</strong>{" "}
          akan dihapus. Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          >
            {error}
          </p>
        )}

        <footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium hover:bg-bg-light-2 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-11 border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Ya, hapus program"}
          </button>
        </footer>
      </section>
    </div>
  );
}