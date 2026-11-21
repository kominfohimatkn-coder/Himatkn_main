"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";

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

/**
 * Dialog konfirmasi di tengah layar, mengikuti `.modal` + `confirmDialog()`
 * di Design/admin. Props tetap sama dengan versi lama.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  eyebrow,
  confirmLabel = "Konfirmasi",
  busyLabel = "Memproses...",
  busy = false,
  error = "",
  tone = "danger",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onCancel();
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) {
          onCancel();
        }
      }}
      className="m-auto w-[min(440px,calc(100%-32px))] max-w-none overflow-hidden rounded-[6px] border-0 bg-white p-0 text-ink shadow-[0_30px_70px_rgba(6,38,27,0.25)] transition-[opacity,scale] duration-200 backdrop:bg-[rgba(6,38,27,0.42)] starting:open:scale-95 starting:open:opacity-0"
    >
      {open && (
        <>
          <div className="px-[26px] pt-[26px] pb-5">
            <div
              className={`mb-3.5 grid size-11 place-items-center rounded-full ${
                tone === "danger"
                  ? "bg-danger-bg text-danger"
                  : "bg-mint text-green-800"
              }`}
              aria-hidden="true"
            >
              <TriangleAlert className="size-5" />
            </div>

            {eyebrow && (
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted-light uppercase">
                {eyebrow}
              </p>
            )}

            <h2
              id={titleId}
              className="mt-1 font-serif text-[19px] leading-[1.25] font-bold text-green-900"
            >
              {title}
            </h2>

            <div className="mt-2 text-sm leading-[1.55] text-muted">
              {description}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger"
              >
                {error}
              </div>
            )}
          </div>

          <footer className="flex justify-end gap-2 border-t border-line bg-mint-50 px-5 py-3.5">
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Batal
            </Button>

            <Button
              variant={tone === "danger" ? "danger" : "solid"}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? busyLabel : confirmLabel}
            </Button>
          </footer>
        </>
      )}
    </dialog>
  );
}