import type { BadgeTone } from "@/components/admin/shared/Badge";

import type { ActivityKind, ActivityLog } from "./types";

/** Label filter, mengikuti `KB` di `viewActivity()` Design/admin. */
export const KIND_LABELS: Record<ActivityKind, string> = {
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
  auth: "Login",
};

const KIND_TONES: Record<ActivityKind, BadgeTone> = {
  create: "mint",
  update: "blue",
  delete: "red",
  auth: "outline",
};

/** Badge aksi; aktivitas login dibedakan berhasil, keluar, gagal, diblokir. */
export function activityBadge(log: ActivityLog): { label: string; tone: BadgeTone } {
  switch (log.action) {
    case "auth.login.failure":
      return { label: "Gagal login", tone: "amber" };
    case "auth.login.rate_limited":
      return { label: "Diblokir", tone: "amber" };
    case "auth.logout":
      return { label: "Logout", tone: "outline" };
    default:
      return { label: KIND_LABELS[log.kind], tone: KIND_TONES[log.kind] };
  }
}

const RATE_LIMIT_SCOPES: Record<string, string> = {
  IP: "dari alamat IP yang sama",
  akun: "untuk akun ini",
  global: "di seluruh situs",
};

/**
 * Keterangan yang dibaca manusia. Catatan login dari backend hanya berisi
 * username atau "Rate limit IP: x", jadi kalimatnya disusun di sini.
 */
export function activityText(log: ActivityLog): string {
  const description = log.description?.trim() ?? "";

  switch (log.action) {
    case "auth.login.success":
      return "Masuk ke halaman admin";
    case "auth.logout":
      return "Keluar dari halaman admin";
    case "auth.login.failure":
      return description ? `Gagal masuk sebagai “${description}”` : "Gagal masuk";
    case "auth.login.rate_limited": {
      const match = /^Rate limit (IP|akun|global):\s*(.*)$/.exec(description);
      if (!match) return "Terlalu banyak percobaan masuk";
      const [, scope, username] = match;
      return `Terlalu banyak percobaan masuk ${RATE_LIMIT_SCOPES[scope]}${
        username ? ` (“${username}”)` : ""
      }`;
    }
    default:
      return description || "—";
  }
}

/** Nama yang ditampilkan untuk pelaku. */
export function activityActor(log: ActivityLog): string {
  if (log.admin_username) return log.admin_username;
  return log.kind === "auth" ? "Tanpa akun" : "Akun terhapus";
}

/**
 * Backend mengirim datetime tanpa zona waktu (UTC dari TiDB); tandai sebagai
 * UTC agar tidak dibaca sebagai waktu lokal (selisih 7 jam di WIB).
 */
function parseUtc(value: string): Date | null {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dayMonthFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});
const fullFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeStyle: "medium",
});

/** `{ date: "24 Nov 2026", time: "09.12", full: "Selasa, 24 November 2026 …" }`. */
export function activityTime(value: string): { date: string; time: string; full: string } {
  const date = parseUtc(value);
  if (!date) return { date: "—", time: "", full: "" };

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
    full: fullFormatter.format(date),
  };
}

/** Versi ringkas untuk ponsel: `24 Nov, 09.12` (tahun ditulis bila bukan tahun ini). */
export function activityTimeShort(value: string, now = new Date()): string {
  const date = parseUtc(value);
  if (!date) return "—";

  const day =
    date.getFullYear() === now.getFullYear()
      ? dayMonthFormatter.format(date)
      : dateFormatter.format(date);

  return `${day}, ${timeFormatter.format(date)}`;
}

/** Ringkasan perangkat dari user agent, mis. `Ponsel · Safari`. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Perangkat tidak diketahui";

  const device = /iPad|Tablet/i.test(userAgent)
    ? "Tablet"
    : /Mobi|Android|iPhone|iPod/i.test(userAgent)
      ? "Ponsel"
      : "Komputer";

  const browser = /Edg(?:e|A|iOS)?\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /SamsungBrowser\//.test(userAgent)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS\//.test(userAgent)
          ? "Firefox"
          : /Chrome\/|CriOS\//.test(userAgent)
            ? "Chrome"
            : /Safari\//.test(userAgent)
              ? "Safari"
              : "peramban lain";

  return `${device} · ${browser}`;
}