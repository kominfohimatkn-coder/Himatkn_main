"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, type ButtonVariant } from "@/components/ui/Button";

export function RefreshButton({
  variant = "outline",
}: {
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
    >
      {isPending ? "Memuat ulang..." : "Coba lagi"}
    </Button>
  );
}
