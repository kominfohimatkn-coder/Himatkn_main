import type { ReactNode } from "react";

export const accountsActionClass =
  "inline-flex min-h-10 items-center justify-center border border-paper-line px-3 py-2 text-sm font-medium transition-colors hover:border-gold/70 hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

export const accountsPrimaryActionClass =
  "inline-flex min-h-10 items-center justify-center border border-bg-dark bg-bg-dark px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

export const accountsDangerActionClass =
  `${accountsActionClass} text-red-700 hover:border-red-200 hover:bg-red-50`;

export function AccountStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center border px-2.5 py-1 text-xs font-medium",
        active
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-paper-line bg-bg-light-2 text-ink-soft",
      ].join(" ")}
    >
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export function AccountRoleBadge({ superadmin }: { superadmin: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium",
        superadmin
          ? "border-gold/50 bg-gold/10 text-ink"
          : "border-paper-line bg-bg-light-2 text-ink-soft",
      ].join(" ")}
    >
      {superadmin ? "Superadmin" : "Pengurus"}
    </span>
  );
}

export function AccountsNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "error" | "success";
  children: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "warning"
        ? "border-gold/40 bg-gold/10 text-ink"
        : tone === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-paper-line bg-bg-light-2 text-ink";

  return (
    <div
      role={tone === "error" ? "alert" : tone === "success" ? "status" : undefined}
      className={`border p-3 text-sm leading-6 ${toneClass}`}
    >
      {children}
    </div>
  );
}
