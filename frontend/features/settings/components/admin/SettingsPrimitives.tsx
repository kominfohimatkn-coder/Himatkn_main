import type { ReactNode } from "react";

export const settingsActionClass =
  "inline-flex min-h-10 items-center justify-center border border-paper-line px-3 py-2 text-sm font-medium transition-colors hover:border-gold/70 hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

export const settingsDangerActionClass = `${settingsActionClass} text-red-700 hover:border-red-200 hover:bg-red-50`;

export const settingsLinkActionClass =
  "text-xs font-medium text-ink-soft underline-offset-4 transition-colors hover:text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

type SettingsNoticeTone = "info" | "success" | "warning" | "error";

export function SettingsNotice({
  tone = "info",
  children,
}: {
  tone?: SettingsNoticeTone;
  children: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "success"
        ? "border-green-200 bg-green-50 text-green-800"
        : tone === "warning"
          ? "border-gold/40 bg-gold/10 text-ink"
          : "border-paper-line bg-bg-light-2 text-ink";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`border p-3 text-sm leading-6 ${toneClass}`}
    >
      {children}
    </div>
  );
}

export function formatSettingDate(
  value: string | null | undefined,
): string {
  if (!value) return "belum diisi";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
