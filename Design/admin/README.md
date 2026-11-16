# HIMATKN: Panel Admin (prototipe desain)

Prototipe HTML panel admin V2 dengan gaya yang sama seperti situs publik: Literata untuk judul, Inter untuk isi, label kapital berspasi, hijau tua + mint, garis tipis, dan radius kecil. Halaman, kolom, izin, dan role mengikuti **backend V2 yang sebenarnya** (router `/api/v1/admin/*`, `seed.py`, dan dump `himatkn_v2`). Semua data di dalamnya adalah *fixture*. Simpan dan hapus hanya disimulasikan di memori.

## Cara membuka
Buka `login.html` (atau langsung `index.html`) lewat server lokal dari folder induk:

```
python -m http.server 8000   →   http://localhost:8000/admin/login.html
```

Login prototipe:
- `admin` (atau username apa pun) → Superadmin
- `subahan` → Admin
- `minfo.editor` → Editor
- `salah` → contoh kredensial salah
- `kunci` → contoh terlalu banyak percobaan

## Halaman → endpoint → izin
| Halaman | Hash | Endpoint backend | Izin lihat / kelola |
|---|---|---|---|
| Dashboard | `#/dashboard` | `GET /admin/dashboard` (+ ringkasan modul) | `dashboard.view` |
| Publikasi (daftar + editor) | `#/news`, `#/news/new`, `#/news/{id}` | `/admin/news`, tags, `/{id}/images` | `news.view` / `news.create`, `news.update`, `news.delete` |
| Program Kerja | `#/programs` | `/admin/programs` | `programs.view` / `programs.manage` |
| Agenda | `#/agendas` | `/admin/agendas` | `agendas.view` / `agendas.manage` |
| Dokumen | `#/documents` | `GET/POST /admin/documents`, `/media/documents/*` | `documents.view` / `documents.manage` |
| Struktur Organisasi | `#/organization` | `/admin/organization/periods, divisions, positions, members` | `organization.view` / `organization.manage` |
| Notifikasi | `#/notifications` | `/admin/notifications`, `/{id}/read` | `notifications.view` / `notifications.manage` |
| Administrator + Role & izin | `#/admins` | `/admin/admins`, `/admin/admins/roles` | `admins.view` / `admins.manage`, tab role: `roles.manage` |
| Log Aktivitas | `#/activity` | `GET /admin/activity-logs` | `activity_logs.view` |
| Statistik Pengunjung | `#/visitors` | `GET /admin/visitor-logs` | `visitor_logs.view` |
| Pengaturan Situs | `#/settings` | `GET /admin/settings`, `PUT /admin/settings/{key}` | `settings.view` / `settings.manage` |
| Login | `login.html` | `/auth/csrf`, `/auth/login`, `/auth/me`, `/auth/logout` | — |

## Aturan tampilan berdasarkan role
UI hanya mengikuti izin; backend tetap menjadi penentu akses yang sebenarnya.

1. **Menu sidebar** hanya menampilkan modul yang punya izin `*.view`. Grup yang kosong ikut disembunyikan.
2. **Punya izin lihat tapi tidak punya izin kelola**: halaman tetap terbuka dengan banner "Mode lihat saja". Tombol tambah, edit, dan hapus disembunyikan, sementara form dan pengaturan tampil *read-only*.
3. **URL dibuka tanpa izin lihat**: muncul state **403** yang menyebut izin yang dibutuhkan.
4. **Dashboard**: kartu statistik, panel, dan tombol aksi cepat hanya muncul untuk modul yang diizinkan.
5. **Unggah gambar** (gambar utama publikasi, foto anggota) membutuhkan `media.manage`. Tanpa izin itu, dropzone diganti pemberitahuan.
6. **Administrator**: role yang izinnya melebihi izin Anda tidak bisa dipilih. Anda juga tidak bisa menghapus, menonaktifkan, atau mengubah role akun sendiri. Ada peringatan bahwa sesi target akan diakhiri.

| Role | Yang terlihat |
|---|---|
| Superadmin | Semua modul (23 izin). |
| Admin | Sesuai `role_permissions` di database: konten dan struktur bisa dikelola. Dokumen, pengaturan, notifikasi, dan administrator hanya bisa dilihat. Log dan statistik bisa dilihat. Tanpa `media.manage`. |
| Editor | **Usulan**: Dashboard, Publikasi (tanpa hapus), Struktur Organisasi, Notifikasi, dan unggah gambar. |

## State yang tersedia
Panel **Review** ada di kiri bawah. State juga bisa diatur lewat URL `?role=…&state=…`:
- `state=loading` → skeleton + progress bar
- `state=empty` → semua daftar kosong
- `state=error` → gagal memuat + tombol coba lagi
- `state=expired` → modal "Sesi berakhir"

Ada juga state yang muncul dari interaksi:
- pencarian/filter tanpa hasil;
- validasi form (wajib diisi, slug atau username sudah dipakai, tanggal selesai sebelum tanggal mulai, format URL/email, kata sandi < 8 karakter);
- file salah format atau > 4 MB, plus progress unggah;
- konfirmasi hapus, tombol sedang menyimpan, toast berhasil/gagal;
- indikator "ada perubahan belum disimpan" di editor publikasi;
- 404 di dalam admin.

Di `login.html`: `?state=error|locked|expired|logged-out|loading`.

## Keterbatasan backend yang ditampilkan apa adanya di UI
- Divisi dan jabatan hanya bisa dilihat (belum ada CRUD).
- Periode hanya bisa dibuat (belum bisa diubah atau dihapus).
- Dokumen hanya bisa dilihat dan diunggah (belum bisa diubah atau dihapus) dan bersifat privat (tautan 5 menit).
- Role hanya bisa dilihat (belum ada API untuk mengubah role atau izin).
- Agenda belum tampil di situs publik.

## Perlu keputusan / verifikasi sebelum diimplementasikan
1. **Izin role Editor.** Di `seed.py`, editor masih mendapat izin yang sama persis dengan admin, padahal deskripsinya "akses terbatas untuk publikasi dan struktur organisasi". Prototipe memakai versi terbatas sebagai usulan.
2. **`media.manage`.** Izin ini ada di seed (23 izin), tetapi tidak ada di dump database (22 izin). Akibatnya role Admin tidak bisa mengunggah gambar. Pastikan izin ini ada di DB, lalu putuskan role mana yang mendapatkannya.
3. **Kunci pengaturan situs** (`contact_email`, `instagram_handle`, `secretariat_address`, `bank_soal_url`, `maps_url`, `cabinet_name`, `hero_tagline`, `maintenance_mode`) masih usulan, disamakan dengan pengaturan V1. Situs publik juga masih butuh endpoint publik untuk membacanya.
4. **Nilai status program kerja** (`planned` / `ongoing` / `completed`): yang terlihat di DB hanya default `planned`. Samakan dengan enum di backend.
5. **Penanganan 401.** Modal "Sesi berakhir" butuh `ApiError` yang membawa status HTTP di frontend.
6. **Format isi publikasi** (teks biasa, Markdown, atau HTML) menentukan editor yang dipakai. Toolbar di prototipe masih visual saja.
