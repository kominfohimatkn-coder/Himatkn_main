"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  PublicButton,
  type PublicButtonTone,
} from "@/components/public/PublicButton";
import { Button, type ButtonVariant } from "@/components/ui/Button";

/**
 * `tone` dipakai section publik yang sudah memakai Prototype V1.
 * `variant` dipertahankan agar halaman /struktur (R2) tidak berubah.
 */
type RefreshButtonProps =
  | { tone?: PublicButtonTone; variant?: undefined }
  | { tone?: undefined; variant: ButtonVariant };

export function RefreshButton({ tone, variant }: RefreshButtonProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const label = isPending ? "Memuat ulang..." : "Coba lagi";

  if (variant) {
    return (
      <Button variant={variant} disabled={isPending} onClick={handleRefresh}>
        {label}
      </Button>
    );
  }

  return (
    <PublicButton
      tone={tone ?? "outline"}
      disabled={isPending}
      onClick={handleRefresh}
      className="disabled:pointer-events-none disabled:opacity-60"
    >
      {label}
    </PublicButton>
  );
}
