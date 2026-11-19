import {
  mediaPathFromStorageKey,
  resolveMediaUrl,
} from "@/lib/media/api";

import type { AdminSettingItem } from "../../types";

interface SettingsGroupMeta {
  label: string;
  description: string;
}

const SETTINGS_GROUP_META: Record<string, SettingsGroupMeta> = {
  brand: {
    label: "Identitas",
    description: "Nama dan teks yang muncul di header serta footer.",
  },
  links: {
    label: "Tautan",
    description: "Tautan keluar dari situs.",
  },
  contact: {
    label: "Kontak",
    description: "Informasi kontak dan peta pada situs publik.",
  },
  hero: {
    label: "Beranda / Hero",
    description: "Bagian paling atas beranda.",
  },
  about: {
    label: "Tentang",
    description: "Bagian Tentang di beranda.",
  },
  program: {
    label: "Program Kerja",
    description: "Teks bagian Program Kerja.",
  },
  news: {
    label: "Publikasi",
    description: "Teks bagian Publikasi.",
  },
  structure: {
    label: "Struktur",
    description: "Teks bagian Struktur Organisasi.",
  },
};

const SETTING_HINTS: Record<string, string> = {
  brand_name: "Tampil di header dan footer situs.",
  brand_subtitle: "Teks kecil di bawah nama brand.",
  footer_copyright:
    "Contoh: © 2026 HIMATKN. Kosongkan untuk menyembunyikan teks hak cipta.",
  footer_institution:
    "Kosongkan untuk menyembunyikan nama institusi di footer.",
  bank_soal_url:
    "Harus tautan Google Drive (https://drive.google.com/…). Kosongkan untuk menyembunyikan menu Bank Soal.",
  instagram_url:
    "Harus tautan Instagram (https://www.instagram.com/…). Kosongkan untuk menyembunyikan tautan Instagram.",
  instagram_label: "Teks tautan Instagram, misalnya @himatknuklir.",
  contact_email: "Kosongkan untuk menyembunyikan email dari situs.",
  secretariat_address:
    "Boleh lebih dari satu baris. Kosongkan untuk menyembunyikan alamat.",
  maps_url:
    "Tautan tombol “Buka di Google Maps”. Harus dari Google Maps (https://maps.app.goo.gl/… atau https://www.google.com/maps/…).",
  maps_embed_url:
    "Harus diawali https://www.google.com/maps/embed. Ambil dari Google Maps → Bagikan → Sematkan peta → salin alamat di dalam src=\"…\".",
  hero_emphasis: "Tampil miring di baris kedua judul.",
  hero_description: "Kalimat singkat di bawah judul (tagline).",
  hero_image: "Unggah foto utama beranda. Kosongkan untuk memakai tampilan tanpa foto.",
  hero_image_alt: "Deskripsi foto untuk pembaca layar.",
  program_empty_text: "Tampil saat belum ada program kerja.",
  news_empty_text: "Tampil saat belum ada publikasi.",
  structure_note:
    "Catatan kecil di bawah daftar divisi. Kosongkan untuk menyembunyikan.",
};

const HOST_LABELS: Record<string, string> = {
  bank_soal_url: "Google Drive (drive.google.com)",
  instagram_url: "Instagram (instagram.com)",
  maps_url: "Google Maps",
  maps_embed_url: "Google Maps (www.google.com/maps/embed)",
};

export interface SettingsGroup {
  key: string;
  label: string;
  description: string;
  items: AdminSettingItem[];
}

export function buildSettingsGroups(
  items: AdminSettingItem[],
): SettingsGroup[] {
  const order: string[] = [];
  const grouped = new Map<string, AdminSettingItem[]>();

  for (const item of items) {
    if (!grouped.has(item.group)) {
      order.push(item.group);
      grouped.set(item.group, []);
    }

    grouped.get(item.group)?.push(item);
  }

  return order.map((key) => {
    const meta = SETTINGS_GROUP_META[key];

    return {
      key,
      label: meta?.label ?? humanizeGroupKey(key),
      description:
        meta?.description ?? "Pengaturan bagian ini tampil di situs publik.",
      items: grouped.get(key) ?? [],
    };
  });
}

function humanizeGroupKey(key: string): string {
  if (!key) return "Pengaturan";

  return key
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function settingHint(item: AdminSettingItem): string | undefined {
  const explicit = SETTING_HINTS[item.key];

  if (explicit) return explicit;

  if (item.key.endsWith("_eyebrow")) {
    return "Teks kecil berhuruf kapital di atas judul. Kosongkan untuk menyembunyikan.";
  }

  if (item.key.endsWith("_label")) {
    return "Teks pada tombol atau tautan.";
  }

  if (item.type === "url" && item.allowed_hosts.length > 0) {
    return `Harus diawali https:// dan berasal dari ${formatAllowedHosts(item)}.`;
  }

  return undefined;
}

export function formatAllowedHosts(item: AdminSettingItem): string {
  return HOST_LABELS[item.key] ?? item.allowed_hosts.join(", ");
}

export function validateSettingValue(
  item: AdminSettingItem,
  rawValue: string,
): string | null {
  const value = rawValue.trim();

  if (value.length > item.max_length) {
    return `Terlalu panjang. Maksimal ${item.max_length} karakter (sekarang ${value.length}).`;
  }

  if (!value) return null;

  if (item.type !== "multiline" && /[\r\n]/.test(value)) {
    return "Tidak boleh lebih dari satu baris.";
  }

  if (
    item.type === "email" &&
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
  ) {
    return "Format email tidak valid. Contoh: nama@contoh.com.";
  }

  if (item.type === "url") {
    if (/\s/.test(value)) {
      return "Tautan tidak boleh mengandung spasi.";
    }

    let parsed: URL;

    try {
      parsed = new URL(value);
    } catch {
      return "Format tautan tidak valid. Salin tautan lengkap dari peramban.";
    }

    if (parsed.protocol !== "https:") {
      return "Tautan harus diawali https://.";
    }

    if (
      item.allowed_hosts.length > 0 &&
      !item.allowed_hosts.includes(parsed.hostname)
    ) {
      return `Tautan harus dari ${formatAllowedHosts(item)}.`;
    }

    if (
      item.key === "maps_embed_url" &&
      !/^\/maps\/embed(\/|$)/.test(parsed.pathname)
    ) {
      return "Ini bukan tautan sematan. Ambil dari Bagikan → Sematkan peta, bukan dari bilah alamat.";
    }

    if (
      item.key === "maps_url" &&
      parsed.hostname !== "maps.app.goo.gl" &&
      !/^\/maps(\/|$)/.test(parsed.pathname)
    ) {
      return "Tautan Google harus mengarah ke Google Maps (…/maps/…).";
    }
  }

  return null;
}

/**
 * Pratinjau foto hero memakai `preview_url` backend bila nilainya belum
 * berubah. Nilai draft (hasil unggah baru) dinormalkan dari storage key.
 */
export function resolveSettingImageUrl(
  item: AdminSettingItem,
  value: string,
): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  if (item.preview_url && trimmed === item.value) {
    return resolveMediaUrl(item.preview_url);
  }

  if (trimmed.startsWith("images/") || trimmed.startsWith("api/v1/media/")) {
    return resolveMediaUrl(mediaPathFromStorageKey(trimmed));
  }

  return resolveMediaUrl(trimmed);
}

export function isWideSetting(item: AdminSettingItem): boolean {
  return (
    item.type === "multiline" ||
    item.type === "image" ||
    item.type === "url" ||
    item.max_length >= 1000
  );
}

export function isAboutItemKey(key: string): boolean {
  return /^about_item_\d+_/.test(key);
}

export function aboutItemNumber(key: string): number {
  const match = /^about_item_(\d+)_/.exec(key);

  return match ? Number.parseInt(match[1], 10) : 0;
}
