/**
 * Dokumen resmi HIMATKN (statis, tanpa backend).
 *
 * Cara menambah/mengganti dokumen:
 * 1. Taruh file PDF di `frontend/public/dokumen/` (nama file huruf kecil,
 *    tanpa spasi, mis. `anggaran-dasar.pdf`). Repo ini publik: pastikan PDF
 *    tidak memuat data pribadi (NIK, nomor HP, alamat rumah, tanda tangan).
 * 2. Isi entri di bawah: `file` = `/dokumen/<nama-file>.pdf`.
 * 3. `size` boleh dikosongkan; kalau diisi, tulis seperti di Explorer
 *    (mis. "1,2 MB"). `updated` = tanggal dokumen terakhir diubah.
 *
 * Daftar kosong (`[]`) menampilkan keterangan "Belum ada dokumen".
 */
export type PublicDocument = {
  /** Unik, huruf kecil; dipakai sebagai `key`. */
  id: string;
  title: string;
  /** Mis. "Konstitusi" atau "Pedoman". */
  category: string;
  description: string;
  /** Path di `public/`, mis. `/dokumen/anggaran-dasar.pdf`. */
  file: string;
  size?: string;
  /** Format `YYYY-MM-DD`. */
  updated: string;
};

// CONTOH dari prototipe — ganti judul, keterangan, dan file dengan dokumen asli.
export const DOCUMENTS: PublicDocument[] = [

];