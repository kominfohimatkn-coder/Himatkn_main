"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface FormDialogProps {
  open: boolean;
  title: string;
  description?: string;
  eyebrow?: string;
  size?: DialogSize;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel geser dari kanan, mengikuti `.drawer` di Design/admin/assets/admin.css.
 * Nama dan props tetap sama dengan dialog lama agar semua pemakai tidak berubah.
 * Memakai <dialog> + showModal() sehingga fokus terkunci di dalam panel,
 * Escape menutup, dan konten di belakang tidak bisa diklik.
 */
const sizeClasses: Record<DialogSize, string> = {
  sm: "w-[min(440px,100%)]",
  md: "w-[min(520px,100%)]",
  lg: "w-[min(680px,100%)]",
  xl: "w-[min(860px,100%)]",
};

export default function FormDialog({
  open,
  title,
  description,
  eyebrow,
  size = "md",
  busy = false,
  onClose,
  children,
}: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) {
          onClose();
        }
      }}
      className={`fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none max-w-none flex-col overflow-hidden border-0 bg-[#fbfdfc] p-0 text-ink shadow-[-20px_0_50px_rgba(6,38,27,0.15)] transition-[translate] duration-300 ease-[cubic-bezier(.16,1,.3,1)] backdrop:bg-[rgba(6,38,27,0.42)] open:flex starting:open:translate-x-full ${sizeClasses[size]}`}
    >
      {open && (
        <>
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-6 pt-[22px] pb-[18px]">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-green-700 uppercase">
                  {eyebrow}
                </p>
              )}

              <h2
                id={titleId}
                className="mt-1.5 font-serif text-xl leading-[1.25] font-bold text-green-900"
              >
                {title}
              </h2>

              {description && (
                <p
                  id={descriptionId}
                  className="mt-1.5 text-[13px] leading-[1.55] text-muted"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Tutup panel"
              className="grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-[4px] text-muted transition-colors hover:bg-mint-50 hover:text-green-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-[19px]" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </>
      )}
    </dialog>
  );
}