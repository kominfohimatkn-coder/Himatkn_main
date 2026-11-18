export const PUBLIC_LINKS = {
  bankSoal: {
    label: "Bank Soal",
    href: "https://drive.google.com/drive/folders/1cURykHoJWo6xkeHE99uZE_wG0-WbGqi_",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  /**
   * Fallback sementara selama UI belum disambungkan ke `PublicSettings`.
   * Batch sambungan berikutnya akan memakai key `instagram_url` dan
   * `instagram_label` dari `GET /public/settings`; `bank_soal_url` akan
   * menggantikan `bankSoal.href`. Nilai di sini hanya cadangan, bukan sumber
   * kebenaran. URL dikonfirmasi pemilik; parameter share `rpxt` dibuang agar
   * tautan stabil.
   */
  instagram: {
    label: "Instagram @himatknuklir",
    href: "https://www.instagram.com/himatknuklir",
    target: "_blank",
    rel: "noopener noreferrer",
  },
} as const;
