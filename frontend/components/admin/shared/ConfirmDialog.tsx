
"use client";

import type { ReactNode } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";

type ConfirmTone = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  eyebrow?: string;
  confirmLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  error?: string;
  tone?: ConfirmTone;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  eyebrow = "Konfirmasi tindakan",
  confirmLabel = "Konfirmasi",
  busyLabel = "Memproses...",
  busy = false,
  error = "",
  tone = "danger",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmButtonStyle =
    tone === "danger"
      ? "border-red-700 bg-red-700 text-white hover:bg-red-800"
      : "border-bg-dark bg-bg-dark text-white hover:bg-bg-dark/90";

  return (
    <FormDialog
      open={open}
      title={title}
      eyebrow={eyebrow}
      size="sm"
      busy={busy}
      onClose={onCancel}
    >
      <div className="space-y-5 p-5 sm:p-6">
        <div className="text-sm leading-6 text-ink-soft">
          {description}
        </div>

        {error && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          >
            {error}
          </div>
        )}

        <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-11 border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonStyle}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </footer>
      </div>
    </FormDialog>
  );
}
