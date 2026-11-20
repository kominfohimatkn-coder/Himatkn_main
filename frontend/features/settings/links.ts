import type { PublicSettings } from "./types";

export type PublicLink = {
  label: string;
  href: string;
  target: "_blank";
  rel: "noopener noreferrer";
};

export type PublicLinks = {
  /** `null` bila `bank_soal_url` kosong. */
  bankSoal: PublicLink | null;
  /** `null` bila `instagram_url` kosong. */
  instagram: PublicLink | null;
};

/**
 * Tautan eksternal publik diturunkan dari site settings.
 *
 * URL kosong menghasilkan `null` sehingga pemanggil menyembunyikan tautan,
 * bukan memakai nilai hardcoded. Label Instagram memakai `instagram_label`
 * dengan teks netral "Instagram" bila kosong.
 */
export function getPublicLinks(settings: PublicSettings): PublicLinks {
  const bankSoalUrl = settings.bank_soal_url.trim();
  const instagramUrl = settings.instagram_url.trim();
  const instagramLabel = settings.instagram_label.trim();

  return {
    bankSoal: bankSoalUrl
      ? {
          label: "Bank Soal",
          href: bankSoalUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : null,
    instagram: instagramUrl
      ? {
          label: instagramLabel || "Instagram",
          href: instagramUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : null,
  };
}
