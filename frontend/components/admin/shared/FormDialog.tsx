
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

const sizeClasses: Record<DialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

const dialogBase =
  "m-auto flex max-h-[calc(100dvh-1.5rem)] " +
  "w-[calc(100%-1.5rem)] max-w-none flex-col " +
  "overflow-hidden border border-paper-line " +
  "bg-bg-light p-0 text-ink shadow-2xl " +
  "backdrop:bg-bg-dark/50 " +
  "sm:max-h-[90dvh] sm:w-[calc(100%-3rem)]";

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
        if (
          event.target === dialogRef.current &&
          !busy
        ) {
          onClose();
        }
      }}
      className={`${dialogBase} ${sizeClasses[size]}`}
    >
      {open && (
        <>
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-paper-line px-5 py-5 sm:px-7">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  {eyebrow}
                </p>
              )}

              <h2
                id={titleId}
                className="mt-1 font-serif text-xl font-semibold text-bg-dark sm:text-2xl"
              >
                {title}
              </h2>

              {description && (
                <p
                  id={descriptionId}
                  className="mt-2 text-sm leading-6 text-ink-soft"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Tutup dialog"
              className="inline-flex size-10 shrink-0 items-center justify-center border border-paper-line text-ink-soft transition-colors hover:bg-bg-light-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </>
      )}
    </dialog>
  );
}
