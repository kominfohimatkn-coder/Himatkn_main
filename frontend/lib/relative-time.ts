const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Waktu relatif ala `rel()` di Design/admin/assets/admin.js:
 * "baru saja", "5 menit lalu", "3 jam lalu", "2 hari lalu", lalu tanggal.
 */
export function relativeTime(value: string | null, now = Date.now()): string {
  if (!value) return "Belum pernah";

  // Backend mengirim datetime tanpa zona waktu (UTC dari TiDB); tandai sebagai UTC
  // agar tidak dibaca sebagai waktu lokal (selisih 7 jam di WIB).
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const time = new Date(hasZone ? value : `${value}Z`).getTime();
  if (Number.isNaN(time)) return "—";

  const minutes = Math.round((now - time) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.round(hours / 24);
  return days < 7 ? `${days} hari lalu` : shortDate.format(new Date(time));
}