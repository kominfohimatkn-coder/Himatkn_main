import type { PublicSettings } from "./types";

/**
 * Nilai cadangan saat `GET /public/settings` gagal.
 *
 * WAJIB sinkron dengan default registry di
 * `Backend/app/services/site_settings.py`. Key copy memakai default netral
 * backend; key data (URL, email, alamat, peta, footer) bernilai `""`.
 *
 * Dipisah dari `public-api.ts` agar komponen klien (header/footer) dapat
 * memakai default tanpa menarik modul HTTP.
 */
export const PUBLIC_SETTINGS_FALLBACK: PublicSettings = {
  brand_name: "HIMA TEKNOKIMIA NUKLIR",
  brand_subtitle: "POLITEKNIK TEKNOLOGI NUKLIR",
  footer_copyright: "",
  footer_institution: "",
  bank_soal_url: "",
  instagram_url: "",
  instagram_label: "",
  contact_email: "",
  secretariat_address: "",
  maps_url: "",
  maps_embed_url: "",
  hero_eyebrow: "HIMATKN",
  hero_title: "Himpunan Mahasiswa",
  hero_emphasis: "Teknokimia Nuklir",
  hero_description:
    "Wadah mahasiswa Teknokimia Nuklir untuk belajar, berkarya, dan berkontribusi.",
  hero_image: "",
  hero_image_alt: "",
  hero_primary_label: "Lihat Program Kerja",
  hero_secondary_label: "Kenali Kami",
  about_eyebrow: "",
  about_title: "Ruang Tumbuh Mahasiswa",
  about_description:
    "Himpunan mahasiswa yang menjadi ruang belajar, berkarya, dan berkolaborasi.",
  about_item_1_tag: "Komunitas",
  about_item_1_title: "Komunitas",
  about_item_1_description:
    "Tempat bertemu dan bertukar gagasan antaranggota.",
  about_item_2_tag: "Karya",
  about_item_2_title: "Karya",
  about_item_2_description:
    "Wadah mengembangkan karya dan kompetensi.",
  about_item_3_tag: "Kolaborasi",
  about_item_3_title: "Kolaborasi",
  about_item_3_description:
    "Ruang bekerja sama dengan berbagai pihak.",
  program_eyebrow: "Program",
  program_title: "Program Kerja",
  program_empty_text: "Belum ada program kerja.",
  news_eyebrow: "Publikasi",
  news_title: "Kabar Terbaru",
  news_empty_text: "Belum ada publikasi.",
  news_more_label: "Lihat semua",
  structure_eyebrow: "Organisasi",
  structure_title: "Susunan Kepengurusan",
  structure_description:
    "Kenali struktur dan anggota kepengurusan.",
  structure_note: "",
  structure_button_label: "Selengkapnya",
  contact_eyebrow: "Kontak",
  contact_title: "Hubungi Kami",
  contact_description:
    "Sampaikan pertanyaan atau kolaborasi melalui kanal resmi.",
  contact_button_label: "Kirim Email",
};
