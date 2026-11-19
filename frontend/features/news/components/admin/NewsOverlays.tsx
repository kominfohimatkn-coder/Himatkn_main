
"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SkeletonWrapperProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

type DialogProps = {
  open: boolean;
  titleId: string;
  busy?: boolean;
  compact?: boolean;
  onClose: () => void;
  children: ReactNode;
};

const dialogBase =
  "bg-bg-light p-0 text-ink shadow-2xl backdrop:bg-bg-dark/50";

function SkeletonWrapper({
  label,
  className = "",
  children,
}: SkeletonWrapperProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function NewsListSkeleton() {
  const rows = [0, 1, 2, 3, 4];

  return (
    <SkeletonWrapper
      label="Memuat daftar berita"
      className="animate-pulse motion-reduce:animate-none"
    >
      <ul className="divide-y divide-paper-line lg:hidden">
        {rows.map((row) => (
          <li key={row} className="space-y-3 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-6 w-20 bg-bg-light-2" />
              <div className="h-3 w-12 bg-bg-light-2" />
            </div>
            <div className="h-4 w-4/5 bg-bg-light-2" />
            <div className="h-3 w-3/5 bg-bg-light-2" />
            <div className="flex items-center justify-between border-t border-paper-line/70 pt-3">
              <div className="h-3 w-28 bg-bg-light-2" />
              <div className="h-8 w-24 bg-bg-light-2" />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden lg:block">
        <div className="grid grid-cols-[40%_12%_18%_16%_14%] border-b border-paper-line bg-bg-light-2 px-5 py-3">
          {[0, 1, 2, 3, 4].map((column) => (
            <div key={column} className="h-3 w-16 bg-paper-line" />
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row}
            className="grid grid-cols-[40%_12%_18%_16%_14%] items-center gap-0 border-b border-paper-line/70 px-5 py-5 last:border-b-0"
          >
            <div className="space-y-2 pr-5">
              <div className="h-4 w-3/4 bg-bg-light-2" />
              <div className="h-3 w-1/2 bg-bg-light-2" />
            </div>
            <div className="h-6 w-16 bg-bg-light-2" />
            <div className="h-3 w-20 bg-bg-light-2" />
            <div className="h-3 w-24 bg-bg-light-2" />
            <div className="ml-auto h-8 w-20 bg-bg-light-2" />
          </div>
        ))}
      </div>
    </SkeletonWrapper>
  );
}

export function NewsDetailSkeleton() {
  return (
    <SkeletonWrapper
      label="Memuat detail berita"
      className="space-y-7 animate-pulse motion-reduce:animate-none"
    >
      <section className="space-y-4">
        <div className="h-4 w-28 bg-bg-light-2" />
        <div className="space-y-2">
          <div className="h-3 w-14 bg-bg-light-2" />
          <div className="h-11 w-full bg-bg-light-2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-12 bg-bg-light-2" />
          <div className="h-11 w-full bg-bg-light-2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-bg-light-2" />
          <div className="h-40 w-full bg-bg-light-2" />
        </div>
      </section>

      <section className="space-y-3 border-t border-paper-line pt-6">
        <div className="h-4 w-36 bg-bg-light-2" />
        <div className="h-11 w-44 bg-bg-light-2" />
        <div className="h-3 w-2/3 bg-bg-light-2" />
      </section>
    </SkeletonWrapper>
  );
}

export function Dialog({
  open,
  titleId,
  busy = false,
  compact = false,
  onClose,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) onClose();
      }}
      className={`${dialogBase} ${
        compact
          ? "m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto border border-paper-line"
          : "m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:border sm:border-paper-line"
      }`}
    >
      {open ? children : null}
    </dialog>
  );
}
