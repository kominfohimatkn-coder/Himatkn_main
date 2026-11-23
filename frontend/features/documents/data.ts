/**
 * Dokumen resmi HIMATKN (statis, tanpa backend). File dan folder disimpan di
 * Google Drive; situs hanya menyimpan tautannya.
 *
 * `drive` boleh berisi link **folder** (kartu menampilkan tombol "Buka di
 * Drive"; file baru di folder otomatis ikut terlihat) atau link **file PDF**
 * (tombol "Lihat" dan "Unduh").
 *
 * Selama daftar `DOCUMENTS` kosong, halaman /dokumen menampilkan
 * "Belum ada dokumen" + tombol Hubungi kami.
 *
 * Cara menambah dokumen:
 * 1. Unggah file ke Google Drive himpunan (atau siapkan foldernya).
 * 2. Klik kanan file/folder → Bagikan → Akses umum: "Siapa saja yang memiliki link"
 *    sebagai **Pelihat** → Salin link.
 * 3. Salin contoh di bawah ke dalam `DOCUMENTS`, hapus tanda komentarnya,
 *    tempel link tadi di `drive`, lalu sesuaikan isinya.
 * 4. `size` dan `updated` boleh dihapus (untuk folder biasanya dihapus).
 *    `size` ditulis seperti di Drive (mis. "1,2 MB"); `updated` = tanggal
 *    dokumen terakhir diubah, format `YYYY-MM-DD`.
 *
 * Untuk mengganti isi dokumen tanpa mengubah situs: di Drive, klik kanan file
 * → Info file → Kelola versi → Upload versi baru (link tetap sama).
 *
 * Contoh satu entri:
 *
 *   {
 *     id: "anggaran-dasar",
 *     title: "Anggaran Dasar HIMATKN",
 *     category: "Konstitusi",
 *     description: "Dasar organisasi: nama, asas, tujuan, keanggotaan, dan struktur himpunan.",
 *     drive: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing",
 *     size: "1,2 MB",
 *     updated: "2026-02-10",
 *   },
 */
export type PublicDocument = {
  /** Unik, huruf kecil; dipakai sebagai `key`. */
  id: string;
  title: string;
  /** Mis. "Konstitusi" atau "Pedoman". */
  category: string;
  description: string;
  /** Link berbagi Google Drive file PDF atau folder ("Siapa saja yang memiliki link"). */
  drive: string;
  size?: string;
  /** Format `YYYY-MM-DD`. */
  updated?: string;
};

export const DOCUMENTS: PublicDocument[] = [
  {
    id: "dokumen-hima",
    title: "Dokumen HIMA",
    category: "Konstitusi & SOP",
    description:
      "Anggaran Dasar, GBHO, Ketetapan MUMTN, Pola Umum Pengkaderan, dan SOP himpunan.",
    drive: "https://drive.google.com/drive/folders/11okNH-AYKKktSb1TodpWPFcAGfhm5Xpq",
  },
  {
    id: "format-administrasi-2026",
    title: "Format Administrasi 2026",
    category: "Administrasi",
    description:
      "Template surat, RAB, proposal, LPJ, dan SPJ, beserta SOP dan kode kegiatan KM Poltek Nuklir.",
    drive: "https://drive.google.com/drive/folders/15QSyASbFVxlN7R9PIEa9-S1FCMMCYuFg",
  },
];

/** Hasil membaca link Drive: folder (hanya dibuka) atau file (dibuka + diunduh). */
export type DriveTarget =
  | { kind: "folder"; view: string }
  | { kind: "file"; view: string; download: string };

/**
 * Alamat buka/unduh dari link berbagi Drive. Menerima bentuk
 * `.../drive/folders/<ID>`, `.../file/d/<ID>/view?...`, maupun `...?id=<ID>`.
 * `null` bila ID tidak ditemukan (link salah tempel).
 */
export function driveTarget(link: string): DriveTarget | null {
  const folderId = /\/folders\/([\w-]{10,})/.exec(link)?.[1];
  if (folderId) {
    return { kind: "folder", view: `https://drive.google.com/drive/folders/${folderId}` };
  }

  const fileId =
    /\/d\/([\w-]{10,})/.exec(link)?.[1] ?? /[?&]id=([\w-]{10,})/.exec(link)?.[1];
  if (!fileId) return null;

  return {
    kind: "file",
    view: `https://drive.google.com/file/d/${fileId}/view`,
    download: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}