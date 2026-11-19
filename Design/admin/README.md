# Panel Admin HIMATKN V2 — Prototipe (revisi 2)

Prototipe statis (HTML/CSS/JS tanpa build) sebagai acuan desain untuk implementasi Next.js. Semua data fiktif (`assets/data.js`); simpan/hapus hanya disimulasikan di memori dan hilang saat halaman dimuat ulang.

Buka `login.html`, atau langsung `index.html#/dashboard`.

| File | Isi |
|---|---|
| `login.html` | Halaman masuk + state galat |
| `index.html` | Shell SPA (hash router) |
| `assets/admin.css` | Gaya panel, mengikuti situs publik (Literata/Inter, hijau tua + mint) |
| `assets/admin.js` | Router, tampilan, dialog, validasi |
| `assets/data.js` | Fixture: role, izin, periode, divisi, anggota, publikasi, pengaturan, log |

## Cara review

| Parameter URL | Nilai | Fungsi |
|---|---|---|
| `role` | `superadmin` · `admin` · `editor` | Ganti role |
| `state` | `normal` · `loading` · `empty` · `error` · `expired` | Paksa state halaman |
| `delay` | ms (bawaan 450) | Lama skeleton |
| `panel=off` | — | Sembunyikan panel Review |

Akun demo di `login.html`: `pengurus.minfo` → Admin, `editor.publikasi` → Editor, username lain → Superadmin. Username `salah` → kredensial salah, `kunci` → terlalu banyak percobaan.

Demo lain:
- **Akun saya:** isi password lama `salah` untuk melihat state "password lama salah".
- **Pengaturan:** isi URL non-Google Drive di Bank Soal, atau tautan `maps/place` di Maps, lalu Simpan untuk melihat ringkasan galat.

> **Panel Review** (pojok kanan bawah) adalah **alat bantu prototipe, bukan bagian produk**. Jangan diimplementasikan.

## Halaman → endpoint → izin

`[segera]` = endpoint belum ada di backend, tapi sudah boleh didesain. Prefix semua endpoint: `/api/v1`.

| Halaman | Endpoint | Izin |
|---|---|---|
| Dashboard | `GET /admin/dashboard` (total saja) | `dashboard.view` |
| Publikasi — daftar | `GET /admin/news` | `news.view` |
| Publikasi — tulis/ubah | `POST /admin/news`, `PUT /admin/news/{id}` | `news.create` / `news.update` |
| Publikasi — hapus | `DELETE /admin/news/{id}` | `news.delete` |
| Publikasi — galeri | `POST/PUT/DELETE /admin/news/{id}/images` (caption, sort_order) | `news.update` + `media.manage` (unggah) |
| Unggah gambar | `POST /media/images` (JPG/PNG/WebP, ≤ 4 MB) | `media.manage` |
| Program kerja | `GET/POST/PUT/DELETE /admin/programs` | `programs.view` / `programs.manage` |
| Periode — lihat, buat | `GET/POST /admin/periods` | `organization.view` / `organization.manage` |
| Periode — ubah, aktifkan, hapus | `PUT`, `POST …/activate`, `DELETE` **[segera]** | `organization.manage` |
| Divisi — lihat | `GET /admin/divisions` | `organization.view` |
| Divisi — tambah/ubah/hapus/salin | **[segera]** | `organization.manage` |
| Jabatan | `GET /admin/positions` (baca saja, global) | `organization.view` |
| Anggota | `GET/POST/PUT/DELETE /admin/members` (+ foto via media) | `organization.view` / `organization.manage` |
| Administrator | `GET/POST/PUT/DELETE /admin/admins`, `GET /admin/roles` | `admins.view` / `admins.manage` |
| Akun saya — ganti password | **[segera]** (perlu password lama) | login saja |
| Log aktivitas | `GET /admin/activity-logs` (berhalaman) | `activity.view` |
| Statistik pengunjung | `GET /admin/visitor-logs` (log mentah, berhalaman) | `visitors.view` |
| Pengaturan situs | `GET /admin/settings`, `PATCH` (atomik), `PUT /{key}`, `DELETE /{key}` | `settings.view` / `settings.manage` |

## Role (menunggu konfirmasi)

| Role | Izin |
|---|---|
| Superadmin | Semua izin |
| Admin | Sesuai DB + `media.manage` |
| Editor | `dashboard.view`, `news.view/create/update` (tanpa hapus), `organization.view/manage`, `media.manage`. `notifications.view` dihapus. |

Perilaku per halaman:
- Menu tanpa izin `*.view` disembunyikan; membuka URL-nya langsung menampilkan **403**.
- Punya `view` tanpa `manage` → mode **baca saja** (banner, tombol aksi disembunyikan).
- Tanpa `media.manage` → galeri dan foto anggota menampilkan pemberitahuan alih-alih area unggah.

## State yang tersedia

- **Global:** loading (skeleton), kosong, galat muat + coba lagi, sesi habis (modal), 403, baca saja, berhasil/gagal (toast), perubahan belum disimpan + konfirmasi saat meninggalkan halaman.
- **Login:** normal, memproses, kredensial salah, terkunci.
- **Publikasi:** draft/terbit/arsip, publikasi baru tanpa galeri ("Simpan draft dulu…"), unggah berjalan, file ditolak (tipe/ukuran), Tulis/Pratinjau, tanpa `media.manage`.
- **Program kerja:** Direncanakan/Berjalan/Selesai/Dibatalkan (redup dan dicoret), filter periode dan status kosong.
- **Struktur:**
  - checklist periode baru;
  - dialog aktivasi (normal dan peringatan periode kosong);
  - periode tidak bisa dihapus (dengan alasan);
  - divisi tidak bisa dihapus ("Masih ada N anggota / N program kerja");
  - hasil salin divisi ("X disalin, Y dilewati");
  - foto anggota (ada, kosong, ganti, hapus).
- **Pengaturan:** belum disimpan, ringkasan galat + galat per kolom, kembali ke bawaan (konfirmasi), penanda "Bawaan", meta "Diubah … oleh …", kartu kunci tidak dikenal.
- **Akun saya:** password lama salah, konfirmasi tidak cocok, terlalu pendek, berhasil (sesi lain diakhiri).

## Modul ditunda

**Agenda, Dokumen, Notifikasi — Ditunda.**
- Dihapus dari sidebar, dashboard, dan topbar (lonceng dihapus).
- Kodenya tetap ada dan hanya bisa dibuka lewat URL (`#/agendas`, `#/documents`, `#/notifications`) atau panel Review, dengan banner "Modul ditunda".
- Tidak ada fitur baru untuk modul-modul ini.

## Keputusan tertunda

1. **Format isi publikasi:** prototipe memakai Markdown (toolbar + Pratinjau). Perlu konfirmasi apakah backend/frontend publik merender Markdown.
2. **Izin Editor:** daftar di atas masih usulan.
3. **`media.manage` untuk Admin dan Editor:** usulan; tanpa izin ini mereka tidak bisa mengunggah gambar.
4. **Nama role** dan ringkasan izin di tab Role menunggu konfirmasi.

## Batasan backend terbaru (dicerminkan di desain)

- Dashboard hanya mengembalikan lima total, tanpa rincian. Kartu anggota = semua periode.
- `featured_image` tidak bisa diatur langsung; sampul = gambar galeri pertama.
- Statistik pengunjung hanya log mentah; tidak ada agregasi/grafik.
- Hanya satu periode aktif. Aktivasi periode kosong diizinkan dengan peringatan. Periode hanya bisa dihapus jika tidak aktif dan kosong.
- Salin divisi tidak menyalin anggota; nama yang sudah ada dilewati.
- `PATCH /admin/settings` atomik: satu kolom salah → tidak ada yang tersimpan.
- Validasi URL mengikuti backend:
  - harus https, tanpa spasi;
  - host diizinkan per kolom (mis. Bank Soal hanya `drive.google.com`; Maps hanya `google.com/maps/embed…`);
  - panjang maksimum per kolom.
- Kunci lama (`instagram_handle`, `cabinet_name`, `hero_tagline`) dan mode pemeliharaan tidak ada lagi. Kunci tidak dikenal ditampilkan di kartu tersendiri untuk dihapus.

## Aksesibilitas & responsif

- Diuji di lebar 390, 768, dan 1280 px. Tabel panjang menjadi kartu di layar sempit.
- Drawer dan modal:
  - menutup dengan Esc;
  - menjebak fokus;
  - mengembalikan fokus ke pemicu.
- Urutan galeri bisa diubah dengan seret atau tombol naik/turun (keyboard).
- Teks kecil minimal 11 px; warna teks redup dinaikkan agar kontras ≥ 4,5:1.
- Tautan "Lewati ke konten" tersedia.
