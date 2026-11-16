
export const PUBLIC_LINKS = {
  bankSoal: {
    label: "Bank Soal",
    href: "https://drive.google.com/drive/folders/1cURykHoJWo6xkeHE99uZE_wG0-WbGqi_",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  /**
   * Sementara sampai `GET /public/settings` (key: `instagram_url`) tersedia.
   * URL dikonfirmasi pemilik; parameter share `rpxt` dibuang agar tautan stabil.
   */
  instagram: {
    label: "Instagram @himatknuklir",
    href: "https://www.instagram.com/himatknuklir",
    target: "_blank",
    rel: "noopener noreferrer",
  },
} as const;
