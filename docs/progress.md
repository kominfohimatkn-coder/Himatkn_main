# HIMATKN — Progress Tracker

> Wajib dibaca pada awal setiap sesi dan diperbarui oleh agent pada akhir setiap sesi/batch. Jangan hapus riwayat lama; tambahkan entri baru.

Urutan membaca setiap sesi:
1. **Current Project State** (Bagian 1) — kondisi repo, keputusan pemilik, blocker, rencana batch. Selalu baca bagian ini dulu.
2. **Active Development Log** (Bagian 2) — entri sesi sejak 11 November 2026.
3. **Historical Archive** (Bagian 3) — entri sebelum 11 November 2026. Baca penanda arsip di dalamnya sebelum memakai isinya.
4. **Template Catatan Sesi** (Bagian 4) — salin untuk entri baru.

Active Development Log dan Historical Archive bersifat **append-only**: entri lama tidak boleh diedit; tambahkan entri baru, dan bila ada koreksi, catat di Current Project State bagian "Koreksi atas catatan lama".

---

## 1. Current Project State

> Terakhir diperbarui: 18 November 2026 (Batch ACC — halaman Administrator dan Akun saya selesai di working tree). Perbarui bagian ini pada setiap batch.

### a. Snapshot repository

- Branch: `feat/admin-ui-foundation`.
- HEAD terverifikasi saat Batch API-B3d: `4deb3f4` (`style(frontend): canonical tailwind classes`, sudah di-commit pemilik). B3c kemudian di-commit pemilik sebagai `7f13f03`; perubahan B3d masih berada di working tree dan belum di-commit.
- HEAD terverifikasi saat Batch API-B3c: `4deb3f4`. B3c kemudian di-commit pemilik sebagai `7f13f03`.
- HEAD terverifikasi saat Batch API-B3b: `f80ecfb` (B3a). B3b kemudian di-commit pemilik sebagai `35188af`.
- HEAD terverifikasi saat Batch API-B3a: `d642419` (activate period). B3a kemudian di-commit pemilik sebagai `f80ecfb`.
- HEAD terverifikasi saat Batch API-F: `7b249b6` (API-B2). API-F kemudian di-commit pemilik sebagai `7a948f8`.
- Batch B3 langkah 1–2 sudah di-commit pemilik: `61ab3c3` (create periode aktif menonaktifkan periode lain) dan `d642419` (activate atomik + warnings).
- HEAD terverifikasi saat Batch API-B2: `ac9cd8a` (API-B1). API-B2 kemudian di-commit pemilik sebagai `7b249b6`.
- HEAD terverifikasi saat Batch API-B1: `cc1d496` (R1 Fase B). API-B1 kemudian di-commit pemilik sebagai `ac9cd8a`.
- HEAD terverifikasi saat Batch R1 Fase B: `733a561` (Fase A). Fase B kemudian di-commit pemilik sebagai `cc1d496`.
- HEAD terverifikasi saat Batch R1 Fase A: `00bf955cb9bb35c8adcf9e480834b01e43f11b2c` (`00bf955`), ahead 2 dari remote yang diketahui.
- HEAD terverifikasi saat Batch R0: `b388ae752270a03ae9a5fcbf25e44ad2b9c840fc` (`b388ae7` — "add something i thought was important").
- HEAD remote yang sebelumnya diketahui: `5e9aa6c` ("remove unused state"). HEAD lokal sudah lebih baru dari itu; `b388ae7` hanya mengubah `README.md`.
- `Design/bank-soal.html` sudah dihapus pada `5e9aa6c`; halaman tersebut bukan lagi bagian Prototype aktif. Link `bank-soal.html` yang masih tersisa di file `Design/` lain diabaikan.
- Working tree bersih sebelum Batch R0 dimulai.
- Batch R1 Fase A (15 Nov) sudah di-commit pemilik sebagai `733a561`.
- Batch R1 Fase B (16 Nov) sudah di-commit pemilik sebagai `cc1d496`.
- Batch API-B1 (16 Nov) sudah di-commit pemilik sebagai `ac9cd8a`.
- Batch API-B2 (16 Nov) memperluas kontrak publik: filter program (periode/status/divisi), detail program per slug, pencarian judul berita, `total`, `excerpt`, `tags`, `sort_order` organisasi, normalisasi `photo_url`, dan validasi enum status program. Ditambah tindak lanjut review API-B1 (default hero prototype + path `maps_url`). Batch ini sudah di-commit pemilik sebagai `7b249b6`; **belum di-deploy**.
- Batch API-F (16 Nov) menyinkronkan API layer frontend dengan kontrak API-B1/API-B2: `ApiError` bertipe + helper, tipe publik/admin, service news/program/organization/settings/visits/admin settings, helper status program, dan status program di form admin menjadi `<select>`. Sudah di-commit pemilik sebagai `7a948f8`; **belum di-deploy**.
- Batch B3a (17 Nov) menambahkan `PUT` dan `DELETE /admin/organization/periods/{id}` serta validasi tanggal pada create/update periode. Sudah di-commit pemilik sebagai `f80ecfb`; **belum di-deploy**.
- Batch B3b (17 Nov) menambahkan CRUD divisi (`POST`/`PUT`/`DELETE /admin/organization/divisions`), salin divisi antarperiode (`POST /admin/organization/periods/{id}/divisions/copy`), perbaikan bug audit CRUD anggota (`request=request` → `ip_address`/`user_agent`), dan pengurutan `GET /divisions` berdasarkan `sort_order` lalu `id`. Sudah di-commit pemilik sebagai `35188af`; **belum di-deploy**.
- Batch B3c (17 Nov) menambahkan `POST /api/v1/auth/change-password` (login + CSRF, tanpa permission tambahan) yang memverifikasi kata sandi lama, menyimpan hash baru, mencabut semua sesi lain milik admin yang sama, mempertahankan sesi saat ini, dan menulis audit `admin.password_change` tanpa menyimpan kata sandi. Sudah di-commit pemilik sebagai `7f13f03`; **belum di-deploy**.
- Batch B3d (17 Nov) menambahkan setting `hero_image` (tipe `image`) dan `hero_image_alt` (text 200) sehingga registry menjadi **47 key**; validasi storage key gambar V2 + normalisasi path media, `preview_url` di admin settings hanya untuk tipe image, `GET /public/settings` mengirim `hero_image` sebagai path media, dokumentasi `Backend/docs/ORGANIZATION_API.md`, dan regenerasi `Backend/routes.txt` (71 baris). Perubahan berada di working tree; **belum di-commit dan belum di-deploy**.
- **API-B3 selesai** (B3a–B3d). Frontend kini sinkron sejak F2b: 47 key termasuk `hero_image`/`hero_image_alt`; hero homepage tetap memakai aset statis sampai R3.
- **Batch B4a** (18 Nov) mengganti model izin menjadi izin langsung per akun: tabel `admin_permissions`, role `admin`/`editor` dihapus, katalog izin + implikasi, dan migrasi `20261118_0002`. Sudah di-commit pemilik sebagai `8ea1771`.
- **Batch B4b** (18 Nov) menambahkan endpoint kelola akun berbasis superadmin (`GET /admin/admins/permissions`, `POST`/`PUT`/`DELETE /admin/admins`), guard maksimal 2 superadmin dan minimal 1 superadmin aktif, audit spesifik, dokumentasi `Backend/docs/ADMIN_API.md`, serta regenerasi `Backend/routes.txt` (71 baris). Sudah di-commit pemilik sebagai `2af22db`; **belum di-deploy**.
- **Batch F2a** (18 Nov) melengkapi service & type admin organisasi (`frontend/types/organization.ts`, `frontend/lib/admin/organization.ts`) untuk seluruh endpoint `ORGANIZATION_API.md` (periode, divisi + copy, posisi, anggota) serta upload & kompresi gambar (`frontend/lib/media/compress.ts`, `frontend/lib/api/media.ts`, `frontend/types/media.ts`). Sudah di-commit pemilik sebagai `fd60056`.
- **Batch F2b** (18 Nov) menyelesaikan API-F2 di frontend: `Admin.is_superadmin` + `changePassword()`, helper izin `frontend/lib/auth/permissions.ts`, `can()`/`isSuperadmin` di `AuthContext`, service/type akun admin + katalog izin + `applyPermissionImplications`, sinkronisasi settings **47 key** (`hero_image`, `hero_image_alt`, tipe `image`, `preview_url`), dan kompresi `uploadAdminNewsImage`. Perubahan berada di working tree; **belum di-commit**. Frontend siap untuk halaman admin, tetapi UI-nya belum dibuat.
- **Batch UI-0** (18 Nov) menambahkan primitif form `components/ui/` (`Input`, `Textarea`, `Select`, `Checkbox`, `FormField`) dan gerbang izin `components/admin/shared/` (`Can`, `RequirePermission`); form program, filter berita, serta halaman dashboard/news/programs sudah memakainya, dan navigasi memakai `PERMISSIONS`. Perubahan berada di working tree; **belum di-commit**.
- **Batch ORG-A** (18 Nov) menambahkan halaman admin `/admin/organization` ("Struktur Organisasi") dengan pemilih periode, buat/ubah/aktifkan/hapus periode, checklist periode baru, daftar divisi untuk periode terpilih, CRUD divisi, dan salin divisi antarperiode. Mode baca saja untuk akun tanpa `organization.manage` memakai banner dan `Can`; pesan `409` backend ditampilkan dari `ApiError.detail`. Perbaikan kecil: kartu dashboard mengikuti izin `news.view`/`programs.view`/`organization.view`/`visitor_logs.view`, kartu Agenda dihapus, label akun sidebar menjadi "Superadmin"/"Pengurus", dan menu "News" menjadi "Publikasi". Perubahan berada di working tree; **belum di-commit**.
- **Batch ORG-B** (18 Nov) melengkapi halaman admin `/admin/organization` dengan bagian **Anggota** di bawah divisi: daftar anggota periode terpilih dikelompokkan per divisi (`sort_order` divisi) lalu "Tanpa divisi", urut `sort_order` anggota lalu nama, dengan foto/inisial, nama, dan jabatan dari `GET /positions`; pencarian nama di sisi klien. Form anggota memakai `FormDialog` (nama, jabatan, divisi periode terpilih atau tanpa divisi, urutan, foto) dan tombol "Tambah anggota" per grup mengisi divisi otomatis. Foto diunggah lewat `uploadImage()` (`POST /media/images`, kompresi browser), `storage_key` disimpan ke `photo_url`; pratinjau memakai `mediaPathFromStorageKey()` + `resolveMediaUrl()` dan nilai lama URL/path tetap lewat `resolveMediaUrl()`. Tanpa `media.manage`, area unggah diganti pemberitahuan. Hapus anggota memakai `ConfirmDialog` dengan nama dan periode, dan checklist periode kini memakai jumlah anggota sebenarnya. Perubahan berada di working tree; **belum di-commit**.
- **Batch ACC** (18 Nov) menambahkan halaman superadmin `/admin/accounts` (daftar akun, tambah/ubah, checklist izin per modul dengan implikasi otomatis, reset password, hapus) dan halaman `/admin/account` untuk semua akun yang login (profil ringkas + ganti kata sandi sendiri). Menu "Administrator" memakai izin `admins.view` dan mengarah ke `/admin/accounts`; blok akun sidebar menaut ke `/admin/account`. Helper pesan error dipindahkan ke `getApiErrorMessage` di `lib/api/errors.ts` dan `features/organization/errors.ts` dihapus. Perubahan berada di working tree; **belum di-commit**.
- URL Instagram `https://www.instagram.com/himatknuklir` **dikonfirmasi pemilik** pada 16 Nov. Konstanta dipertahankan sebagai utang teknis (lihat e.8); parameter share `rpxt` pada URL yang dikirim pemilik dibuang agar tautan stabil.

### b. Scope fase saat ini

- Redesign **website publik** V2, frontend-only.
- **Pengecualian Batch API-B1/API-B2 (izin eksplisit pemilik, 16 Nov):** perubahan diizinkan pada `Backend/app/{routers,schemas,services}`, `Backend/tests/`, `Backend/docs/`, `Backend/README.md`, `Backend/routes.txt`, dan `docs/progress.md`. Model ORM, schema/Alembic, auth/CSRF/CORS, storage, environment, production, dan `frontend/` tetap dilarang. API-B2 juga **tidak** mengubah skema dan tetap kompatibel ke belakang (hanya penambahan field/parameter).
- **Pengecualian Batch API-F (izin eksplisit pemilik, 16 Nov):** perubahan diizinkan pada `frontend/lib/**`, `frontend/types/**`, dan penyesuaian teknis `frontend/components/admin/programs/{ProgramFormDialog,ProgramPrimitives}.tsx`, plus `docs/progress.md`. Tampilan publik, auth/CSRF/cookie, dependency, konfigurasi, backend, database, dan deployment tidak diubah.
- Backend, database, migration, auth/CSRF/CORS/RBAC, storage, deployment, dan environment tidak diubah.
- Panel admin **dipertahankan** sesuai desain dan implementasi V2 saat ini; hanya penyesuaian teknis untuk integrasi/konsistensi bila benar-benar diperlukan.

### c. Acuan aktif dan urutan baca

- Acuan visual dan interaksi aktif: **Prototype Desain HIMATKN V1** di `Design/` (7 halaman HTML + aset). Panduan: `docs/DESIGN_REFERENCE_GUIDE.md` dan `Design/README.md`.
- Source code V2 (`frontend/`, `Backend/`) tetap menjadi sumber kebenaran teknis: route, API, tipe data, auth, dan arsitektur.
- **Website V1 live** (`kominfohimatkn-coder/Himatknuklir_website`) **bukan acuan desain** dan tidak dipakai sebagai referensi apa pun.
- Screenshot revisi pemilik (Figma) tidak tersedia di repository. Sampai screenshot ditambahkan, Prototype di `Design/` menjadi acuan utama untuk visual dan interaksi, termasuk hero mobile.
- Urutan baca dokumen:
  1. `docs/AGENTS.md`
  2. `docs/progress.md` → Current Project State
  3. `docs/HIMATKN_V1_REDESIGN_GUIDE.md`
  4. `docs/DESIGN_REFERENCE_GUIDE.md`
  5. `Design/README.md`
  6. `docs/HIMATKN_FRONTEND_CONTEXT.md`
  7. `docs/FRONTEND_ARCHITECTURE.md`
  8. `frontend/AGENTS.md`
  9. Laporan audit terbaru di `docs/audit/` (saat ini: `docs/audit/REDESIGN_AUDIT_2026-11-12.md`)

### d. Referensi deprecated

Referensi berikut **tidak boleh dipakai** sebagai acuan desain, token, font, layout, komponen, atau state apa pun:

- `HIMATKN_Public_Design_Reference/`
- `HIMATKN_Admin_Panel_Design_Reference/`
- `HIMATKN_Public_Figma_Reference`, termasuk screenshot seperti `programs-empty-state-desktop.png` dan `programs-empty-state-mobile.png` yang dirujuk pada entri 29 Oktober 2026.
- Token dan font dari batch lama sebagai keputusan visual: palet cream/gold, Cormorant Garamond/Manrope, serta Space Grotesk/Playfair Display/Crimson Text/JetBrains Mono.

Entri historis yang masih memuat referensi tersebut tetap utuh di Historical Archive; jangan melanjutkan keputusan dari sana tanpa verifikasi.

### e. Keputusan pemilik yang berlaku

1. **Acuan visual aktif** adalah Prototype Desain HIMATKN V1 di `Design/`. Source code V2 tetap menjadi sumber kebenaran teknis (route, API, tipe, auth, arsitektur).
2. **`Design/` hanya acuan visual dan interaksi.** Konten mengikuti data dari backend. Informasi penting tidak boleh di-hardcode dari prototype: nama pengurus, jumlah divisi, periode, stats hero, kontak, email, alamat, isi program, dan isi berita. Jika backend belum menyediakan data, tampilkan empty state yang jujur atau sembunyikan elemennya, lalu catat sebagai gap.
3. Referensi deprecated: lihat bagian d di atas.
4. **Bank Soal adalah requirement klien**, dipenuhi dengan **link eksternal ke folder Google Drive** yang dibuka di tab baru. V2 tidak membangun fitur bank soal sendiri (upload, pencarian, filter semester), karena V2 bukan portal akademik. Untuk sementara URL di-hardcode di **satu konstanta frontend** (misalnya `frontend/lib/public/links.ts`), dipakai oleh navbar desktop, menu mobile, dan footer. Ini **utang teknis** sampai backend menyediakan `GET /public/settings`. Database V2 saat ini tidak menyimpan link ini: `site_settings` kosong pada dump lokal 10 November 2026. Link `bank-soal.html` yang tersisa di file `Design/` diabaikan karena halaman itu sudah dihapus dari prototype.
5. **Panel admin dipertahankan** sesuai desain dan implementasi V2 saat ini. Fokus redesign adalah website publik. Admin hanya mendapat penyesuaian teknis yang diperlukan untuk integrasi atau konsistensi.
6. **Detail program kerja dan search publikasi sudah didukung API-B2.** `GET /public/programs/{slug}` dan `GET /public/news?q=...` tersedia di branch. Frontend sudah memiliki service `getPublicProgramBySlug()` dan parameter `q` pada `getPublicNews()` sejak API-F; route/UI detail dan search belum dibuat karena menunggu keputusan route (g.5/g.6). Jangan membuat endpoint, parameter, atau data palsu.
7. **Status program wajib memetakan keempat nilai:** `planned`, `ongoing`, `completed`, `cancelled`. `cancelled` tidak boleh diabaikan. **Sejak API-B2 backend memvalidasi enum ini** pada create/update admin (`Literal`, default `planned`); nilai lain ditolak `422`. `cancelled` tetap dikirim ke endpoint publik. Status diisi manual oleh admin dan **tidak dihitung dari tanggal**.
8. **Instagram adalah utang teknis yang sama seperti Bank Soal.** Pemilik mengonfirmasi URL resmi `https://www.instagram.com/himatknuklir` pada 16 November 2026. URL untuk sementara di-hardcode di `frontend/lib/public/link.ts` (komentar menunjuk `GET /public/settings`, key `instagram_url`) dan dipakai CTA empty state Program/Publikasi. Jangan menambah tautan sosial lain tanpa data backend.
9. **Site Settings memakai registry paritas V1 (Batch API-B1, diperluas B3d).** Daftar key resmi hanya di `Backend/app/services/site_settings.py`; key di luar registry diabaikan publik dan dilaporkan sebagai `unknown_keys` di admin. Registry kini **47 key** termasuk `hero_image` (tipe `image`) dan `hero_image_alt`; `period_label`/`structure_item_*`/`contact_back_label` tidak dimasukkan. Key data default `""`; key copy default netral tanpa nama kabinet/tahun/divisi. URL wajib `https` dengan host whitelist exact; `maps_embed_url` wajib path `/maps/embed`. `hero_image` wajib storage key V2 (`images/<nama>.<jpg|jpeg|png|webp>`, menerima path media lengkap lalu menormalkannya), bukan URL. Sejak F2b frontend memiliki `PUBLIC_SETTING_KEYS` **47 key** termasuk `hero_image`/`hero_image_alt`. UI publik belum migrasi.
10. **Kontrak publik API-B2.** Program publik default hanya periode aktif; tanpa periode aktif → `items: []`, `period: null`. Filter `status` menerima 4 nilai (boleh diulang atau dipisah koma). Urutan program: `start_date` DESC (NULL di akhir), lalu `created_at` DESC, `id` DESC. Berita: `q` mencari **judul saja**, `%`/`_` di-escape, `total`, `excerpt` ±160 karakter di batas kata, dan `tags`. Organisasi: `sort_order` dikirim; `photo_url` storage key menjadi path media, `https://` dipertahankan, nilai lain `null`. Detail program memakai field DB tanpa foto.
11. **API layer frontend sudah sinkron (Batch API-F).** `ApiError` membawa `status` (0 untuk jaringan), `detail`, `errors?`, dan `retryAfter?`; service publik (`news`, `programs`, `organization`, `settings`, `visits`) serta admin settings siap dipakai R2/R3/R4 tanpa dummy data. `PUBLIC_LINKS` di `frontend/lib/public/link.ts` tetap dipakai sebagai **fallback sementara** sampai UI disambungkan ke `bank_soal_url`/`instagram_url`/`instagram_label`.
12. **Pergantian periode dikerjakan bertahap B3a–B3d (API-B3).** B3a (17 Nov): `PUT /admin/organization/periods/{id}` hanya mengubah nama/tanggal (bukan `is_active`), dan `DELETE` hanya untuk periode nonaktif yang kosong (tanpa divisi/anggota/program). Satu-periode-aktif sudah dijaga oleh create (`61ab3c3`) dan activate (`d642419`) milik pemilik. B3b (17 Nov): CRUD divisi dengan nama unik per periode (case-insensitive), `DELETE` divisi ditolak selama masih ada anggota atau program kerja, dan salin divisi antarperiode menyalin nama/deskripsi/`sort_order` tanpa anggota, melewati nama yang sudah ada, dengan satu audit `division.copy`. Akun tanpa `organization.manage` → 403.
13. **Ubah kata sandi sendiri (Batch B3c, 17 Nov).** `POST /api/v1/auth/change-password` wajib login + CSRF, tanpa permission tambahan. Kata sandi lama salah → **400** (bukan 401). Kata sandi baru 12–128 karakter dan tidak boleh sama dengan yang lama (422). Sesi yang dipakai untuk request tersebut **dipertahankan** (cookie sesi/CSRF tidak berubah); semua sesi lain milik admin yang sama dicabut dan dilaporkan sebagai `sessions_revoked`. Audit `admin.password_change` tidak menyimpan kata sandi. **Prototipe admin menulis minimal 8 karakter, backend mewajibkan 12** — frontend harus menyesuaikan validasi saat UI dibuat.
14. **Foto hero memakai storage V2 (Batch B3d, 17 Nov).** `hero_image` berisi storage key `images/<nama>.<jpg|jpeg|png|webp>`, bukan URL. Alur: unggah `POST /media/images` → simpan `storage_key` ke setting → isi `hero_image_alt`. Path media lengkap `/api/v1/media/images/...` diterima dan dinormalisasi. URL (termasuk Vercel Blob), path absolut, `..`, backslash, karakter kontrol, dan ekstensi aneh ditolak 422. Backend tidak mengecek keberadaan file. Foto hero V1 di Vercel Blob harus diunggah ulang saat go-live. `GET /public/settings` mengirim path media; `GET /admin/settings` menyertakan `preview_url` hanya untuk tipe `image`.
15. **Izin dicentang langsung per akun (Batch B4a/B4b, 18 Nov).** Role `admin` dan `editor` dihapus; `superadmin` tetap role khusus dengan semua izin. Izin `admins.view`, `admins.manage`, dan `roles.manage` tidak boleh diberikan ke akun non-superadmin. Superadmin maksimal **2 akun** (aktif + nonaktif) dan minimal **1 superadmin aktif**. Hanya superadmin yang dapat mengelola akun. Akun tidak boleh mengubah password/izin/status superadmin/status aktif dirinya lewat endpoint admin; password sendiri lewat `POST /auth/change-password`. Detail kontrak: `Backend/docs/ADMIN_API.md`.

### f. Kondisi aktual V2

Ringkasan dari audit 12 November 2026; detail dan bukti line-by-line ada di `docs/audit/REDESIGN_AUDIT_2026-11-12.md` (rujukan; jangan disalin ulang).

- Route publik produk: `/` dan `/struktur`. Fixture `/__structure-state` **sudah dihapus pada R1 Fase A** (folder berawalan `_` sebenarnya tidak pernah menjadi route Next; URL-nya 404 bahkan sebelum dihapus).
- Route admin: `/login`, `/admin/dashboard`, `/admin/news` (read-only di UI), `/admin/programs` (CRUD), `/admin/organization` (CRUD periode/divisi/anggota + foto anggota), `/admin/accounts` (khusus superadmin), `/admin/account` (semua akun yang login).
- Endpoint publik yang tersedia dan pemakaiannya:

  | Endpoint | Dipakai frontend? |
  |---|---|
  | `/public/news` | Ya di beranda (tanpa `q`). Service mendukung `q`, `total`, `excerpt`, dan `tags` sejak API-F. |
  | `/public/news/{slug}` | Service `getPublicNewsBySlug()` siap (404 → `null`); route detail belum ada. |
  | `/public/programs` | Service `getPublicPrograms()` siap (filter periode/status/divisi, `total`, `period`); section homepage masih empty state. |
  | `/public/programs/{slug}` | Service `getPublicProgramBySlug()` siap (404 → `null`); route detail program belum ada. |
  | `/public/organization` | Ya, termasuk `sort_order` dan `photo_url` yang sudah dinormalisasi backend. |
  | `/public/settings` | Service `getPublicSettings()`/`loadPublicSettings()`, `PUBLIC_SETTING_KEYS`, dan `PUBLIC_SETTINGS_FALLBACK` siap; UI belum migrasi. |
  | `POST /public/visits` | Service `recordVisit()` siap (error ditelan); belum dipasang ke halaman. |

- Admin settings API (Batch API-B1, diperluas B3d): `GET /admin/settings` (`settings.view`), `PUT`/`DELETE /admin/settings/{key}` dan `PATCH /admin/settings` (`settings.manage` + CSRF), dengan registry **47 key** dan validasi. Sejak B3d, item bertipe `image` (`hero_image`) menyertakan `preview_url` berupa path media; tipe lain tidak. Service admin (`frontend/lib/admin/settings.ts`) siap sejak API-F; **halaman admin Pengaturan belum dibuat**.
- Public content API (Batch API-B2): `GET /public/programs` (filter periode/status/divisi, `total`, metadata divisi/periode), `GET /public/programs/{slug}`, `GET /public/news` (`q` judul, `total`, `excerpt`, `tags`), `GET /public/news/{slug}` (`tags`), dan `GET /public/organization` (`sort_order`, `photo_url` ternormalisasi). Kontrak lengkap: `Backend/docs/PUBLIC_API.md`.
- **Admin organisasi (Batch B3a, 17 Nov):** `PUT /admin/organization/periods/{id}` mengubah nama/tanggal dengan nama unik case-insensitive dan validasi `end_date >= start_date`; `DELETE /admin/organization/periods/{id}` menolak periode aktif (409) dan periode yang masih punya divisi/anggota/program (409, pesan menyebut bagian yang menghalangi). Create periode juga memvalidasi urutan tanggal. UI periode ada di halaman `/admin/organization` (Batch ORG-A).
- **Admin divisi (Batch B3b, 17 Nov):** `POST`/`PUT`/`DELETE /admin/organization/divisions` (201/200/200) dengan nama unik per periode case-insensitive; `DELETE` menolak divisi yang masih punya anggota dan/atau dipakai program kerja (409). `POST /admin/organization/periods/{id}/divisions/copy` menyalin divisi antarperiode secara atomik, melewati nama yang sudah ada, tidak menyalin anggota, dan menulis satu audit `division.copy`. `GET /divisions` mengirim `sort_order` dan diurutkan `sort_order` lalu `id`. Perbaikan bug: audit `member.create`/`member.update`/`member.delete` kini memakai `ip_address`/`user_agent` (sebelumnya `request=request` yang membuat endpoint 500). UI divisi ada di halaman `/admin/organization` (Batch ORG-A).
- **Admin anggota (Batch ORG-B, 18 Nov):** UI `/admin/organization` memakai `GET /members?period_id` dan `GET /positions` untuk daftar per divisi, serta `POST`/`PUT`/`DELETE /members` untuk CRUD anggota. Foto memakai `POST /media/images` (izin `media.manage`); `storage_key` disimpan ke `photo_url`. `DELETE /members/{id}` mengembalikan `204` dan pesan `404`/`400` backend ditampilkan dari `ApiError`. Pencarian nama dan pengelompokan dilakukan di klien.
- **Admin akun & izin (Batch B4a/B4b, 18 Nov):** `GET /admin/admins` mengirim `is_superadmin`, `roles`, dan `permissions` efektif. `GET /admin/admins/permissions` mengirim katalog modul + `implies` (Agenda/Dokumen/Notifikasi `available: false`). `POST`/`PUT`/`DELETE /admin/admins` memakai izin `admins.manage` (hanya superadmin), dengan `permissions` langsung per akun (menggantikan seluruh izin bila dikirim), maksimal 2 superadmin, minimal 1 superadmin aktif, dan larangan mengubah field sensitif akun sendiri. `GET /admin/admins/roles` dihapus. Kontrak lengkap: `Backend/docs/ADMIN_API.md`. Service frontend siap sejak F2b; halaman `/admin/accounts` dan form centang izin dibuat pada **Batch ACC**.
- **Ubah kata sandi sendiri (Batch B3c, 17 Nov):** `POST /api/v1/auth/change-password` (login + CSRF) memverifikasi kata sandi lama (salah → 400), mewajibkan kata sandi baru 12–128 karakter dan berbeda dari yang lama (422), menyimpan hash baru, mencabut semua sesi lain admin tersebut, mempertahankan sesi saat ini, dan menulis audit `admin.password_change` tanpa kata sandi. Respons `{"ok": true, "sessions_revoked": n}`. Dokumentasi: `Backend/README.md` bagian API/Security. Sejak **Batch ACC**, UI `/admin/account` memakai endpoint ini dengan validasi minimal 12 karakter.
- **API layer frontend (Batch API-F, 16 Nov):**
  - `frontend/lib/api/errors.ts` berisi `ApiError` (`status`, `detail`, `errors?`, `retryAfter?`) dan helper `isApiError`, `isNotFound`, `isUnauthorized`, `isForbidden`, `isRateLimited`. `apiFetch` melempar `ApiError`; `message` lama dipertahankan dan `AbortError` tetap diteruskan.
  - Tipe publik sudah memuat `total`, `excerpt`/`tags`, `division`/`period`, `PROGRAM_STATUSES`/`ProgramStatus`, `sort_order`, serta `AdminProgram.status` tetap `string`. Detail berita backend **tidak** mengirim `excerpt`, jadi `PublicNewsDetail` hanya menambah `tags`.
  - `PUBLIC_SETTING_KEYS` saat API-F berisi 45 key dan sudah dibandingkan otomatis dengan registry backend waktu itu. **Sejak B3d backend memiliki 47 key** (`hero_image`, `hero_image_alt`); **F2b menyamakan frontend menjadi 47 key** dan urutannya sudah diverifikasi sama dengan registry. `PUBLIC_SETTINGS_FALLBACK` memakai default copy backend dan key data `""`.
  - `frontend/lib/programs/status.ts` menjadi satu sumber label ("Direncanakan", "Berjalan", "Selesai", "Dibatalkan", "Status lain"); `ProgramPrimitives` dan `ProgramFormDialog` memakainya.
  - **Catatan `AuthContext`:** F2b menambahkan `can(name)` (memakai daftar izin efektif) dan `isSuperadmin`. `readCurrentAdmin()` masih menelan semua error dan mengembalikan `null`. Sebaiknya ia membedakan 401 (`isUnauthorized` → sesi memang habis) dari error jaringan/5xx agar UI tidak salah menyimpulkan "belum login".
  - `frontend/lib/public/link.ts` tetap dipakai sebagai fallback Bank Soal/Instagram; migrasi ke `PublicSettings` belum dilakukan.
- Baseline: `npm run lint` dan `npx tsc --noEmit` lulus pada audit. `npm run build` pertama kali dijalankan pada R1 Fase A (15 Nov): **gagal** karena `frontend/app/(private)/(admin)/loading.tsx` berukuran 0 byte; setelah file itu dihapus (disetujui pemilik) build lulus 9 route. Batch R1 Fase B (16 Nov) mengulang lint, tsc, dan build: ketiganya lulus 9 route. Batch API-F (16 Nov) mengulang lint dan tsc (lulus) serta `npm run build` (lulus 9 route, `ƒ /` dan `ƒ /struktur`). Baseline backend sebelum API-B1: `compileall` lulus, `pytest -q` **71 passed**; API-B1 (commit `ac9cd8a`): **102 passed**; setelah tindak lanjut review API-B1: **112 passed**; setelah API-B2 (commit `7b249b6`): **124 passed**; setelah API-F (commit `7a948f8`): **133 passed**; setelah B3a (commit `f80ecfb`): **145 passed**; setelah B3b (commit `35188af`): **165 passed**; setelah B3c: **172 passed**; setelah B3d: **191 passed**; setelah SEC-1 (commit `af39ba3`): **213 passed**; setelah B4a (commit `8ea1771`): **219 passed**; setelah B4b: **223 passed**.

### g. Keputusan yang masih tertunda (blok batch R1 dan seterusnya)

Status per 16 November 2026 (Batch R1 Fase B):

| # | Keputusan | Status |
|---|---|---|
| 1 | Font final: Literata + Inter dari prototype, atau yang lain | **Diputuskan pemilik:** Literata + Inter untuk publik |
| 2 | Logo header: apakah `frontend/public/favicon.png` / `icon.png` (1080×1350) adalah logo resmi | **Diputuskan pemilik:** `favicon.png` adalah logo resmi, dipakai header + footer |
| 3 | Foto hero: `Design/assets/img/hero.jpg` atau `frontend/public/images/hero-group.jpg` | **Diputuskan pemilik:** `frontend/public/images/hero-group.jpg` via optimasi Next.js |
| 4 | Acuan hero mobile: screenshot Figma slide 15–18 tidak ada di repo | **Diputuskan pemilik:** ikuti prototype untuk hero mobile |
| 5 | Izin route baru: `/publikasi`, `/publikasi/[slug]`, halaman daftar program kerja | Menunggu keputusan pemilik |
| 6 | Nama route program kerja: `/program-kerja` atau `/kegiatan` | Menunggu keputusan pemilik |
| 7 | Perlakuan status `cancelled` di UI publik | **Diputuskan pemilik:** `cancelled` tetap dikirim backend; frontend memberi label "Dibatalkan" (API-B2 selesai) |
| 8 | Program dari periode mana yang ditampilkan di publik (API tanpa filter periode) | **Diputuskan pemilik:** default periode aktif; `period_id` eksplisit tetap didukung (API-B2 selesai) |
| 9 | Kontak, alamat, dan peta: nilai resmi terverifikasi atau disembunyikan | **Diputuskan pemilik:** disembunyikan dulu. **API-B1 menyediakan `GET /public/settings` + admin settings**; **API-F menyediakan service + fallback**, jadi nilai resmi bisa ditampilkan setelah UI publik disambungkan pada R2 |
| 10 | Penanganan `/__structure-state` sebelum rilis | **Diputuskan pemilik:** fixture dihapus pada R1 |
| 11 | Domain canonical: `himatknuklir.web.id` atau `himatknuklir.vercel.app` | **Diputuskan pemilik:** `himatknuklir.web.id`; host kanonis dipakai `www.himatknuklir.web.id` (sama dengan sitemap/robots) |

### h. Blocker teknis yang masih terbuka

- Konfirmasi origin frontend/backend dan format `NEXT_PUBLIC_API_URL` (harus mencakup `/api/v1`). **Belum terverifikasi.**
- Kebijakan cookie/CORS admin lintas origin belum terverifikasi di production. **Belum terverifikasi.**
- Tampilan admin setelah login belum pernah divalidasi visual. **Masih berlaku.**
- `npm` melaporkan 4 high severity vulnerability (sesi 29 Oktober). **Belum ditangani.**
- Warning Turbopack tentang lockfile di luar repository (`C:\Users\faqih`). **Tidak menggagalkan build.**
- Representasi BPH: source mendeteksi BPH lewat regex nama divisi/jabatan (`frontend/components/public/StructureDirectory.tsx`), karena API tidak punya flag BPH. **Perlu keputusan pemilik apakah ini diterima.** (Koreksi atas klaim historis: lihat bagian i.)
- `frontend/app/(private)/(admin)/loading.tsx` (0 byte, commit `8cf6f75`) dihapus di R1 karena membuat build gagal. Loading state admin perlu dibuat dengan benar di batch admin terpisah.
- **404 global memakai `.public-site`.** `frontend/app/not-found.tsx` membungkus konten dengan `.public-site`, dan tidak ada `not-found` khusus admin. Akibatnya 404 yang muncul dari URL area admin (misalnya `/admin/...` yang tidak ada) memakai tipografi, header, dan footer publik (Literata + Inter), bukan `.admin-theme`. Ini diketahui dan **belum diperbaiki**; penanganan 404 admin masuk batch admin terpisah.
- Tautan **Bank Soal** dan **Instagram** masih memakai `frontend/lib/public/link.ts` sebagai **fallback sementara**. Service `GET /public/settings` dan `PUBLIC_SETTING_KEYS` sudah siap sejak API-F, tetapi UI publik belum disambungkan (utang teknis; lihat e.4, e.8, dan e.11).
- **`is_superadmin` tidak diserialisasi pada `/auth/login` dan `/auth/me`.** `AdminOut` di `Backend/app/schemas/auth.py` belum memuat field itu, sehingga `response_model=AuthResponse` membuang nilai yang sudah dihasilkan `admin_payload()` meskipun `Backend/docs/ADMIN_API.md` menyebutnya. F2b menambahkan field ke type dan memakai fallback `roles.includes("superadmin")` di `AuthContext`; backend perlu menambahkan field ke schema agar kontrak auth konsisten. **Belum diperbaiki (Backend di luar scope F2b).**

### i. Koreksi atas catatan lama

Entri lama **tidak diubah**; koreksinya hanya dicatat di sini:

| Entri lama | Klaim | Kondisi terverifikasi (audit 12 Nov) |
|---|---|---|
| Batch 2.1 (29 Okt) | BPH dikelompokkan netral, tidak ditebak | Source mendeteksi BPH via regex (`StructureDirectory.tsx`) |
| Batch 2.1 (29 Okt) | `OrganizationSection` menampilkan divisi, anggota, dan jabatan | Hanya menampilkan periode dan jumlah anggota (`OrganizationSection.tsx`) |
| 30 Okt | Fixture validasi tidak ikut build | `/__structure-state` adalah folder berawalan `_`, sehingga **tidak pernah** menjadi route Next dan URL-nya 404; tetap dihapus pada R1 Fase A |
| Beberapa entri | Merujuk `progress.md` dan `AGENTS.md` di root | Lokasi aktual: `docs/progress.md` dan `docs/AGENTS.md` |
| Baseline 27 Okt | Next.js 16.3.2; `Button.tsx` kosong | Next.js 16.4.3; `Button.tsx` sudah terimplementasi |
| Bagian j (R0) | Judul bagian j menyebut "dump lokal 10 November 2026" | File dump di dalam repo adalah `23_tabel_himatkn.sql` (16 Sep 2026). Dump 10 Nov 2026 adalah `New_Himatkn_database.sql` dan berada **di luar repo** (`..\New folder\`). Angka pada bagian j berasal dari dump 16 Sep |
| Bagian j (R0) | "3 berita (1 published/1 draft/1 archived)" tidak dapat diverifikasi, dianggap ambiguitas | **Terverifikasi pada dump 10 Nov 2026:** 3 baris `news` dengan status 1 `published`, 1 `draft`, 1 `archived`. Ambiguitas selesai |
| Bagian j (R0) | "1 program berstatus `planned`" tidak dapat diverifikasi, dianggap ambiguitas | **Terverifikasi pada dump 10 Nov 2026:** 1 baris `programs` berstatus `planned`. Ambiguitas selesai. Dump lama 16 Sep memang tidak memuat `programs` |

### j. Temuan data (dump lokal 10 November 2026; belum diverifikasi terhadap production)

Hanya agregat; tidak ada data pribadi:

- `site_settings` kosong (tidak ada INSERT pada dump).
- Tabel `permissions` berisi 22 baris dan **tidak memuat** `media.manage`, padahal `Backend/app/seed.py` mendefinisikan 23 termasuk `media.manage`. Akibatnya `POST /media/images` berpotensi 403 untuk semua role. Perlu dicek di DB production.
- Role `admin` dan `editor` memiliki set permission yang identik.
- Ada 1 periode aktif, 9 divisi, dan 57 anggota. Semua `photo_url` bernilai NULL.
- Dump lokal memuat 1 berita berstatus `published` dengan 1 gambar galeri dan `featured_image` NULL. **Catatan ambiguitas:** ringkasan prompt Batch R0 menyebut "3 berita (1 published, 1 draft, 1 archived)", tetapi dump lokal yang ada di repo tidak menunjukkan itu; klaim tersebut tidak dapat diverifikasi dari dump lokal dan tidak dipakai sebagai fakta.
- Tidak ada INSERT `programs` pada dump. **Catatan ambiguitas:** prompt menyebut "1 program berstatus `planned`", tetapi dump lokal tidak memuat baris program. State "program terisi" tidak dapat diverifikasi dari data saat ini.
- Terdapat data uji (berita, dokumen) yang harus dibersihkan sebelum rilis. Isinya tidak dirinci di sini.

### k. Rencana batch

| Batch | Isi | Status |
|---|---|---|
| R0 | Dokumentasi | Selesai (12 Nov 2026) |
| R1 Fase A | Sistem visual publik: token prototype di-scope `.public-site`, font Literata + Inter, header sticky 72px + nav 6 item, menu mobile prototype, footer, logo resmi, konstanta link Bank Soal dipakai header/menu/footer, hapus fixture `__structure-state`, domain canonical | **Selesai 15 Nov 2026; di-commit pemilik sebagai `733a561`** |
| R1 Fase B | Hero, Tentang, section Program visual, Publikasi, Kepengurusan, Kontak disembunyikan, restyle 404, loading state | **Selesai, terverifikasi, dan di-commit pemilik sebagai `cc1d496`** |
| API-B1 | Site Settings: registry 45 key, `GET /public/settings`, admin `GET/PUT/PATCH/DELETE`, validasi URL/email/teks, audit, test | **Selesai dan di-commit pemilik sebagai `ac9cd8a`; belum di-deploy.** |
| API-B2 | Program (filter periode/status/divisi, detail slug, `total`, metadata), berita (`q`, `total`, `excerpt`, `tags`), organisasi (`sort_order`, `photo_url`), enum status admin, seed idempoten, tindak lanjut review API-B1 | **Selesai 16 Nov 2026; belum di-commit dan belum di-deploy.** |
| B4 | Izin per akun: model `admin_permissions`, hapus role `admin`/`editor`, endpoint kelola akun + katalog izin, guard superadmin, dokumentasi `ADMIN_API.md` | **Selesai 18 Nov 2026 (B4a `8ea1771`, B4b di working tree); belum di-deploy** |
| API-F2 | Service & type frontend untuk auth/akun admin/settings 47 key + kompresi upload gambar berita | **Selesai 18 Nov 2026 (F2b); di working tree, belum di-commit** |
| R2 | Halaman `/struktur`: dropdown custom yang aksesibel, visual tree/kartu/avatar, fallback foto | — |
| R3 | Data homepage: grid divisi, program dengan 4 status, perbaikan link "Instagram" | Diblok keputusan g.7–8 |
| R4 | `/publikasi` dan `/publikasi/[slug]` | Diblok keputusan g.5 |
| ORG-A | Halaman admin Struktur Organisasi: periode (buat/ubah/aktifkan/hapus), checklist, divisi (CRUD + salin), mode baca saja | **Selesai 18 Nov 2026; di working tree, belum di-commit** |
| ORG-B | Bagian anggota halaman admin Struktur Organisasi: daftar per divisi, pencarian, form anggota, unggah/ganti/hapus foto, hapus anggota, checklist jumlah anggota | **Selesai 18 Nov 2026; di working tree, belum di-commit** |
| ACC | Halaman Administrator (`/admin/accounts`, khusus superadmin) dan Akun saya (`/admin/account`): CRUD akun, checklist izin per modul + implikasi, reset password, ganti kata sandi sendiri, helper `getApiErrorMessage` | **Selesai 18 Nov 2026; di working tree, belum di-commit** |

### l. Backlog untuk sesi backend

Bukan untuk dikerjakan OpenCode frontend:

1. **Selesai (API-B1, diperluas B3d):** `GET /public/settings` + registry **47 key**. B3d menutup backlog `hero_image` dengan tipe `image` (storage V2) dan menambahkan `hero_image_alt`. Sisa pekerjaan: halaman admin Pengaturan di frontend (batch terpisah) dan pengisian nilai resmi lewat API. Sinkronisasi `PUBLIC_SETTING_KEYS` frontend ke 47 key **selesai di F2b**.
2. **Selesai (API-B2):** detail program publik per slug; filter periode/status/divisi; `total`; metadata periode/divisi. Frontend belum memakainya (R3/R4).
3. **Selesai (API-B2):** search judul dan `total` untuk `/public/news`, plus `excerpt` dan `tags`.
4. Verifikasi `media.manage` di DB production. Seed sudah idempoten dan memberi permission ini ke `superadmin`; jalankan `python -m app.seed` sekali di production lalu verifikasi (lihat `Backend/docs/PUBLIC_API.md`).
5. **Selesai (B4a/B4b):** role `admin` dan `editor` dihapus; izin kini dicentang per akun. Service frontend siap sejak F2b; halaman `/admin/accounts` dan form centang izin dari `GET /admin/admins/permissions` selesai di **Batch ACC**.
6. Pembersihan data uji sebelum rilis.
7. Migrasi frontend dari hardcode Bank Soal/Instagram ke `GET /public/settings`, lalu tampilkan kontak/peta hanya jika nilainya terisi.

---

## 2. Active Development Log

Entri sesi sejak 11 November 2026. Append-only: tambahkan entri baru di bawah; jangan mengubah entri lama.

### Sesi 2026-11-12 - Audit redesign website publik V2 (read-only)

- **Status:** Selesai; audit read-only; tidak commit, push, merge, rebase, atau deploy.
- **Branch:** `feat/admin-ui-foundation`.
- **HEAD saat audit:** `8e5afcb17aa4d2bda91a995a5d650db7f2e2d07b`.
- **Tujuan:** memetakan Prototype Desain HIMATKN V1 di `Design/` ke route, komponen, data flow, dan kontrak API V2; menulis laporan audit dan menambahkan entri sesi tanpa mengubah source.
- **Ruang lingkup:** website publik V2 dan panel admin existing. Bank soal di luar scope. Repo V1 live tidak dipakai sebagai acuan.
- **Yang dilakukan:**
  - Memeriksa branch, HEAD, `git status --short`, `git diff --stat`, dan perubahan lokal `Design/index.html`; seluruh perubahan lokal dipertahankan.
  - Membaca dokumen di `docs/`, `Design/README.md`, source frontend publik/admin, API client/service/types, kontrak backend publik, model/schema/seed, dan dump `23_tabel_himatkn.sql`.
  - Menginventarisasi route, komponen, state, aset, serta service publik yang dipakai dan belum dipakai.
  - Menjalankan baseline `npm run lint` dan `npx tsc --noEmit` dari `frontend/`.
- **Temuan utama:**
  - Hanya `/` dan `/struktur` yang merupakan halaman publik produk; `/__structure-state` adalah fixture hardcoded yang masih dapat diakses publik dan tidak diblokir `robots.ts`.
  - Visual V2 saat ini berbeda dari Prototype V1: cream/gold dan Playfair/Crimson/Space Grotesk vs mint/green dan Literata/Inter; header absolute vs sticky; hero terpusat vs kiri desktop; struktur kartu vs tree.
  - Section Program Kerja homepage masih empty state meskipun `getPublicPrograms()` tersedia; link “Instagram” mengarah ke `#publikasi`.
  - Publikasi hanya menampilkan judul/tanggal dengan “Detail segera hadir”; API list tidak menyediakan excerpt, search, atau total. Detail berita tersedia di API tetapi route belum ada.
  - `OrganizationSection` hanya menampilkan periode dan jumlah anggota; berbeda dari catatan historis `docs/progress.md` yang menyebut divisi/anggota.
  - Struktur memakai API nyata dan state yang cukup lengkap, tetapi dropdown masih native `<select>`, deteksi BPH memakai regex nama, dan visualnya berbeda dari Prototype.
  - API program tidak menyediakan detail, filter status, search, total, atau metadata periode/divisi; status program berupa string bebas dan `cancelled` hanya dipetakan di UI admin.
  - Aset logo asli tersedia di `frontend/public/favicon.png`/`icon.png` dan `Design/assets/img/favicon.png`, tetapi V2 memakai `BrandMark` abstrak dan Prototype masih memakai logo SVG tiruan.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npm run lint` — lulus tanpa error.
  - `npx tsc --noEmit` — lulus tanpa output.
  - `npm run build` — tidak dijalankan pada sesi audit ini.
  - `git diff --check` — tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada `Design/index.html` dan `docs/progress.md`.
  - `git status --short --branch` akhir menunjukkan hanya `Design/index.html` dan `Design/assets/img/favicon.png` (kondisi awal yang dipertahankan), `docs/progress.md` (entri sesi), dan `docs/audit/` (laporan baru).
- **File yang dibuat/diubah:**
  - `docs/audit/REDESIGN_AUDIT_2026-11-12.md` (baru)
  - `docs/progress.md` (entri baru; riwayat lama tidak diubah)
- **Konfirmasi batas scope:**
  - Backend/database/migration/seed berubah: Tidak.
  - API contract/auth/CSRF/CORS/RBAC/cookie policy berubah: Tidak.
  - Dependency/lockfile/environment/deployment berubah: Tidak.
  - Source frontend, `Design/`, atau file lain diubah: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak.
  - Commit/push/merge/rebase/deploy: Tidak.
- **Blocker/keputusan yang diperlukan:**
  - Konfirmasi acuan visual final, font, logo resmi, hak pakai foto hero, dan kontak/peta.
  - Keputusan apakah route publikasi/kegiatan/detail boleh dibuat; dokumentasi saat ini melarang route baru tanpa persetujuan.
  - Keputusan status/visibilitas program, termasuk `cancelled` dan filter periode.
  - Hapus atau lindungi `__structure-state` sebelum rilis.
- **Langkah berikutnya:**
  - Tinjau laporan audit dan jawab pertanyaan pemilik pada bagian 10.
  - Setelah disetujui, mulai batch R1 (sistem visual publik + chrome + homepage), lalu R2 (struktur), lalu R3 (section data homepage) dengan batas API yang tercatat.
  - Jangan implementasi sebelum keputusan acuan visual dan route diberikan.

---

### Sesi 2026-11-12 — Batch R0: Restrukturisasi dokumentasi

- **Status:** Selesai; tidak commit, push, merge, rebase, atau deploy.
- **Branch:** `feat/admin-ui-foundation`.
- **HEAD saat sesi:** `b388ae752270a03ae9a5fcbf25e44ad2b9c840fc` (`b388ae7` — "add something i thought was important").
- **Tujuan batch:** merapikan dokumentasi agar setiap sesi berikutnya membaca konteks yang benar dan terkini — acuan desain aktif, keputusan pemilik, blocker terbuka, dan rencana batch — tanpa mengubah kode, desain, backend, atau konfigurasi apa pun.
- **Yang selesai:**
  - Verifikasi kondisi repository: branch `feat/admin-ui-foundation`, HEAD `b388ae7`, working tree bersih sebelum perubahan; tidak ada perubahan lokal pada file yang diedit batch ini.
  - Menulis ulang `docs/progress.md` menjadi empat bagian: Current Project State (snapshot repo, scope, acuan aktif, referensi deprecated, keputusan pemilik, kondisi aktual V2, keputusan tertunda g.1–g.11, blocker teknis, koreksi catatan lama, temuan data dump 10 Nov, rencana batch R0–R4, backlog backend), Active Development Log (entri audit 12 Nov dipindah verbatim + entri R0), Historical Archive (blok Pemberitahuan 11 Nov, Kondisi awal paket konteks, Baseline 27 Okt, dan seluruh Catatan sesi kerja Sesi 0–30 Okt dipindah verbatim dengan penanda arsip baru), dan Template Catatan Sesi di bagian paling bawah.
  - Menjalankan verifikasi verbatim read-only (skrip di luar repository) terhadap `git show HEAD:docs/progress.md`: setiap baris non-kosong asli ditemukan di file baru; pengecualian hanya baris judul template dan baris baru pada template.
  - Memperbarui `docs/AGENTS.md` (bagian "Mulai di sini", urutan baca, aturan tidak mengandalkan auto-load, path `docs/`, aturan no-hardcode konten prototype + pengecualian link Bank Soal, izin laporan audit di `docs/audit/`).
  - Menulis ulang `docs/DESIGN_REFERENCE_GUIDE.md` sepenuhnya berdasarkan isi aktual `Design/` (halaman, token terverifikasi dari CSS, komponen/interaksi, batasan non-produksi, aturan konten backend, pemetaan ke Next.js/Tailwind v4, daftar deprecated).
  - Memperbaiki `docs/INSTALL_GUIDE.md` (path `docs/`, instruksi ekstrak `Design/`).
  - Memperbarui `docs/OPEN_CODE_FIRST_PROMPT.md` (entry point `docs/AGENTS.md`, acuan `Design/`, izin laporan audit di `docs/audit/`, audit tetap read-only).
  - Memperbarui `docs/HIMATKN_FRONTEND_CONTEXT.md` (acuan `Design/`, scope Bank Soal, inventaris endpoint/service/route aktual terverifikasi, path `docs/`).
  - Dua koreksi minimal pada `docs/HIMATKN_V1_REDESIGN_GUIDE.md` (screenshot tidak tersedia di repository; rujukan Current Project State untuk keputusan terbaru termasuk Bank Soal).
- **File yang diubah:**
  - `docs/progress.md`
  - `docs/AGENTS.md`
  - `docs/DESIGN_REFERENCE_GUIDE.md`
  - `docs/INSTALL_GUIDE.md`
  - `docs/OPEN_CODE_FIRST_PROMPT.md`
  - `docs/HIMATKN_FRONTEND_CONTEXT.md`
  - `docs/HIMATKN_V1_REDESIGN_GUIDE.md`
- **Pemeriksaan yang dijalankan + hasil:**
  - Verifikasi verbatim `docs/progress.md`: baris non-kosong asli 537; ditemukan di file baru 536; pengecualian eksplisit 1 (`## Template catatan sesi berikutnya` — judul bagian template diganti `## 4. Template Catatan Sesi` sesuai restrukturisasi). Urutan relatif di dalam setiap blok/entri yang dipindah terverifikasi sama oleh skrip (skrip read-only di direktori sementara di luar repository, membandingkan dengan `git show HEAD:docs/progress.md`).
  - `git status --short` dan `git diff --stat`: berubah hanya tujuh file dokumentasi di Bagian 1 prompt, ditambah perubahan lokal lain yang sudah ada sebelum/di luar sesi ini dan dipertahankan apa adanya: `frontend/components/public/SiteHeader.tsx` (modified) dan `frontend/lib/public/link.ts` (untracked). Perubahan frontend tersebut bukan hasil Batch R0 dan tidak disentuh.
  - `git diff --color-moved=dimmed-zebra --stat docs/progress.md`: 292 insertions, 73 deletions; selain pemindahan, perubahan hanya blok baru (Current Project State, penanda arsip, entri audit 12 Nov dipindah, entri R0, dan pembaruan template).
  - Grep referensi deprecated di `docs/`: hanya muncul di Historical Archive, daftar deprecated Current Project State, atau sebagai penanda deprecated.
  - Cek path: seluruh path yang dirujuk `docs/AGENTS.md` dan Current Project State ada di repository (Test-Path, semua ada).
  - Tidak ada nama anggota, username admin, hash password, atau data pribadi dari `*.sql` yang masuk dokumentasi; hanya agregat (9 divisi, 57 anggota, 1 periode, dll.).
  - `git diff --check`: 7 baris trailing whitespace terdeteksi, semuanya baris template kosong (`- **Branch:** `, `  - `) yang **disalin verbatim dari HEAD**. Versi HEAD juga memuat trailing whitespace yang sama pada baris tersebut; menghapusnya berarti mengubah karakter baris yang dipindah, bertentangan dengan aturan verbatim. Konflik kecil antara dua aturan prompt ini diputuskan dengan memprioritaskan verbatim; pemilik dapat membersihkan whitespace saat commit bila diinginkan.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak.
  - Database/schema/migration berubah: Tidak.
  - API contract/auth/CSRF/CORS/RBAC/cookie policy berubah: Tidak.
  - Source frontend berubah: Tidak.
  - `Design/` berubah: Tidak.
  - Dependency/lockfile/environment/deployment berubah: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak.
  - Dokumentasi/Design berubah: Ya — hanya tujuh file di `docs/` yang diizinkan prompt.
  - Commit/push/merge/rebase/reset/deploy: Tidak.
- **Ambiguitas yang dicatat:**
  - Klaim prompt "3 berita (1 published/1 draft/1 archived)" dan "1 program planned" tidak cocok dengan dump lokal `23_tabel_himatkn.sql` yang ada di repo (hanya 1 berita published dengan 1 gambar galeri; tidak ada INSERT `programs`). Dicatat sebagai ambiguitas di Current Project State bagian j, bukan sebagai fakta repo.
  - Selama sesi berjalan muncul perubahan lokal di luar scope yang bukan hasil Batch R0: `frontend/components/public/SiteHeader.tsx` (modified, +2/−1) dan `frontend/lib/public/link.ts` (untracked, konstanta link Bank Soal Google Drive). Sesuai aturan, perubahan lokal di file lain dipertahankan apa adanya dan tidak disentuh; kemungkinan berasal dari kerja pemilik atau sesi lain.
- **Langkah berikutnya:**
  - Pemilik proyek meninjau diff dokumentasi dan commit sendiri.
  - Jawab keputusan tertunda g.1–g.11 sebelum batch R1.

---

### Sesi 2026-11-15 — Batch R1 Fase A: Sistem visual publik (token, font, header, menu mobile, footer, logo, domain)

- **Status:** Selesai untuk Fase A; **berhenti menunggu persetujuan pemilik sebelum Fase B**. Tidak commit, push, merge, rebase, reset, clean, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `00bf955cb9bb35c8adcf9e480834b01e43f11b2c` (`00bf955`, ahead 2).
- **Tujuan:** menyelaraskan sistem visual publik V2 dengan Prototype Desain HIMATKN V1 (token di-scope, font, header sticky, menu mobile, footer, logo, hapus fixture, domain canonical) **tanpa menyentuh backend/admin/API**. Hero, Tentang, Program, Publikasi, Kepengurusan, Kontak, restyle 404, dan loading state sengaja ditunda ke Fase B.
- **Keputusan pemilik yang dipakai:** g.1 Literata + Inter; g.2 `frontend/public/favicon.png` sebagai logo resmi header/footer; g.3 `frontend/public/images/hero-group.jpg` via optimasi Next.js; g.4 hero mobile mengikuti prototype; g.9 kontak/alamat/peta **disembunyikan** (blocked by API, tidak di-hardcode); g.10 fixture `__structure-state` dihapus; g.11 domain canonical `himatknuklir.web.id` dengan host `www.himatknuklir.web.id`.
- **File yang diubah:**
  - `frontend/app/layout.tsx` (+21/−21): font `Literata` (600/700, normal+italic) + `Inter` menggantikan Space Grotesk + Crimson Text; Playfair Display dan JetBrains Mono dipertahankan untuk admin. `metadataBase` dan `openGraph.url` → `https://www.himatknuklir.web.id`.
  - `frontend/app/globals.css` (+53/−47; 1480 → 1487 baris): blok token prototype di `.public-site` (`--green-900/800/700`, `--mint`, `--paper`, `--ink`, `--ink-soft`, `--muted`, `--on-dark`, `--on-dark-soft`, `--line`, `--line-on-dark`, `--amber`, `--radius`, `--container: 1130px`, `--gutter: 24px/16px`, `--header-h: 72px`), utility `@theme inline` baru (mint, green-950/900/800/700, line, line-on-dark, amber), stack tipografi default → Inter/Literata, `.site-container` → max 1130px + gutter, skip-link hijau, `section[id] { scroll-margin-top: calc(var(--header-h) + 1rem) }`. `.public-nav-link` (6 rule) dihapus karena tidak lagi dipakai; `@media (max-width: 640px)` tidak lagi menimpa `.site-container`.
  - `frontend/components/public/SiteHeader.tsx` (+222/−57): header sticky `bg-paper` tinggi 72px, logo `next/image` 29×36, brand Literata uppercase, nav desktop 6 item (**Beranda, Tentang, Kegiatan, Publikasi, Bank Soal, Struktur**) dengan `aria-current`, menu mobile panel prototype (fixed, transisi, `prefers-reduced-motion`, `aria-expanded`/`aria-controls`, Escape, klik luar, focus trap, scroll lock, target sentuh 57px), Bank Soal eksternal `target="_blank"` + `rel` dari konstanta + penanda sr-only.
  - `frontend/components/public/SiteFooter.tsx` (+91/−20): footer `bg-green-950` + border `line-on-dark`, brand + logo (tile putih), nav 6 item (Bank Soal eksternal), copyright + "Kembali ke atas". Tanpa alamat, email, atau peta.
  - `frontend/app/not-found.tsx` (+3/−3): hanya menambahkan scope `className="public-site"`; dua perubahan pemilik yang belum di-commit (`tracking-tighter`, `max-w-140`) dipertahankan.
  - `frontend/app/(public)/__structure-state/page.tsx` (dihapus, 63 baris).
  - **Di luar scope R1, disetujui pemilik:** `frontend/app/(private)/(admin)/loading.tsx` (0 byte, commit `8cf6f75`) dihapus karena membuat `npm run build` gagal. Loading state admin perlu dibuat benar di batch admin terpisah (dicatat di Current Project State bagian h).
- **Keputusan teknis mandiri + alasan:**
  - Token prototype hanya di `.public-site`; `:root` dan `.admin-theme` tidak diubah sehingga admin/`/login` identik.
  - `--line-dark` V2 tidak di-override (masih rgba transparan yang dipakai komponen publik lama); ditambah token baru `--line-on-dark: #1c3d31` untuk garis permukaan gelap agar tidak mengubah tampilan lama di luar scope.
  - `--header-h: 72px` di semua breakpoint mengikuti instruksi prompt (prototype 68px di ≤640).
  - Anchor memakai `scroll-margin-top` per `section[id]`, bukan `scroll-padding-top` di `html`, agar aturan global tidak berubah.
  - Nav memakai label "Publikasi" (prototype footer menulis "Berita") agar konsisten dengan nama section; "Kegiatan" → `/#program` dan "Publikasi" → `/#publikasi` diberi komentar sementara sampai route tersedia.
  - Logo memakai atribut `width={29} height={36}`, bukan utility `h-9`, karena `img { height: auto }` unlayered mengalahkan utility Tailwind.
  - Logo footer diberi tile `bg-white` karena PNG 1080×1350 berlatar putih akan tampak sebagai kotak di atas hijau gelap.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npm run lint` — lulus tanpa error.
  - `npx tsc --noEmit` — lulus tanpa output.
  - `npm run build` — **gagal** sebelum file `(admin)/loading.tsx` dihapus ("The default export is not a React Component in /admin/dashboard/loading"); setelah dihapus **lulus 9 route** (`/`, `/_not-found`, `/admin/dashboard`, `/admin/news`, `/admin/programs`, `/login`, `/robots.txt`, `/sitemap.xml`, `/struktur`).
  - Validasi produksi (`npm start`, port 3100, build final): tanpa overflow horizontal di 390/768/1280 untuk `/`, `/struktur`, 404, `/login` (`scrollWidth === clientWidth`).
  - Header sticky: `position: sticky`, tinggi 72px, `top: 0` setelah scroll 1200px.
  - Anchor: `#beranda`, `#tentang`, `#program`, `#publikasi`, `#struktur`, `#top` semua ada; klik "Tentang" mendarat di `top: 88px` (header 72 + 16).
  - Menu mobile: Escape dan klik luar menutup panel dan mengembalikan fokus ke tombol; Tab berputar di dalam header (tombol + 6 tautan); `aria-expanded` dan `body overflow: hidden` benar; tinggi tiap tautan 57px.
  - `/admin/dashboard` tanpa sesi → redirect ke `/login`.
  - Kontras terukur: brand green-900/paper 15.06:1, nav muted/paper 5.70:1, nav aktif green-800/paper 9.63:1, muted/mint 4.90:1, footer link 7.78:1, teks putih footer 16.14:1, skip-link 9.84:1, ink/paper 16.46:1.
  - Keluarga font: sebelum 5 dimuat (Space Grotesk, Playfair Display, Crimson Text, Inter, JetBrains Mono) → sesudah **4** (Literata, Inter, Playfair Display, JetBrains Mono). Halaman publik hanya memakai **3** (Inter, Literata, JetBrains Mono).
  - `/login` sebelum vs sesudah: computed style identik (h1 Playfair 24px/600 `rgb(22,38,29)`, label Inter 14px/500, input Inter 16px latar putih, tombol Inter 16px `rgb(14,32,24)`); kontras 13.61:1 dan 14.58:1.
- **Screenshot validasi:**
  - `docs/validation/r1/before/` — 14 file baseline (390/768/1280: home, struktur, 404, login; menu-open di 390 dan 768).
  - `docs/validation/r1/phase-a/` — 14 file sesudah, set yang sama.
  - **Catatan privasi:** screenshot `/struktur` memuat nama pengurus dari API; pemilik perlu meninjau sebelum commit/publikasi.
- **Blocked by API:**
  - `GET /public/settings` belum ada → kontak, alamat, dan peta disembunyikan; tidak di-hardcode. Section kontak homepage masih menampilkan "Menunggu verifikasi" sampai Fase B.
- **Deviasi/keterbatasan yang dicatat:**
  - Homepage masih memakai class lama (`.home-hero`, `.program-empty-panel`, `.contact-section`, `.publication-*`) dan belum di-restyle; hero/struktur punya padding ekstra karena header kini sticky — diperbaiki di Fase B/R2.
  - `/struktur` belum di-restyle (R2).
  - File `New_Himatkn_database.sql` (dump 10 Nov) berada di luar repo; koreksi sumber data dicatat di Current Project State bagian i.
- **Konfirmasi batas scope:**
  - Backend/database/migration berubah: Tidak.
  - API contract/auth/CSRF/CORS/RBAC/cookie policy berubah: Tidak.
  - `apiFetch`, struktur `lib/*`, tipe API berubah: Tidak.
  - Tampilan admin/`/login` berubah: Tidak (diverifikasi via computed style).
  - Route baru/endpoint/parameter/data palsu: Tidak.
  - Dependency/lockfile/environment/deployment/konfigurasi berubah: Tidak.
  - `Design/`, `.gitignore` berubah: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak.
  - Commit/push/merge/rebase/reset/clean/deploy: Tidak.
- **Langkah berikutnya:**
  - Pemilik meninjau laporan Fase A dan screenshot, lalu memberi persetujuan untuk Fase B (hero, Tentang, Program, Publikasi, Kepengurusan, kontak disembunyikan, restyle 404, loading state).

---

### Sesi 2026-11-16 — Batch R1 Fase B: Hero, Tentang, Program, Publikasi, Kepengurusan, 404, loading publik

- **Status:** Selesai untuk Fase B; **berhenti sebelum R2**. Tidak commit, push, merge, rebase, reset, clean, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `733a561` (Fase A, sudah di-commit pemilik). Perubahan Fase B masih di working tree.
- **Tujuan:** menyelaraskan homepage, section kepengurusan, halaman 404, dan loading publik dengan Prototype V1; menyembunyikan kontak (blocked by API); menghapus CSS lama yang tidak terpakai; tanpa mengubah `/struktur`, admin, backend, API, atau dependency.
- **File yang diubah:**
  - `frontend/app/(public)/page.tsx` (+118/−117): hero `next/image` + overlay, judul Literata dengan `<em>` italic, dua tombol prototipe, stats periode/anggota dari API (disembunyikan bila tidak ada periode); Tentang mint 2 kolom dengan pillar; Program memakai `PublicStateBox`; section kontak dihapus.
  - `frontend/components/public/OrganizationSection.tsx` (+67/−58): section `bg-green-950`, label/heading prototipe, state box dark untuk error/kosong, stats periode + jumlah anggota nyata, tombol "Selengkapnya" ke `/struktur`. Grid divisi tidak dibuat (R3).
  - `frontend/components/public/PublicationsSection.tsx` (+58/−48): heading prototipe, state box error/kosong, list 180px + konten, thumbnail grayscale, tanggal + "Detail segera hadir"; tanpa mono dan tanpa excerpt/link detail.
  - `frontend/components/public/PublicButton.tsx` (baru, 70 baris): varian `solid`/`white`/`outline`/`outlineWhite`, termasuk `PublicButtonAnchor` untuk tautan eksternal.
  - `frontend/components/public/PublicStateBox.tsx` (baru, 81 baris): state box prototipe tone `light`/`dark`/`error`.
  - `frontend/components/public/PublicLabel.tsx` (baru, 29 baris): label Inter kapital pengganti `.kicker` mono di homepage.
  - `frontend/components/public/RefreshButton.tsx` (+35/−15): memakai `PublicButton` untuk homepage; prop `variant` lama dipertahankan agar `/struktur` (R2) tidak berubah.
  - `frontend/app/not-found.tsx` (+16/−18): 404 terang mengikuti prototype (kode mint + stroke, dua tombol solid/outline, tanpa kicker/ikon/mono).
  - `frontend/app/(public)/loading.tsx` (+64/−17): skeleton utility untuk hero, Tentang, Program, Publikasi, dan Kepengurusan; tanpa `.home-hero`, gold, atau mono.
  - `frontend/app/globals.css` (+4/−498; **1486 → 992 baris**): token `--green-950` publik, `--header-h: 68px` pada ≤640px, penghapusan CSS lama homepage/kontak.
  - `frontend/lib/public/link.ts` (+10): **perubahan bersamaan di working tree** menambahkan `PUBLIC_LINKS.instagram`; dipakai empty state Program/Publikasi. Pemilik perlu meninjau karena g.9 menyebut kontak disembunyikan sampai `GET /public/settings`.
- **Keputusan teknis + alasan:**
  - `--header-h` mobile 68px hanya di dalam `.public-site`; header, panel mobile, dan `scroll-margin-top` membaca var yang sama (terukur 72/68px dan 88/84px).
  - Hero stats hanya memakai data nyata (`period.name`, jumlah anggota) dan hilang bila periode tidak ada; stat prototype (Kabinet/Divisi/Lokasi) tidak di-hardcode.
  - Pillar Tentang memakai `pillar.title` sebagai label dan `pillar.description` sebagai isi; tidak mengarang heading baru.
  - Program tetap empty state jujur karena belum ada route daftar program (g.5/g.6); Publikasi tanpa excerpt/detail karena API list tidak menyediakannya.
  - Kepengurusan menampilkan stats periode + anggota, bukan grid divisi; grid divisi adalah R3 dan masih diblok g.7–g.8.
  - Kontak/alamat/peta dihapus dari homepage; tidak di-hardcode.
  - CSS lama dihapus setelah dipastikan tidak dipakai: `.home-hero*`, `.about-intro/features/feature*`, `.program-empty-panel*`, `.publication-*`, `.structure-teaser*`, `.contact-*`, `.meta*`, `.section-copy--dark`, `.public-section`, dan media query terkait. `.kicker`, `.section-title`, `.section-copy`, `.empty-panel*`, dan seluruh `.structure-*` dipertahankan untuk `/struktur` (R2).
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npm run lint` — lulus tanpa error.
  - `npx tsc --noEmit` — lulus tanpa output.
  - `npm run build` — lulus 9 route (`/`, `/_not-found`, `/admin/dashboard`, `/admin/news`, `/admin/programs`, `/login`, `/robots.txt`, `/sitemap.xml`, `/struktur`).
  - Validasi produksi `npx next start -p 3100`: tidak ada overflow horizontal di 390/768/1280 untuk `/` dan 404 (`scrollWidth === clientWidth`, `offenders: []`).
  - Header: 72px desktop / 68px mobile; `scroll-margin-top` section 88px/84px; klik nav "Tentang" mendarat di `top: 88px`.
  - Font homepage dan 404 hanya **Inter + Literata** (computed families); tidak ada JetBrains Mono di homepage, 404, atau loading publik. Mono di `/struktur` dibiarkan untuk R2.
  - Kontras terukur: judul hero putih/latar dasar 11.40:1; label Tentang 6.80:1; judul section 14.14–16.46:1; body Tentang 4.90:1; body Program/Publikasi 5.70:1; salinan Kepengurusan 7.78:1; tombol hero putih/hijau 15.38:1. Body Tentang 4.90:1 lulus ambang AA teks normal (4.5:1).
  - `globals.css`: 1486 → 992 baris (−494; `git diff --numstat` 4/498). `rg`/Select-String untuk seluruh selector yang dihapus menghasilkan **0 match** di `globals.css` maupun TSX.
  - Audit font admin di luar `.admin-theme`: `(private)/layout.tsx` hanya `AuthProvider`; layout admin, loading state, `AdminShell`, dan `/login` semuanya memakai `.admin-theme`. Tidak ada `error.tsx`/`global-error.tsx` admin, sehingga error boundary default Next.js akan memakai font root (Inter), bukan Playfair. **Dilaporkan, tidak diperbaiki.**
  - `/admin/dashboard` tanpa sesi tetap redirect ke `/login`; tidak ada perubahan auth.
- **Screenshot validasi:**
  - `docs/validation/r1/phase-b/` — 14 file (390/768/1280: home, struktur, 404, login; menu-open di 390 dan 768).
  - **Catatan privasi:** screenshot `/struktur` memuat nama pengurus dari API; pemilik perlu meninjau sebelum commit/publikasi.
- **Blocked by API:**
  - `GET /public/settings` belum ada → kontak, alamat, peta, dan tautan resmi disembunyikan.
  - Route `/kegiatan`/`/publikasi` belum ada (g.5/g.6) → tombol "Lihat semua" tidak dibuat; empty state memakai tautan Instagram yang tersedia.
  - `/public/programs` belum dipakai untuk daftar program (g.7–g.8) → Program tetap empty state jujur.
- **Deviasi/keterbatasan yang dicatat:**
  - Hero hanya menampilkan 2 stats nyata (periode, anggota), bukan 3 stats prototype.
  - Kepengurusan menampilkan stats, bukan grid divisi (R3).
  - Publikasi hanya tanggal + "Detail segera hadir"; tidak ada excerpt atau link detail.
  - Tautan Instagram di `lib/public/link.ts` dan aksi empty state "Buka Instagram" muncul di working tree selama sesi (perubahan bersamaan); ini perlu keputusan pemilik karena beririsan dengan g.9.
- **Konfirmasi batas scope:**
  - Backend/database/migration berubah: Tidak.
  - API contract/auth/CSRF/CORS/RBAC/cookie policy berubah: Tidak.
  - `apiFetch`, struktur `lib/*`, tipe API berubah: Tidak (hanya `lib/public/link.ts` menambah konstanta tautan).
  - Tampilan admin/`/login` berubah: Tidak.
  - Route baru/endpoint/parameter/data palsu: Tidak.
  - Dependency/lockfile/environment/deployment/konfigurasi berubah: Tidak.
  - `Design/`, `.gitignore` berubah: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak.
  - Commit/push/merge/rebase/reset/clean/deploy: Tidak.
- **Langkah berikutnya:**
  - Pemilik meninjau laporan Fase B, screenshot, dan tautan Instagram; setelah disetujui, lanjut R2 (`/struktur`). **Jangan mulai R2 sebelum persetujuan.**

---

### Sesi 2026-11-16 — Batch R1 Fase B: verifikasi produksi dan pencatatan

- **Status:** Verifikasi selesai; implementasi Fase B tidak diubah (selain normalisasi URL Instagram yang dikonfirmasi pemilik). **Berhenti sebelum R2.** Tidak commit, push, merge, rebase, reset, clean, atau deploy.
- **Branch:** `feat/admin-ui-foundation`; HEAD `733a561`. Seluruh perubahan Fase B masih di working tree.
- **Tujuan:** menjalankan pemeriksaan Bagian 5.8/4.8, mengambil bukti screenshot, dan mencatat hasil di `docs/progress.md`.
- **Keputusan pemilik (koreksi atas entri Fase B di atas):**
  - URL Instagram resmi: `https://www.instagram.com/himatknuklir` (pemilik mengirim versi dengan parameter share `rpxt`; parameter dibuang agar tautan stabil). Konstanta dipertahankan, bukan dihapus.
  - Komentar di `frontend/lib/public/link.ts` menunjuk `GET /public/settings` (key: `instagram_url`) dan dicatat sebagai utang teknis bersama Bank Soal (Current Project State e.8).
  - Entri Fase B di atas menyebut tautan Instagram "perlu ditinjau pemilik"; status itu **selesai** dengan keputusan ini.
- **Yang dilakukan:**
  - Menjalankan `npm run lint`, `npx tsc --noEmit`, dan `npm run build` dari `frontend/` dengan `.env.local` asli.
  - Menjalankan build produksi lokal (`next start -p 3100`) dan memverifikasi lewat Chrome headless via CDP (Playwright/Puppeteer tidak terpasang). Skrip verifikasi berada di luar repo (`%TEMP%`).
  - Mengambil ulang seluruh screenshot utama pada build final, plus screenshot state publikasi memakai mock API sementara (`127.0.0.1:3999`) dan build sementara; setelah itu `.next` dibangun ulang dengan `.env.local` asli dan screenshot utama diambil ulang.
  - Mencari data hardcoded prototype dengan `git grep` (`rg` tidak tersedia): `Kabinet Nexus`, `7 Divisi`, `Babarsari`, `Student Center`, `Nexus 2026`, alamat, dan `Yogyakarta`.
  - Membandingkan `/login` Fase B dengan screenshot Fase A secara piksel dan computed style.
  - Menghitung delta `globals.css` terhadap `733a561` dan memastikan setiap selector yang dihapus tidak lagi dipakai TSX.
- **Hasil pemeriksaan aktual:**
  - `npm run lint` — **PASS** (tanpa output error).
  - `npx tsc --noEmit` — **PASS** (tanpa output).
  - `npm run build` — **PASS**, 9 route (`/`, `/_not-found`, `/admin/dashboard`, `/admin/news`, `/admin/programs`, `/login`, `/robots.txt`, `/sitemap.xml`, `/struktur`). Satu-satunya warning: lockfile `pnpm-lock.yaml` di luar repo (`C:\Users\faqih`), tidak menggagalkan build.
  - **Screenshot:** `docs/validation/r1/phase-b/` berisi 23 file — 390/768/1280 untuk home, struktur, 404, login; menu-open 390/768; publikasi happy/empty/error di 390/768/1280. Konvensi mengikuti Fase A: 390 CSS px pada DPR 2 (gambar 780 px), 768 dan 1280 pada DPR 1. Folder `docs/validation/` di-ignore Git, jadi bukti ini lokal dan tidak muncul di `git status`.
  - **Anchor:** `#beranda`, `#tentang`, `#program`, `#publikasi`, `#struktur` ada di semua lebar. `scroll-margin-top` 84px di 390 dan 88px di 768/1280; `scrollIntoView` mendarat tepat di `top: 84/88` (tidak tertutup header).
  - **Header:** 68px di 390, 72px di 768/1280, `position: sticky`; panel menu mobile mulai tepat di 68/72px; tinggi link menu mobile ±57px; menu bisa dibuka (`aria-expanded="true"`, panel visible).
  - **Overflow horizontal:** 0 di home, 404, login, dan struktur pada 390/768/1280 (`scrollWidth === clientWidth`).
  - **Console/network:** tidak ada error di home dan `/struktur` publik. `/404` sengaja mencatat HTTP 404 (perilaku wajar). `/login` mencatat kegagalan CORS `auth/me` ke `http://localhost:8000` karena origin `localhost:3100` tidak diizinkan backend lokal — kondisi environment, bukan regresi Fase B.
  - **Kontras terukur (rasio):** brand/paper 15.06; nav-muted/paper 5.70; nav-active/paper 9.63; muted/mint 4.90; ink/paper 16.46; footer link/dark 7.78; teks 404 muted/mint 4.90. Semua pasangan lulus AA untuk peran teksnya.
  - **`/login` identik:** computed style tidak berubah — h1 Playfair 24px/600 `rgb(22, 38, 29)`, label Inter 14px/500, input Inter 16px latar putih, tombol Inter 16px. Selisih piksel vs Fase A: rata-rata delta RGB 0.354 (390) dan 0.205 (1280), setara noise JPEG. Tidak ada perubahan admin.
  - **Data hardcoded prototype:** 0 match selain referensi Instagram yang dikonfirmasi pemilik. Stats, periode, jumlah anggota, dan publikasi berasal dari API; kontak/alamat tetap disembunyikan.
  - **Publikasi:** happy (API asli, 1 berita) menampilkan tanggal + "Detail segera hadir"; empty menampilkan "Belum ada publikasi" + CTA Instagram; error menampilkan state `role="alert"` + tombol "Coba lagi". Ketiganya benar di 390/768/1280 dan tanpa overflow.
  - **`globals.css`:** 1486 → **992 baris** (net −494; `git diff --numstat` +4/−498). **77 blok aturan dihapus**, **53 nama selector unik** (termasuk satu `@media (max-width: 900px)`), **0 selector baru**. Yang dihapus: `.home-hero*`, `.about-intro`, `.about-features`, `.about-feature*`, `.program-section*`, `.program-empty-panel*`, `.publication-*`, `.structure-teaser*`, `.contact-*`, `.meta*`, `.public-section`, `.section-title`, `.section-copy`, `.section-copy--dark`, dan media query terkait. Yang ditambahkan hanya token `--green-950`, komentar, dan `--header-h: 68px` di dalam `.public-site`. `.kicker*`, `.empty-panel*`, dan seluruh `.structure-*` dipertahankan untuk R2.
  - **Koreksi kecil atas entri Fase B di atas:** entri itu menyebut `.section-title` dan `.section-copy` dipertahankan; pada keadaan final keduanya **dihapus** karena `git grep` menunjukkan 0 pemakaian di TSX. `.kicker` dan `.empty-panel*` tetap ada.
- **File yang berubah pada sesi verifikasi:**
  - `frontend/lib/public/link.ts` — komentar utang teknis Instagram + URL dinormalisasi (tanpa `rpxt`).
  - `docs/progress.md` — Current Project State (snapshot, keputusan e.8, blocker h, status batch) dan entri ini.
  - `frontend/AGENTS.md` — blok aturan Next.js ditulis ulang otomatis oleh `next dev`; bukan perubahan Fase B dan aman diabaikan/di-commit terpisah.
- **Konfirmasi batas scope:**
  - Backend/database/migration/seed berubah: Tidak.
  - API contract/auth/CSRF/CORS/RBAC/cookie policy berubah: Tidak.
  - Dependency/lockfile/environment/deployment berubah: Tidak.
  - Tampilan admin/`/login` berubah: Tidak.
  - Route baru/endpoint/parameter/data palsu: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak (hanya nama variabel yang diverifikasi).
  - Commit/push/merge/rebase/reset/clean/deploy: Tidak.
- **Blocker/utang teknis yang tetap terbuka:**
  - `GET /public/settings` belum ada → Bank Soal dan Instagram tetap hardcoded; kontak/alamat/peta disembunyikan.
  - 404 global memakai `.public-site`, sehingga 404 dari area admin bertipografi publik (dicatat di Current Project State bagian h; perbaikan di batch admin).
- **Langkah berikutnya:**
  - Pemilik meninjau laporan dan screenshot Fase B, lalu menyetujui commit. **R2 belum dimulai.**

---

### Sesi 2026-11-16 — Batch API-B1: Site Settings API

- **Status:** Selesai untuk API-B1; **berhenti sebelum API-B2**. Tidak commit, push, merge, rebase, reset, clean, deploy, atau menyentuh database production/TiDB.
- **Branch:** `feat/admin-ui-foundation`; HEAD `cc1d496` (R1 Fase B, sudah di-commit pemilik). Perubahan API-B1 belum di-commit.
- **Izin scope:** pemilik memberi pengecualian eksplisit untuk `Backend/app/{routers,schemas,services}`, `Backend/tests/`, `Backend/docs/`, `Backend/README.md`, `Backend/routes.txt`, dan `docs/progress.md`. Model ORM, schema/Alembic, auth/CSRF/CORS/cookie/middleware/rate-limit core, storage, environment, production, `frontend/`, dan `Design/` **tidak diubah**.
- **Tujuan:** mengganti `PUT /admin/settings/{key}` yang menerima key/nilai apa saja dengan registry resmi, endpoint publik, validasi, PATCH atomik, DELETE untuk membersihkan key sampah, audit, dan test.
- **Yang dilakukan:**
  - Menambahkan `Backend/app/services/site_settings.py` sebagai satu-satunya registry: **45 key** dalam grup brand (4), links (3), contact data (4), hero (6), about (12), program (3), news (4), structure (5), dan contact copy (4). Semua key `public: true`.
  - Default key data `""`; default copy netral tanpa nama kabinet/tahun/divisi. `hero_image` tidak dimasukkan (backlog), begitu pula `period_label`, `structure_item_*`, dan `contact_back_label`.
  - Menulis ulang `Backend/app/routers/settings.py`: `GET` mengembalikan metadata + `unknown_keys`; `PUT` diperketat; `PATCH` atomik; `DELETE` menghapus baris registry (kembali ke default) maupun baris sampah. Semua jalur tulis memakai CSRF + permission dan mencatat `log_activity` tanpa nilai.
  - Menambahkan `GET /api/v1/public/settings` di `Backend/app/routers/public.py`: hanya key `public`, nilai DB menimpa default, key asing diabaikan.
  - Menambahkan `SettingsPatchIn` di `Backend/app/schemas/content.py`.
  - Menambahkan `Backend/tests/test_settings.py` (31 test case) dan membuat `Backend/tests/conftest.py` tidak bergantung pada `COOKIE_SAMESITE` dari `.env` lokal (menambah `COOKIE_SAMESITE=lax`).
  - Menambahkan `Backend/docs/SITE_SETTINGS.md`, memperbarui `Backend/README.md`, dan meregenerasi `Backend/routes.txt`.
- **Keputusan teknis:**
  - **`value_type` klien diabaikan.** Tipe selalu diambil dari registry dan disimpan ke `SiteSetting.value_type`. `SettingIn` tetap menerima field itu agar kompatibel dengan pemanggil lama.
  - **Cache publik:** `Cache-Control: public, max-age=60`. Middleware keamanan default memberi `no-store` untuk semua `/api/v1/`; header eksplisit ini menimpanya karena isi settings bersifat publik dan tidak sensitif. Tidak ada pola cache lain di `docs/VERCEL.md` yang bertentangan.
  - **Rate limit:** `app/core/rate_limit.py` di luar scope, sehingga endpoint publik memakai konfigurasi baca yang sudah ada (`GENERAL_READ_LIMIT`/`GENERAL_READ_WINDOW_SECONDS`) dengan bucket `read:public-settings:<ip>`, bukan kelas limit baru.
  - **Validasi URL:** wajib `https`, tanpa userinfo, tanpa port khusus (default/443), host cocok **exact** dengan whitelist; `maps_embed_url` wajib host `www.google.com` dan path diawali `/maps/embed` (short link `maps.app.goo.gl` ditolak). Backslash, spasi, karakter kontrol, dan newline di luar `multiline` ditolak.
  - **Email:** regex sederhana, maks. 254, `""` diperbolehkan. **Teks tidak disanitasi HTML**; frontend wajib merender sebagai teks (didokumentasikan).
  - **Key asing:** `PUT` → 404 `Setting tidak dikenal` tanpa memantulkan key; `PATCH` → 422 per key; `GET` admin → daftar `unknown_keys`; `DELETE` → boleh menghapus baris sampah.
  - **DELETE key registry tanpa baris:** 200 no-op tanpa audit (nilai memang sudah default); 404 hanya jika key tidak ada di registry **dan** tidak ada di DB.
  - **`PATCH` atomik:** semua nilai divalidasi lebih dulu; jika ada error, tidak ada yang ditulis dan satu entri audit tidak dibuat.
- **Contoh respons aktual (SQLite sementara, nilai contoh):**
  - `GET /public/settings` → `200`, header `Cache-Control: public, max-age=60`, 45 key. Contoh: `{"settings":{"brand_name":"HIMA TEKNOKIMIA NUKLIR","brand_subtitle":"POLITEKNIK TEKNOLOGI NUKLIR","program_title":"Program Kerja","bank_soal_url":""}}`.
  - `GET /admin/settings` → `200`, 45 item + `unknown_keys`. Contoh item: `{"key":"brand_name","group":"brand","type":"text","label":"Nama brand","value":"HIMA TEKNOKIMIA NUKLIR","default":"HIMA TEKNOKIMIA NUKLIR","max_length":300,"allowed_hosts":[],"updated_by":null,"updated_at":null}`.
  - `PUT /admin/settings/brand_name` → `200` `{"key":"brand_name","value":"Contoh Brand","type":"text","updated_by":1}`.
  - `PATCH /admin/settings` → `200` `{"updated":["news_title","hero_primary_label"],"settings":{"news_title":"Kabar Contoh","hero_primary_label":"Lihat Program"}}`.
  - `PATCH` invalid → `422` `{"detail":"Validasi gagal","errors":{"contact_email":"Format email tidak valid."}}`.
  - `DELETE /admin/settings/junk_key` → `200` `{"deleted":"junk_key","value":null}`; `DELETE /admin/settings/brand_name` → `200` `{"deleted":"brand_name","value":"HIMA TEKNOKIMIA NUKLIR"}`.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - Baseline sebelum perubahan: `python -m compileall app` lulus; `pytest -q` **71 passed** (perlu `COOKIE_SAMESITE=lax` karena `.env` lokal memakai SameSite=None; setelah conftest diperbaiki, suite berjalan tanpa env tambahan).
  - Setelah perubahan: `compileall` lulus; `pytest -q` **102 passed, 15 warnings** (0 gagal).
  - `python -m alembic check` → `No new upgrade operations detected` (tidak ada drift skema).
  - `python scripts/list_routes.py` hanya mencetak 5 route karena FastAPI 0.141 memakai `_IncludedRouter` lazy; script lama tidak menelusuri router bersarang. `routes.txt` diregenerasi dengan penelusuran `effective_route_contexts()` yang setara: **62 baris**, termasuk `GET/PUT/PATCH/DELETE /api/v1/admin/settings...` dan `GET /api/v1/public/settings`. `scripts/list_routes.py` **tidak diubah** karena di luar scope; perlu diperbaiki di batch lain.
- **File yang diubah/dibuat:**
  - Baru: `Backend/app/services/site_settings.py`, `Backend/tests/test_settings.py`, `Backend/docs/SITE_SETTINGS.md`.
  - Diubah: `Backend/app/routers/settings.py`, `Backend/app/routers/public.py`, `Backend/app/schemas/content.py`, `Backend/tests/conftest.py`, `Backend/README.md`, `Backend/routes.txt`, `docs/progress.md`.
- **Konfirmasi batas scope:**
  - Model ORM/schema/Alembic/migrasi berubah: Tidak.
  - Auth/sesi/JWT/CSRF/CORS/cookie/middleware/rate-limit core/storage berubah: Tidak.
  - Database production/TiDB/seed/env/deploy: Tidak.
  - `frontend/`, `Design/`, `.gitignore`, konfigurasi: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak.
  - Commit/push/merge/rebase/reset/clean: Tidak.
- **Utang teknis/backlog:**
  - Frontend masih memakai hardcode Bank Soal/Instagram dan belum memakai `GET /public/settings` (batch API-F); kontak/peta belum ditampilkan.
  - `hero_image` belum masuk registry karena V2 memakai storage sendiri.
  - Admin settings UI belum ada.
  - `scripts/list_routes.py` belum menangani router lazy FastAPI 0.141.
- **Langkah berikutnya:**
  - Pemilik meninjau API-B1. **API-B2 belum dimulai.**

---

### Sesi 2026-11-16 — Batch API-B2: Program, Berita, Organisasi (+ tindak lanjut review API-B1)

- **Status:** Selesai untuk API-B2 + tindak lanjut review API-B1; **berhenti**. Tidak commit, push, merge, rebase, reset, clean, deploy, atau menjalankan seed ke DB non-test.
- **Branch:** `feat/admin-ui-foundation`. HEAD `ac9cd8a` (API-B1, sudah di-commit pemilik). Perubahan sesi ini belum di-commit.
- **Izin scope:** sama dengan API-B1 — `Backend/app/{routers,schemas,services}`, `Backend/tests/`, `Backend/docs/`, `Backend/README.md`, `Backend/routes.txt`, `docs/progress.md`. Tanpa migrasi skema; model ORM, auth/CSRF/CORS, rate-limit core, storage, environment, production, dan `frontend/` tidak diubah.
- **Tujuan:** melengkapi kontrak publik program/berita/organisasi, memvalidasi enum status program di admin, memastikan seed permission idempoten, dan menerapkan dua koreksi review API-B1.
- **Tindak lanjut review API-B1:**
  - Default hero disesuaikan prototipe: `hero_eyebrow = "HIMATKN"`, `hero_title = "Himpunan Mahasiswa"`, `hero_emphasis = "Teknokimia Nuklir"`. Default lain tidak berubah.
  - `maps_url`: host `www.google.com`, `google.com`, dan `maps.google.com` wajib berpath `/maps...`; `maps.app.goo.gl` tetap bebas path. Implementasi memakai `host_path_prefixes` per host pada registry, bukan logika khusus di router.
  - Test baru: `https://www.google.com/url?q=...` ditolak, `https://www.google.com/maps/place/...` diterima, `https://maps.app.goo.gl/xxxx` diterima (dan 2 varian host lain).
  - `Backend/docs/SITE_SETTINGS.md` diperbarui untuk hero + `maps_url`.
- **Yang dilakukan API-B2:**
  - `GET /public/programs`: query `period_id` (default periode aktif), `status` (berulang atau koma; hanya 4 nilai), `division_id`; item mendapat `division` dan `period`; respons mendapat `total` dan `period`; urutan `start_date` DESC (NULL di akhir), `created_at` DESC, `id` DESC. Join `periods`/`divisions` menghindari N+1.
  - `GET /public/programs/{slug}`: field sama dengan list, boleh dari periode mana pun, 404 `Program kerja tidak ditemukan`.
  - `GET /public/news`: `q` (2–100 karakter, judul saja, case-insensitive, `%`/`_` di-escape), `total`, `excerpt` (±160 karakter, tag HTML dibuang, berhenti di batas kata, diakhiri `…`), dan `tags` per item (satu query batch).
  - `GET /public/news/{slug}`: ditambah `tags`.
  - `GET /public/organization`: `sort_order` pada `divisions[]` dan `positions[]`; `photo_url` dinormalisasi lewat `_public_photo_url` yang memakai `_image_url` bersama (storage key → path media, `https://` dibiarkan, nilai lain `null`).
  - `ProgramIn.status` menjadi `Literal["planned","ongoing","completed","cancelled"]` dengan default `planned`; konstanta `PROGRAM_STATUSES` dipakai endpoint publik.
  - Seed: **tidak ada perubahan kode** — `seed()` sudah idempoten per baris (role, permission, role_permission) dan `media.manage` sudah ada di `PERMS`. Ditambahkan test idempoten pada DB SQLite terpisah.
- **Pemeriksaan data status program (read-only):** script lokal menolak berjalan karena `DATABASE_URL` yang dikonfigurasi bukan SQLite/localhost, sehingga tidak ada query ke DB mana pun. Tidak ada dump di repo yang memuat baris `programs`, jadi nilai status di luar 4 nilai resmi **belum dapat diverifikasi** dari repo ini. Tidak ada data yang diubah.
- **Keputusan teknis:**
  - `period_id` eksplisit yang tidak ditemukan menghasilkan `200` dengan list kosong dan `period: null` (bukan 404), konsisten dengan kasus tanpa periode aktif dan menghindari membocorkan keberadaan ID. Didokumentasikan.
  - Validasi `status` dijalankan **sebelum** resolusi periode, sehingga nilai invalid selalu `422` bahkan saat tidak ada periode aktif.
  - Pencarian memakai `ILIKE ... ESCAPE '\'` dengan escape backslash, `%`, dan `_`.
  - Excerpt menghapus tag dengan regex, meng-unescape entity HTML, merapikan whitespace, lalu memotong di spasi terakhir sebelum 160 karakter.
  - Tag diambil lewat join `news_tags`/`tags` per halaman (bukan relationship baru) agar model ORM tidak berubah.
  - `photo_url` `http://` dan path asing menjadi `null` sesuai keputusan pemilik; tidak ada upgrade otomatis ke `https`.
  - Detail program tidak menambah foto karena storage/program image belum ada di skema.
- **Contoh respons aktual (SQLite sementara, nilai contoh):**
  - `GET /public/programs` → `200` `{"items":[{...,"division":{"id":1,"name":"Divisi Humas"},"period":{"id":1,"name":"2026/2027"}},...],"total":2,"offset":0,"limit":20,"period":{"id":1,"name":"2026/2027"}}`; program tanpa tanggal mulai muncul terakhir.
  - `GET /public/programs/sosialisasi-keselamatan-radiasi` → `200` field sama; slug tidak ada → `404 {"detail":"Program kerja tidak ditemukan"}`.
  - `GET /public/programs?status=done` → `422 {"detail":"Status program tidak valid"}`.
  - `GET /public/news` → `200` item memuat `tags:[{"id":1,"name":"Kaderisasi","slug":"kaderisasi"}]`, `excerpt` ±160 karakter berakhir `…`, `total`, dan tanpa `content`; detail memuat `content` + `tags` tanpa `excerpt`.
  - `GET /public/news?q=anggota` → `total` sesuai judul yang cocok.
  - `GET /public/organization` → `200` `divisions[].sort_order`, `positions[].sort_order`, dan `members[].photo_url = "/api/v1/media/images/2026/anggota.webp"`.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - Sebelum perubahan sesi ini: `compileall` lulus; `pytest -q` **102 passed** (kondisi commit API-B1 `ac9cd8a`).
  - Setelah tindak lanjut review API-B1: **112 passed**.
  - Setelah API-B2: `compileall` lulus; `pytest -q` **124 passed, 21 warnings** (0 gagal).
  - `python -m alembic check` → `No new upgrade operations detected`.
  - `routes.txt` diregenerasi (penelusuran router lazy, tanpa BOM): **63 baris**, termasuk `GET /api/v1/public/programs/{slug}`.
  - `git diff --check` lulus (hanya warning LF→CRLF bawaan Git di Windows).
- **File yang dibuat/diubah:**
  - Baru: `Backend/tests/test_public_content.py`, `Backend/docs/PUBLIC_API.md`.
  - Diubah: `Backend/app/routers/public.py`, `Backend/app/schemas/content.py`, `Backend/app/services/site_settings.py`, `Backend/tests/test_settings.py`, `Backend/docs/SITE_SETTINGS.md`, `Backend/README.md`, `Backend/routes.txt`, `docs/progress.md`.
  - `Backend/app/seed.py` **tidak berubah** (sudah idempoten).
- **Konfirmasi batas scope:**
  - Model ORM/schema/Alembic/migrasi berubah: Tidak.
  - Auth/sesi/JWT/CSRF/CORS/cookie/middleware/rate-limit core/storage berubah: Tidak.
  - Database production/TiDB/seed/env/deploy: Tidak (tidak ada query ke DB non-lokal; seed hanya dijalankan pada engine SQLite sementara di test).
  - `frontend/`, `Design/`, `.gitignore`, konfigurasi: Tidak.
  - Isi `.env*` dibaca/dicetak: Tidak (hanya `settings.database_url` dipakai untuk menolak koneksi non-lokal tanpa mencetaknya).
  - Commit/push/merge/rebase/reset/clean: Tidak.
- **Perintah production untuk pemilik (belum dijalankan):**
  - `python -m app.seed` sekali di environment production agar permission yang belum ada (termasuk `media.manage`) dibuat dan diberikan ke `superadmin`.
  - Verifikasi: `SELECT name FROM permissions WHERE name='media.manage';` lalu cek `role_permissions` untuk role `superadmin`.
  - Tidak ada migrasi skema untuk batch ini.
- **Utang teknis/backlog:**
  - Frontend belum memakai kontrak baru (`/public/programs` filter/detail, `q`/`excerpt`/`tags` berita, `sort_order`/`photo_url` organisasi); menunggu batch API-F/R3/R4.
  - `hero_image` tetap backlog.
  - Admin settings UI dan halaman detail program/publikasi belum ada.
  - `scripts/list_routes.py` masih belum menangani router lazy FastAPI 0.141.
- **Langkah berikutnya:**
  - Pemilik meninjau API-B2 dan tindak lanjut review. **Berhenti; batch berikutnya belum dimulai.**

---

### Sesi 2026-11-16 — Batch API-F: Frontend API Layer

- **Status:** Selesai untuk API-F; **berhenti sebelum R2**. Tidak commit, push, merge, rebase, reset, clean, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `7b249b6` (API-B2, sudah di-commit pemilik). Perubahan API-F belum di-commit.
- **Izin scope:** `frontend/lib/**`, `frontend/types/**`, penyesuaian teknis `frontend/components/admin/programs/{ProgramFormDialog,ProgramPrimitives}.tsx`, dan `docs/progress.md`. Tampilan publik, `AuthContext`, dependency, konfigurasi, `.env*`, backend, database, dan deployment tidak diubah.
- **Tujuan:** menyinkronkan API layer frontend dengan kontrak API-B1/API-B2 agar R2/R3/R4 dan UI Pengaturan dapat memakai service nyata tanpa dummy data.
- **Perubahan lokal pemilik yang tidak disentuh:** `frontend/AGENTS.md`, `frontend/app/(public)/page.tsx`, `frontend/app/not-found.tsx`, `frontend/components/public/PublicLabel.tsx`. Keempatnya tetap ada di working tree dan bukan bagian API-F.
- **`ApiError` dan `apiFetch` (`frontend/lib/api/errors.ts`, `frontend/lib/api/client.ts`):**
  - `ApiError` membawa `status` (0 bila request gagal sebelum ada respons/jaringan), `detail`, `errors?` (map per-field untuk 422 `PATCH /admin/settings`), dan `retryAfter?` (dari header `Retry-After` pada 429).
  - Helper: `isApiError`, `isNotFound`, `isUnauthorized`, `isForbidden`, `isRateLimited`.
  - `message` tetap sama dengan teks error sebelumnya agar pemanggil lama tidak berubah; `AbortError` diteruskan apa adanya; logika retry CSRF tidak diubah (403 yang mengandung kata `csrf` → refresh token → ulang sekali).
  - `detail` berupa array (validasi FastAPI) diringkas aman menjadi satu pesan (`Data yang dikirim tidak valid: …`), bukan di-`String()` mentah.
  - Satu-satunya `throw new Error(` yang tersisa di `client.ts` adalah kegagalan konfigurasi `NEXT_PUBLIC_API_URL` (bukan error respons HTTP); semua kegagalan HTTP/jaringan kini `ApiError`.
  - **Catatan untuk batch berikutnya:** `AuthContext.readCurrentAdmin()` masih menelan semua error dan mengembalikan `null`. Sebaiknya batch R2 membedakan 401 (`isUnauthorized` → sesi memang habis) dari error jaringan/5xx. `AuthContext` **tidak diubah** pada batch ini.
- **Tipe (`frontend/types/**`):**
  - `news.ts`: `PublicNewsBase`/`PublicNewsItem` dengan `excerpt` + `tags`, `PublicNewsDetail` menambah `content` + `tags` **tanpa** `excerpt` (backend detail memakai `include_excerpt=False`), `PublicNewsListResponse` dengan `total`.
  - `programs.ts`: `PROGRAM_STATUSES` + `ProgramStatus`, `PublicProgram` dengan `division`/`period`, `PublicProgramListResponse` dengan `total` dan `period: {id,name} | null`, `ProgramInput.status` bertipe `ProgramStatus`, `AdminProgram.status` sengaja tetap `string` (data lama bisa di luar enum).
  - `organization.ts`: `sort_order` pada divisi/jabatan publik dan `AdminDivision`; `photo_url` tetap `string | null` (normalisasi dilakukan backend).
  - `settings.ts`: `PUBLIC_SETTING_KEYS` (45 key, `as const`, urutan sama dengan `_REGISTRY_ORDER` backend) + `PublicSettings`/`PublicSettingsResponse` dan tipe admin (`AdminSettingItem`, `AdminSettingsResponse` dengan `unknown_keys`, payload/response PUT/PATCH/DELETE).
- **Service publik:**
  - `frontend/lib/public/news.ts`: `q` (minimal 2 karakter setelah trim), `total`, `excerpt`/`tags`; `getPublicNewsBySlug()` mengembalikan `null` hanya untuk 404 dan melempar error lain.
  - `frontend/lib/public/programs.ts`: filter `periodId`, `divisionId`, dan `status` (satu/array, diserialisasi sebagai parameter berulang); `total` + `period`; `getPublicProgramBySlug()` dengan perilaku 404 → `null`. Argumen kedua `options` dipertahankan agar pemanggil lama tetap valid.
  - `frontend/lib/public/organization.ts`: kode tidak berubah, hanya tipe yang mengikuti kontrak baru.
  - `frontend/lib/public/settings.ts` (baru): `getPublicSettings()` memakai `next: { revalidate: 60 }` (selaras `Cache-Control: public, max-age=60`, bukan `no-store`), `loadPublicSettings()` dengan timeout 5 detik, `PUBLIC_SETTINGS_FALLBACK` (default copy backend, key data `""`), dan `resolvePublicSettings()` (nilai backend menang, termasuk string kosong yang disengaja).
  - `frontend/lib/public/visits.ts` (baru): `recordVisit(page)` menelan semua error; belum dipasang ke halaman mana pun.
  - `frontend/lib/public/link.ts`: komentar diperbarui — `PUBLIC_LINKS` adalah fallback sementara sampai UI memakai `bank_soal_url`/`instagram_url`/`instagram_label`; `as const` tetap.
- **Admin settings service (`frontend/lib/admin/settings.ts`):** `getAdminSettings`, `updateAdminSetting`, `patchAdminSettings`, `deleteAdminSetting`. **Tidak ada halaman admin Pengaturan** pada batch ini.
- **Status program (UI admin):**
  - `frontend/lib/programs/status.ts` (baru): `isProgramStatus`, `normalizeProgramStatus`, `programStatusLabel` → "Direncanakan", "Berjalan", "Selesai", "Dibatalkan", dan "Status lain" untuk nilai tak dikenal.
  - `ProgramPrimitives.tsx` memakai helper untuk label/warna; nilai tak dikenal tampil "Status lain" tanpa crash.
  - `ProgramFormDialog.tsx`: input teks status diganti `<select>` berisi empat opsi berlabel; status lama yang tak dikenal tampil sebagai opsi disabled `Status lain (<nilai>)`; simpan ditolak (`Pilih salah satu dari empat status program yang valid.`) sampai admin memilih nilai yang valid. Satu-satunya perubahan UI pada batch ini.
- **Verifikasi yang dijalankan + hasil aktual:**
  - `npm run lint` → lulus tanpa error.
  - `npx tsc --noEmit` → lulus tanpa error.
  - `npm run build` → lulus, 9 route; `ƒ /` dan `ƒ /struktur` dinamis. Warning `pnpm-lock.yaml` di luar repo bersifat non-fatal.
  - `npm start` sementara di port 3100: `GET /` → `200` (title `Beranda | HIMATKN`), `GET /struktur` → `200` (title `Susunan Kepengurusan | HIMATKN`); server dihentikan setelah pemeriksaan. Tidak ada perubahan tampilan publik.
  - Kontrak runtime terhadap backend lokal (SQLite sementara di `%TEMP%` + `TestClient`, bukan production/DB nyata): settings 200 + 45 key sesuai registry; program list memuat `total`/`period` dan urutan `start_date` DESC (NULL akhir); filter `status` berulang; detail program + 404; `status` invalid → 422; berita memuat `total`/`excerpt`/`tags` tanpa `content`; detail berita `content` + `tags` tanpa `excerpt`; `q` mengembalikan `total`; organisasi memuat `sort_order` dan `photo_url` ternormalisasi; `POST /public/visits` → 201. Semua pemeriksaan `OK`, `FAILURES []`, exit 0.
  - Sinkronisasi key settings (skrip read-only di luar repo): 45/45 key, urutan dan isi sama dengan `SETTINGS_REGISTRY`; `PUBLIC_SETTINGS_FALLBACK` 45 key cocok dengan default backend; seluruh key data bernilai `""`.
- **File yang dibuat:** `frontend/lib/api/errors.ts`, `frontend/lib/public/settings.ts`, `frontend/lib/public/visits.ts`, `frontend/lib/programs/status.ts`.
- **File yang diubah:** `frontend/lib/api/client.ts`, `frontend/lib/admin/settings.ts`, `frontend/lib/public/link.ts`, `frontend/lib/public/news.ts`, `frontend/lib/public/programs.ts`, `frontend/types/news.ts`, `frontend/types/organization.ts`, `frontend/types/programs.ts`, `frontend/types/settings.ts`, `frontend/components/admin/programs/ProgramFormDialog.tsx`, `frontend/components/admin/programs/ProgramPrimitives.tsx`, `docs/progress.md`.
- **Konfirmasi batas scope:**
  - `Backend/`, database/migrasi, auth/sesi/CSRF/cookie/CORS, storage, rate limit, environment, `.env*`, dependency, dan konfigurasi berubah: Tidak.
  - Tampilan publik berubah: Tidak (`frontend/app/(public)/page.tsx`, komponen publik, dan `PublicLabel.tsx` tidak disentuh).
  - `AuthContext` diubah: Tidak.
  - Endpoint/field/data palsu ditambahkan: Tidak.
  - Commit/push/merge/rebase/reset/clean/deploy: Tidak.
- **Utang teknis/backlog:**
  - UI publik belum migrasi ke `PublicSettings` (termasuk `bank_soal_url`/`instagram_url`/`instagram_label`); `PUBLIC_LINKS` masih fallback.
  - Halaman admin Pengaturan, route detail program, dan route detail publikasi belum dibuat (menunggu keputusan route R2/R3/R4).
  - `AuthContext` belum memakai `isUnauthorized`; `recordVisit()` belum dipanggil dari halaman.
- **Langkah berikutnya:** pemilik meninjau API-F. **Berhenti; R2 belum dimulai.**

---

### Sesi 2026-11-17 — Batch B3d: Foto hero & dokumentasi organisasi

- **Status:** Selesai untuk B3d; **API-B3 selesai**. Berhenti. Tidak commit, push, deploy, atau menjalankan seed.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `4deb3f4` saat B3d dimulai. B3c kemudian di-commit pemilik sebagai `7f13f03`; perubahan B3d masih di working tree dan belum di-commit.
- **Perubahan:**
  - `app/services/site_settings.py`: tipe baru `IMAGE = "image"` dan helper `_image(...)`; `hero_image` (group `hero`, label "Foto hero", default `""`, maks. 500) serta `hero_image_alt` (text, label "Deskripsi foto hero (untuk pembaca layar)", maks. 200). Registry menjadi **47 key** dan `PUBLIC_SETTING_KEYS` ikut 47.
  - Validator image: `""` diterima; selain itu wajib cocok `images/<nama>.<jpg|jpeg|png|webp>` (satu segmen, nama `[A-Za-z0-9][A-Za-z0-9_-]*`). Path media lengkap `/api/v1/media/images/...` dinormalisasi menjadi storage key. URL apa pun (termasuk `*.vercel-storage.com`), path absolut, `..`, backslash, karakter kontrol, dan ekstensi di luar daftar ditolak `422` dengan `"Nilai harus berupa storage key gambar yang valid."`. Keberadaan file tidak diperiksa.
  - `media_image_path()` menjadi helper bersama: `images/...` → `/api/v1/media/images/...`; `app/routers/public.py::_image_url` kini mendelegasikan ke helper ini (perilaku berita/gambar tidak berubah).
  - `GET /api/v1/public/settings` mengubah `hero_image` storage key menjadi path media (atau `""`) memakai `_image_url`.
  - `GET /api/v1/admin/settings`: item bertipe `image` menyertakan `preview_url` (path media, `""` bila kosong); tipe lain tidak memiliki field ini. `app/routers/settings.py` tidak perlu diubah.
  - `tests/test_settings.py`: +19 test — metadata 47 key, simpan key valid + path publik, normalisasi path media lengkap, `""` diterima, 13 nilai invalid (`parametrize`) → 422, `preview_url` hanya tipe image, dan `hero_image_alt`.
- **Contoh respons aktual (SQLite sementara):**
  - `PUT /admin/settings/hero_image` body `/api/v1/media/images/0123456789abcdef0123456789abcdef.jpg` → `200 {"key":"hero_image","value":"images/0123456789abcdef0123456789abcdef.jpg","type":"image","updated_by":1}`.
  - `PUT /admin/settings/hero_image_alt` → `200 {"key":"hero_image_alt","value":"Mahasiswa berfoto bersama","type":"text","updated_by":1}`.
  - `GET /admin/settings` item `hero_image` memuat `"preview_url":"/api/v1/media/images/0123456789abcdef0123456789abcdef.jpg"`; `hero_image_alt` tidak memuat `preview_url`.
  - `GET /public/settings` → `"hero_image":"/api/v1/media/images/0123456789abcdef0123456789abcdef.jpg"`, `"hero_image_alt":"Mahasiswa berfoto bersama"`.
  - `PUT /admin/settings/hero_image` dengan `https://contoh.vercel-storage.com/hero.jpg` → `422 {"detail":"Nilai harus berupa storage key gambar yang valid."}`.
  - `PUT /admin/settings/hero_image` dengan `""` → `200` dan publik kembali `"hero_image":""`.
- **Dokumentasi:**
  - `Backend/docs/SITE_SETTINGS.md`: registry 47 key, tabel hero dengan dua key baru, bagian "Foto hero" (unggah `POST /media/images` → simpan `storage_key` → isi alt), tipe `image` di aturan validasi, catatan foto hero V1 (Vercel Blob) harus diunggah ulang saat go-live, serta contoh respons publik/admin dengan `preview_url`.
  - `Backend/docs/ORGANIZATION_API.md` (baru): seluruh endpoint organisasi (periode, divisi, posisi, anggota) termasuk B3a/B3b, izin + CSRF, bentuk item, pesan error, contoh respons, dan alur pergantian periode 7 langkah (buat periode → salin divisi → sesuaikan → isi anggota → verifikasi → aktifkan → hapus periode lama).
  - `Backend/routes.txt`: diregenerasi lewat penelusuran `effective_route_contexts()` (bukan `scripts/list_routes.py` yang hanya mencetak 5 route di FastAPI 0.141) menjadi **71 baris**; bertambah 8 route B3a/B3b/B3c dan tidak ada yang hilang.
- **Keputusan teknis:** format storage key dari `POST /media/images` adalah `images/<uuid-hex>.jpg` dan tidak memakai subfolder tahun, sehingga validator sengaja hanya menerima satu segmen nama (lebih ketat dari `_SAFE_KEY` di storage). Normalisasi hanya untuk prefix path media lengkap; nilai lain divalidasi apa adanya. `preview_url` dihitung saat baca, bukan disimpan, sehingga otomatis mengikuti nilai terbaru.
- **Verifikasi:** `python -m compileall app` lulus; `pytest -q` **172 passed → 191 passed** (+19); `alembic check` → `No new upgrade operations detected`. Tidak ada perubahan model/migration.
- **Risiko/backlog:** frontend belum sinkron — API-F2 wajib menambahkan `hero_image`/`hero_image_alt` ke `PUBLIC_SETTING_KEYS` dan `PUBLIC_SETTINGS_FALLBACK`; hero homepage tetap memakai aset statis sampai R3. `scripts/list_routes.py` masih rusak untuk FastAPI 0.141 dan perlu diperbaiki di batch lain.
- **Langkah berikutnya:** pemilik meninjau dan meng-commit B3c + B3d. **Berhenti; tidak ada batch B3 lanjutan.**

---

### Sesi 2026-11-17 — Batch B3c: Ubah kata sandi sendiri

- **Status:** Selesai untuk B3c; **berhenti**. Tidak commit, push, deploy, atau menjalankan seed.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `4deb3f4`. B3b sudah di-commit pemilik sebagai `35188af`; B3c belum di-commit.
- **Perubahan:**
  - Schema `ChangePasswordIn`: `current_password` (1–255), `new_password` (12–128), validator `new_password == current_password` → 422.
  - `POST /api/v1/auth/change-password` (login via `current_admin` + `require_csrf`, tanpa permission): kata sandi lama salah → **400** `"Kata sandi lama salah"`; sukses menyimpan `hash_password(new_password)`, mencabut sesi lain (`AuthSession.jti != jti` request ini, `revoked_at IS NULL`), menulis audit `admin.password_change`, lalu satu commit.
  - Sesi saat ini dipertahankan dengan men-decode cookie token request ini dan mengecualikan `jti`-nya; cookie sesi dan CSRF tidak dihapus/diganti. Respons `200 {"ok": true, "sessions_revoked": n}`.
  - Rate limit memakai grup tulis `auth` bawaan middleware (tidak ada perubahan `rate_limit.py`).
  - Dokumentasi endpoint + perilaku sesi ditambahkan di `Backend/README.md` (API dan Security).
- **Contoh respons aktual (SQLite sementara):**
  - `POST /auth/change-password` (dua klien login) → `200 {"ok": true, "sessions_revoked": 1}`; `/auth/me` klien A → `200`, klien B → `401 {"detail":"Sesi tidak valid"}`.
  - Kata sandi lama salah → `400 {"detail":"Kata sandi lama salah"}`.
  - Kata sandi baru 11 karakter → `422` (`string_too_short`).
  - Kata sandi baru sama dengan lama → `422` (`Kata sandi baru tidak boleh sama dengan kata sandi lama`).
- **Keputusan teknis:** request ini memakai cookie token yang sudah divalidasi `current_admin`; `jti` diambil dari token tersebut sehingga hanya sesi lain yang dicabut. `sessions_revoked` dihitung dari `AuthSession` aktif sebelum `UPDATE`, sehingga akurat untuk respons. Tidak ada perubahan pada `database/dependencies.py`, `services/auth.py`, atau helper login/logout yang sudah ada.
- **Risiko rate limit:** endpoint mengandalkan grup tulis `auth` (60 permintaan/jendela global per IP) dan tidak punya bucket per-akun khusus seperti login. Untuk mencegah brute-force kata sandi lama, pertimbangkan limiter per-admin pada batch lanjutan.
- **Verifikasi:** `python -m compileall app` lulus; `pytest -q` **165 passed → 172 passed** (14 test di `test_auth.py`, +7); `alembic check` → `No new upgrade operations detected`.
- **Catatan:** prototipe admin menulis minimal 8 karakter, backend mewajibkan 12; frontend harus menyesuaikan validasi saat UI ubah kata sandi dibuat. Test memakai akun admin khusus (`B3C-*`) sehingga kata sandi akun `admin` bersama tidak berubah.
- **Langkah berikutnya:** B3d setelah pemilik meng-commit B3c.

---

### Sesi 2026-11-17 — Batch B3b: CRUD divisi & salin divisi

- **Status:** Selesai untuk B3b; **berhenti**. Tidak commit, push, deploy, atau menjalankan seed.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `f80ecfb`. B3a sudah di-commit pemilik; B3b belum di-commit.
- **Perubahan:**
  - Schema `DivisionUpdateIn` (nama/deskripsi/`sort_order`, tanpa `period_id`) dan `DivisionCopyIn` (`source_period_id`).
  - `POST /api/v1/admin/organization/divisions` (201): periode wajib ada (400), nama unik per periode case-insensitive (409 "Divisi dengan nama ini sudah ada di periode tersebut"), audit `division.create`.
  - `PUT /api/v1/admin/organization/divisions/{id}`: 404, nama unik per periode mengecualikan diri sendiri (409), `period_id` di body diabaikan, audit `division.update`.
  - `DELETE /api/v1/admin/organization/divisions/{id}`: 404; 409 bila masih ada anggota ("masih ada N anggota") dan/atau dipakai program ("masih dipakai N program kerja"); sukses `{"deleted": id}` + audit `division.delete`.
  - `POST /api/v1/admin/organization/periods/{period_id}/divisions/copy`: 404 untuk target/sumber tidak ada, 400 bila sumber == target; menyalin `name`/`description`/`sort_order` urut `sort_order` lalu `id`; anggota tidak disalin; nama yang sudah ada (case-insensitive) masuk `skipped`; satu commit dan satu audit `division.copy`; respons `{"created": [...], "skipped": [...]}`.
  - `GET /api/v1/admin/organization/divisions`: urutan menjadi `period_id`, `sort_order`, `id`; `sort_order` sudah ada di item.
  - **Bug fix (izin pemilik):** `create_member`, `update_member`, `delete_member` memakai `ip_address=get_client_ip(request)` dan `user_agent=request.headers.get("user-agent", "")[:500]` menggantikan `request=request`. Logika lain tidak diubah.
- **Contoh respons aktual (SQLite sementara):**
  - `POST /divisions` → `201 {"id":1,"period_id":1,"name":"Badan Pengurus Harian","description":"BPH","sort_order":0}`.
  - `POST /periods/2/divisions/copy` → `200 {"created":[{"id":4,"period_id":2,"name":"Badan Pengurus Harian","description":"BPH","sort_order":0}],"skipped":["Media"]}`.
  - `POST` copy periode sama → `400 {"detail":"Periode sumber dan tujuan tidak boleh sama"}`.
  - `PUT /divisions/5` → `200 {"id":5,"period_id":2,"name":"Kaderisasi & Advokasi","description":"Deskripsi baru","sort_order":3}`.
  - `DELETE /divisions/5` → `200 {"deleted":5}`.
  - CRUD anggota → `201`, `200`, `204` (sebelumnya 500 karena bug audit).
- **Keputusan teknis:** pengecekan nama divisi memakai `func.lower()` agar konsisten dengan collation MySQL; copy memakai satu `flush` + satu commit dan menambah nama ke set `existing_names` agar duplikat di dalam sumber pun tidak dibuat; `DELETE` menghitung anggota dan program terpisah karena FK program `SET NULL`; audit copy memakai `entity_type="period"` dan `entity_id=target`.
- **Verifikasi:** `python -m compileall app` lulus; `pytest -q` **145 passed → 165 passed** (44 test di `test_organization.py`); `alembic check` → `No new upgrade operations detected`; `git grep -n "request=request" -- Backend/app` tidak menemukan sisa (sebelum perbaikan: 3 temuan, semuanya di `organization.py`).
- **Catatan/utang teknis:**
  - `Backend/docs/ORGANIZATION_API.md` dan regenerasi `routes.txt` masih ditunda ke B3d.
  - `create_period` memiliki indentasi `log_activity` yang tidak rapi (di luar scope B3b, tidak diubah).
  - Perubahan lokal pemilik di tiga file frontend (termasuk `PublicationsSection.tsx` yang muncul selama sesi) tidak disentuh.
- **Langkah berikutnya:** B3c setelah pemilik meng-commit B3b.

---

### Sesi 2026-11-17 — Batch B3a: Ubah & hapus periode

- **Status:** Selesai untuk B3a; **berhenti**. Tidak commit, push, deploy, atau menjalankan seed.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `d642419`. Langkah 1–2 B3 (`61ab3c3`, `d642419`) dikerjakan dan di-commit pemilik; B3a belum di-commit.
- **Perubahan:**
  - `PeriodUpdateIn` (nama 2–50, tanggal opsional, tanpa `is_active`) + validator tanggal bersama; validator yang sama ditambahkan ke `PeriodIn` (create).
  - `PUT /api/v1/admin/organization/periods/{period_id}`: 404 bila tidak ada, nama unik case-insensitive mengecualikan diri sendiri (409 "Periode sudah ada"), `name` di-strip, `is_active` tidak berubah, audit `period.update`.
  - `DELETE /api/v1/admin/organization/periods/{period_id}`: 404, 409 untuk periode aktif, 409 bila masih ada divisi/anggota/program (pesan hanya menyebut yang > 0), sukses `{"deleted": id}` + audit `period.delete`.
- **Contoh respons aktual (SQLite sementara):**
  - `PUT` → `200 {"id":1,"name":"Contoh 2030/2031 Revisi","start_date":"2030-02-01","end_date":"2030-11-30","is_active":false}`.
  - `PUT` tanggal terbalik → `422 {"detail":"Validation error","errors":[{"loc":["body"],"msg":"Value error, Tanggal selesai tidak boleh sebelum tanggal mulai","type":"value_error"}]}`.
  - `DELETE` kosong → `200 {"deleted":1}`; `DELETE` ID sama lagi → `404 {"detail":"Periode tidak ditemukan"}`.
- **Keputusan teknis:** validasi tanggal ditolak sebagai 422 oleh Pydantic sebelum handler; `is_active` pada body PUT diabaikan karena tidak ada di schema; pengecekan nama memakai `func.lower()` agar konsisten dengan create dan tidak bergantung pada collation DB; DELETE menghitung relasi lebih dulu agar pesan 409 informatif (FK program `SET NULL`/`RESTRICT` tidak diandalkan).
- **Verifikasi:** `python -m compileall app` lulus; `pytest -q` **133 passed → 145 passed** (24 test di `test_organization.py`); `alembic check` → `No new upgrade operations detected`.
- **Catatan/utang teknis:**
  - Ditemukan bug lama di luar scope: `create_member`, `update_member`, dan `delete_member` memanggil `log_activity(..., request=request)`, padahal signature `log_activity` tidak menerima `request`; endpoint anggota akan gagal 500 bila mencapai audit. Belum diperbaiki karena anggota di luar scope B3a — perlu keputusan pemilik.
  - `Backend/docs/ORGANIZATION_API.md` dan regenerasi `routes.txt` ditunda ke B3d agar memuat seluruh endpoint B3.
  - Selama sesi, muncul perubahan lokal pemilik pada `frontend/app/(public)/struktur/loading.tsx` dan `frontend/components/public/OrganizationSection.tsx` (konversi arbitrary value Tailwind); tidak disentuh.
- **Langkah berikutnya:** B3b (divisi: create/update/delete + salin divisi) setelah pemilik meng-commit B3a.

---

### Sesi 2026-11-18 — Batch SEC-1: Konfigurasi produksi & guard superadmin

- **Status:** Selesai; **berhenti**. Tidak commit, push, deploy, atau menjalankan seed ke database sungguhan.
- **Branch:** `feat/admin-ui-foundation`; working tree bersih sebelum batch dimulai.
- **Tujuan batch:** menutup temuan audit SEC-T2, SEC-S3, SEC-S5, dan SEC-S6. **SEC-T1 (matriks permission role) ditunda** menunggu keputusan himpunan soal akun per kadiv; `app/seed.py`, `ROLE_SEEDS`, dan `PERMS` tidak diubah.
- **Yang selesai:**
  - **SEC-T2:** `validate_runtime()` production mewajibkan `ADMIN_DEFAULT_PASSWORD` minimal 12 karakter dan menolak nilai contoh (`admin123`, `admin`, `password`, `changeme`, `change_me`, `12345678`, `123456789012`, `himatkn`) serta nilai yang mengandung `CHANGE_ME` (case-insensitive). Pesan error tidak mencetak password. `Backend/.env.example` mengosongkan `ADMIN_DEFAULT_PASSWORD=` dengan komentar kewajiban password acak ≥ 12 karakter dan penggantian via `POST /api/v1/auth/change-password`.
  - **SEC-S3:** production menolak `JWT_SECRET_KEY` yang mengandung `CHANGE_ME` atau memiliki < 10 karakter unik, selain tetap mewajibkan ≥ 32 karakter. `Backend/.env.example` menambahkan cara membuat secret dengan `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
  - **SEC-S6:** `APP_ENV` dinormalisasi `strip().lower()`, alias `prod` → `production` dan `dev` → `development`; hanya `development`, `test`, `production` yang diterima, nilai lain (mis. `staging`) gagal saat startup lewat validator Pydantic. Properti `production` memakai nilai ternormalisasi.
  - **SEC-S5:** `PUT /api/v1/admin/admins/{id}` menolak perubahan role akun sendiri → **400** `Anda tidak dapat mengganti role akun sendiri`. Operasi ganti role, nonaktifkan, atau hapus yang membuat jumlah admin **aktif** pemegang `admins.manage` menjadi 0 → **409** (pesan menyebut `admins.manage`).
- **File yang diubah:**
  - `Backend/app/core/config.py`
  - `Backend/app/routers/admins.py`
  - `Backend/.env.example`
  - `Backend/tests/test_config.py`
  - `Backend/tests/test_admins.py`
  - `docs/progress.md`
- **Test yang ditambahkan:**
  - Config: menolak `admin123`, password 11 karakter, JWT berisi `CHANGE_ME`, JWT `"a"*40`, dan `APP_ENV=staging`; menerima konfigurasi produksi valid; normalisasi alias `APP_ENV`.
  - Admins: self role change → 400; menonaktifkan, menurunkan, dan menghapus satu-satunya pemegang `admins.manage` → 409.
- **Pemeriksaan yang dijalankan + hasil:**
  - `python -m compileall app` → lulus.
  - `pytest -q` → **213 passed** (baseline 191; +22 test baru), 34 warning deprecation dari dependency.
  - `alembic check` → `No new upgrade operations detected`.
- **Risiko/regresi yang diperiksa:**
  - `conftest.py` memakai `APP_ENV=test`, sesuai nilai yang diizinkan; test lama tetap lulus.
  - Test guard 409 memakai aktor nonaktif dengan izin `admins.manage` agar target benar-benar menjadi satu-satunya admin aktif pemegang izin; state admin lain dipulihkan setelah test.
  - Tidak ada perubahan model, migration, `app/seed.py`, `ROLE_SEEDS`, `PERMS`, atau `frontend/`.
- **Blocker/keputusan yang diperlukan:**
  - **SEC-T1 ditunda** menunggu keputusan pemilik tentang himpunan soal akun per kadiv.
  - Tidak ada blocker teknis lain.
- **Konfirmasi batas scope:**
  - Backend berubah: Ya — hanya `app/core/config.py`, `app/routers/admins.py`, `.env.example`, dan test terkait.
  - Database/schema/migration berubah: Tidak.
  - Secret/kredensial diekspos: Tidak.
  - Dokumentasi berubah: Ya — `docs/progress.md`.
- **Langkah berikutnya:** menunggu keputusan SEC-T1, lalu review dan commit oleh pemilik.

---

### Sesi 2026-11-18 — Batch B4a: Model izin per akun, migrasi, katalog izin, dan seed

- **Status:** B4a selesai; **berhenti**. B4b belum dikerjakan dan menunggu B4a di-commit. Tidak commit, push, deploy, seed, atau migrasi ke database sungguhan.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `af39ba3` (SEC-1). Working tree bersih sebelum B4a dimulai.
- **Keputusan model:** izin dicentang langsung per akun oleh superadmin. Role `admin` dan `editor` dihapus; hanya role `superadmin` yang tersisa dan tetap memegang semua izin. `admins.view`, `admins.manage`, dan `roles.manage` tidak dapat diberikan ke akun non-superadmin.
- **Yang selesai:**
  - Model `AdminPermission` (`admin_permissions`: PK gabungan `admin_id` + `permission_id`, FK cascade, `created_at`, indeks `permission_id`) dan ekspor di `app/models/__init__.py`.
  - Migrasi `20261118_0002_admin_permissions.py`: membuat tabel, menyalin izin role non-superadmin ke izin langsung (kecuali `SUPERADMIN_ONLY`), menghapus seluruh `admin_roles` non-superadmin, lalu menghapus `role_permissions` dan role `admin`/`editor`. `downgrade()` hanya menghapus tabel dengan komentar bahwa data role lama tidak dipulihkan. Memakai SQLAlchemy core dan tipe BIGINT dengan varian MySQL unsigned agar cocok dengan `admins.id`.
  - `app/services/permissions.py`: `PERMISSION_CATALOG` berurutan (Dashboard, Publikasi, Program kerja, Organisasi, Pengaturan situs, Upload gambar, Log aktivitas, Statistik pengunjung; Agenda/Dokumen/Notifikasi `available=False`), `SUPERADMIN_ONLY`, `ALWAYS_GRANTED`, aturan implikasi, `normalize_permissions()`, serta validasi saat import terhadap `PERMS` seed.
  - `app/services/auth.py`: `permissions_for_admin` = izin role ∪ izin langsung ∪ `ALWAYS_GRANTED`, menerapkan implikasi; `is_superadmin()`; `admin_payload` menambah `is_superadmin` dan tetap mengirim `roles`.
  - `app/seed.py`: `ROLE_SEEDS` hanya `superadmin`, semua izin `PERMS` diberikan ke superadmin, logika role lain dihapus; seed tetap idempoten.
  - `app/core/config.py`: `ADMIN_DEFAULT_ROLE` hanya menerima `superadmin` (case-insensitive); `.env.example` diberi komentar.
- **File yang diubah/ditambah:**
  - `Backend/app/models/auth.py`, `Backend/app/models/__init__.py`
  - `Backend/app/services/permissions.py` (baru), `Backend/app/services/auth.py`
  - `Backend/app/seed.py`, `Backend/app/core/config.py`, `Backend/.env.example`
  - `Backend/alembic/versions/20261118_0002_admin_permissions.py` (baru)
  - `Backend/tests/conftest.py`, `Backend/tests/test_admins.py`, `Backend/tests/test_models.py`, `Backend/tests/test_admin_permissions.py` (baru)
  - `docs/progress.md`
- **Penyesuaian test yang sudah ada (beserta alasan):**
  - `conftest.py`: role `editor` dihapus; akun `limited` kini memakai izin langsung `news.view`. `ADMIN_DEFAULT_ROLE=superadmin` ditambahkan ke environment test.
  - `test_admins.py`: target update/delete memakai izin langsung; test create memakai role sementara khusus test karena schema endpoint masih memakai `role` sampai B4b; self role change memakai role `superadmin` yang valid. Test guard SEC-1 berbasis role dipertahankan untuk sementara dan akan diganti dengan guard superadmin di B4b.
  - `test_models.py`: jumlah tabel 22 → 23 karena `admin_permissions`.
- **Test B4a yang ditambahkan:**
  - Migrasi data pada SQLite sementara: admin dengan role `editor` lama mendapat izin langsung yang sama tanpa `SUPERADMIN_ONLY`, tidak lagi punya role, dan role `editor`/`admin` hilang.
  - `normalize_permissions`: implikasi `news.create`/`organization.manage`/`settings.manage`, penolakan nama tidak dikenal dan `admins.manage`/`roles.manage`, serta `dashboard.view` selalu ada.
  - `permissions_for_admin`: superadmin mendapat semua izin; akun dengan izin langsung `news.create` mendapat `news.create` + `news.view` + `dashboard.view`; `is_superadmin` benar.
- **Pemeriksaan yang dijalankan + hasil:**
  - `python -m compileall app` → lulus.
  - `pytest -q` → **219 passed** (sebelum B4a: 213; +6 test baru).
  - `alembic upgrade head` pada SQLite sementara `storage/b4a-migration-check.sqlite3` → berhasil; file sementara dihapus setelah pemeriksaan.
  - `alembic check` pada SQLite sementara yang sama → `No new upgrade operations detected`.
- **Risiko/regresi yang diperiksa:**
  - Route, schema, dan endpoint admin belum diubah pada B4a; semuanya masih kompatibel dengan field `role` sampai B4b.
  - Superadmin tetap mendapat seluruh izin melalui role; akun non-superadmin memakai izin langsung + `dashboard.view`.
  - Migration tidak memakai sintaks SQL khusus dialek dan aman ketika tabel sudah ada (baseline SQLite membuat metadata terkini).
  - Tidak ada perubahan `frontend/`, model konten, atau migration lama.
- **Blocker/keputusan yang diperlukan:**
  - Tidak ada blocker teknis untuk B4a.
  - B4b menunggu B4a di-commit oleh pemilik.
- **Konfirmasi batas scope:**
  - Backend berubah: Ya — sesuai scope B4a.
  - Database/schema/migration berubah: Ya — model dan satu migration baru; tidak dijalankan ke database sungguhan.
  - Secret/kredensial diekspos: Tidak.
  - Dokumentasi berubah: Ya — `docs/progress.md`.
- **Langkah berikutnya:** B4b (schema/endpoint kelola akun, katalog permission endpoint, guard superadmin, dokumentasi `ADMIN_API.md`, regenerasi `routes.txt`).

---

### Sesi 2026-11-18 — Batch B4b: Endpoint kelola akun, guard superadmin, dan dokumentasi

- **Status:** Selesai; **B4 selesai**. Berhenti. Tidak commit, push, deploy, seed, atau migrasi ke database sungguhan.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `8ea1771` (B4a sudah di-commit pemilik). Working tree bersih sebelum B4b dimulai.
- **Tindak lanjut review B4a:**
  - Migrasi `20261118_0002` tidak lagi memakai `DELETE ... WHERE id IN (SELECT ...)` pada tabel yang sama. Daftar id role (`non_superadmin_role_ids`, `legacy_role_ids`) diambil lebih dulu ke list Python dan penghapusan dilewati bila list kosong, sehingga aman untuk MySQL/TiDB (error 1093).
  - `permissions_for_admin` membuang izin langsung yang termasuk `SUPERADMIN_ONLY` sebelum digabung; izin dari role superadmin tetap utuh. Test baru memastikan baris `admin_permissions` manual `admins.view`/`admins.manage`/`roles.manage` tidak memberi akses apa pun (hanya `dashboard.view`).
- **Schema (`app/schemas/admin.py`):**
  - `AdminCreate`: `username`, `password` (12–128), `is_superadmin: bool = False`, `permissions: list[str] = []`; field `role` dihapus.
  - `AdminUpdate`: `username`, `password`, `is_active`, `is_superadmin`, `permissions`, semuanya opsional. `permissions` bila dikirim mengganti seluruh izin langsung.
  - Validator menolak (`422`) `is_superadmin=true` dengan `permissions` terisi.
- **Endpoint (`app/routers/admins.py`):**
  - `GET /admin/admins/permissions` (`admins.view`) mengirim `items` = `PERMISSION_CATALOG` (termasuk `implies`), `superadmin_only`, dan `always_granted`.
  - `GET /admin/admins/roles` **dihapus** karena role selain `superadmin` sudah tidak ada dan tidak ada pemakai di frontend.
  - `POST /admin/admins` membuat superadmin dengan role `superadmin`, atau akun non-superadmin dengan `normalize_permissions(payload.permissions)` yang disimpan ke `admin_permissions`.
  - `PUT /admin/admins/{id}` mendukung promosi/demosi `is_superadmin` dan penggantian `permissions`. Demosi tanpa `permissions` menyisakan `dashboard.view` saja.
  - Audit spesifik tanpa password: `admin.create`, `admin.update`, `admin.permissions_update` (deskripsi menyebut izin ditambah/dihapus), `admin.password_reset`, `admin.superadmin_grant`, `admin.superadmin_revoke`, `admin.delete`; IP memakai `get_client_ip(request)`.
- **Guard:**
  - Maksimal **2 superadmin** dihitung semua akun ber-role superadmin (aktif + nonaktif); membuat/mempromosikan yang ketiga → `409 "Jumlah superadmin maksimal 2 akun"`.
  - Minimal **1 superadmin aktif**; menonaktifkan, menghapus, atau mendemosi superadmin aktif terakhir → `409`.
  - Akun tidak boleh mengubah password, `permissions`, `is_superadmin`, atau `is_active` milik sendiri lewat endpoint ini → `400`; pesan password: `Gunakan menu ganti kata sandi`.
  - Helper guard SEC-1 berbasis role (`_active_admins_with_permission`, `_assert_active_manage_admin_remains`, `_assert_not_self_role_change`) diganti pengecekan superadmin aktif; tidak ada dua mekanisme yang berjalan bersamaan.
  - Logika subset izin lama dan endpoint role dihapus. Endpoint efektif hanya dapat dicapai superadmin karena `admins.manage` superadmin-only.
- **Sesi:** password reset, penonaktifan akun, dan perubahan status superadmin mencabut sesi target. Perubahan `permissions` saja **tidak** mencabut sesi karena izin dibaca ulang tiap request.
- **Test:**
  - `test_admin_permissions.py`: +1 test defense-in-depth izin langsung superadmin-only.
  - `test_admins.py` disesuaikan ke model baru: create/expanded permissions, akses modul (`POST /admin/news` 201, `DELETE` 403, `GET /admin/admins` 403), `admins.manage`/nama ngawur/`is_superadmin` + permissions → 422, superadmin ketiga → 409, guard superadmin aktif terakhir, larangan ubah akun sendiri, reset password mencabut sesi target tetapi bukan sesi superadmin, perubahan izin langsung berlaku tanpa login ulang, dan struktur katalog (`available: false` untuk Agenda/Dokumen/Notifikasi).
- **Dokumentasi:** `Backend/docs/ADMIN_API.md` (baru) memuat model izin, katalog, implikasi, guard, alur reset password, contoh request/response, error, audit, dan catatan API-F2. `Backend/routes.txt` diregenerasi lewat penelusuran `effective_route_contexts()` menjadi **71 baris**; hanya `GET /admin/admins/roles` berganti menjadi `GET /admin/admins/permissions`.
- **File yang diubah/ditambah:**
  - `Backend/alembic/versions/20261118_0002_admin_permissions.py`
  - `Backend/app/services/auth.py`
  - `Backend/app/schemas/admin.py`
  - `Backend/app/routers/admins.py`
  - `Backend/tests/test_admins.py`, `Backend/tests/test_admin_permissions.py`
  - `Backend/docs/ADMIN_API.md` (baru), `Backend/routes.txt`
  - `docs/progress.md`
- **Verifikasi:** `python -m compileall app` lulus; `pytest -q` **219 passed → 223 passed**; `alembic upgrade head` + `alembic check` pada SQLite sementara → `No new upgrade operations detected`.
- **Konfirmasi batas scope:**
  - Hanya `Backend/` dan `docs/progress.md` yang diubah; `frontend/` tidak disentuh.
  - Tidak menjalankan migrasi/seed/query tulis ke TiDB/MySQL sungguhan.
  - Tidak membaca/mencetak `.env*`; tidak commit/push/deploy.
- **Langkah berikutnya:** pemilik meninjau dan meng-commit B4b; API-F2 membangun form centang izin dari `GET /admin/admins/permissions`. **Berhenti.**

---

### Sesi 2026-11-18 — Batch F2a: Service & type admin organisasi lengkap + upload/kompresi gambar

- **Status:** Selesai; berhenti untuk tinjauan. Tidak commit, push, atau deploy.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `2af22db` (B4b sudah di-commit pemilik). Working tree bersih sebelum F2a dimulai.
- **Yang dikerjakan:**
  - `frontend/types/organization.ts`: mempertahankan seluruh type publik yang sudah ada dan melengkapi type admin sesuai `Backend/docs/ORGANIZATION_API.md` & `Backend/app/schemas/organization.py`: `OrganizationListFilter`, `PeriodCreatePayload`, `PeriodUpdatePayload` (tanpa `is_active`), `PeriodActivateResponse`, `PeriodDeleteResponse`, `DivisionCreatePayload`, `DivisionUpdatePayload` (tanpa `period_id`), `DivisionCopyPayload`, `DivisionCopyResponse`, `DivisionDeleteResponse`, `AdminPosition`, `AdminMember`, `MemberCreatePayload`, dan `MemberUpdatePayload`.
  - `frontend/lib/admin/organization.ts`: melengkapi seluruh endpoint organisasi admin memakai `apiFetch` dan `{ signal }` untuk semua GET: `getAdminPeriods`, `createAdminPeriod`, `updateAdminPeriod`, `deleteAdminPeriod`, `activateAdminPeriod`, `getAdminDivisions` (tetap kompatibel dengan parameter `periodId?: number`), `createAdminDivision`, `updateAdminDivision`, `deleteAdminDivision`, `copyAdminDivisions`, `getAdminPositions`, `getAdminMembers` (filter `OrganizationListFilter`), `createAdminMember`, `updateAdminMember`, `deleteAdminMember` (HTTP 204 → `void`).
  - `frontend/types/media.ts` (baru): mendefinisikan `UploadImageResponse` (`storage_key`, `original_size_bytes`, `compressed_size_bytes`).
  - `frontend/lib/media/compress.ts` (baru): implementasi `compressImageForUpload(file)` tanpa dependency tambahan memakai `createImageBitmap` + `<canvas>`, validasi MIME (`image/jpeg`, `image/png`, `image/webp`) dengan pesan error berbahasa Indonesia, resize maks 2400px atau trigger ukuran > 3,5 MB, re-encode JPEG kualitas `0.85` → `0.75` → `0.65` dengan batas hasil ≤ 3,8 MB, atau mengembalikan file asli bila tidak perlu dikompres.
  - `frontend/lib/api/media.ts`: mempertahankan `resolveMediaUrl`, menambahkan `mediaPathFromStorageKey(key)` (selaras dengan `media_image_path` di `Backend/app/services/site_settings.py`), dan menambahkan `uploadImage(file)` (`POST /media/images`, memanggil `compressImageForUpload` sebelum upload multipart field `file`).
- **Pemeriksaan yang dijalankan + hasil:**
  - `npx tsc --noEmit` (di `frontend/`) — lulus tanpa error atau output.
  - `npm run lint` (di `frontend/`) — lulus tanpa error atau warning.
- **File yang diubah/dibuat:**
  - `frontend/types/organization.ts` (diubah)
  - `frontend/lib/admin/organization.ts` (diubah)
  - `frontend/types/media.ts` (baru)
  - `frontend/lib/media/compress.ts` (baru)
  - `frontend/lib/api/media.ts` (diubah)
  - `docs/progress.md` (diubah)
- **Konfirmasi batas scope:**
  - Hanya `frontend/lib/`, `frontend/types/`, dan `docs/progress.md` yang diubah (`app/`, `components/`, styling, `Backend/`, `package.json`, `.env*` tidak disentuh).
  - Tidak install/upgrade paket npm; tidak commit/push/deploy.
- **Langkah berikutnya:** lanjutkan Batch F2b (settings 47 key, admin akun/izin, `AuthContext`). **Berhenti.**

---

### Sesi 2026-11-18 — Batch F2b: Auth, akun admin, pengaturan 47 key, kompresi gambar berita

- **Status:** Selesai; berhenti untuk tinjauan. Tidak commit, push, merge, rebase, atau deploy.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `fd60056` (F2a sudah di-commit pemilik). Working tree bersih sebelum F2b dimulai.
- **Tujuan batch:** menyelesaikan API-F2 di frontend — auth (field superadmin + ganti kata sandi), helper izin, service/type akun admin dan katalog izin, sinkronisasi settings 47 key, serta kompresi unggah gambar berita — tanpa menyentuh halaman, komponen, styling, atau backend.
- **Yang dikerjakan:**
  - `frontend/types/auth.ts`: menambahkan `is_superadmin: boolean` ke `Admin`, serta `ChangePasswordRequest` dan `ChangePasswordResponse` (`ok: true`, `sessions_revoked: number`).
  - `frontend/lib/api/auth.ts`: menambahkan `changePassword({ current_password, new_password })` → `POST /auth/change-password` memakai `apiFetch` (CSRF otomatis). Perilaku `login`, `getCurrentAdmin`, dan `logout` tidak diubah.
  - `frontend/lib/auth/permissions.ts` (baru): `PERMISSIONS` berisi **23 nama izin** yang diturunkan dari `Backend/app/services/permissions.py` (20 izin katalog + 3 `SUPERADMIN_ONLY`), type `PermissionName`, `hasPermission(admin, name)`, dan `hasAnyPermission(admin, names)`. Admin `null` atau nonaktif → `false`; superadmin tetap dicek melalui daftar `permissions` efektif dari backend.
  - `frontend/context/AuthContext.tsx`: menambahkan `can(name)` (memakai `hasPermission`) dan `isSuperadmin` ke nilai context. `isSuperadmin` memakai `admin.is_superadmin`, dengan fallback `roles.includes("superadmin")` bila respons auth belum memuat flag. Alur login/logout/refresh tidak diubah.
  - `frontend/types/admin-accounts.ts` (baru): `AdminAccount`, `AdminAccountListResponse`, `PermissionCatalogEntry`, `PermissionCatalogModule`, `PermissionCatalogResponse` (`items`, `superadmin_only`, `always_granted`), `AdminAccountCreatePayload`, dan `AdminAccountUpdatePayload`.
  - `frontend/lib/admin/accounts.ts` (baru), semua memakai `apiFetch` dan `{ signal }` untuk GET:
    - `getAdminAccounts()` → `GET /admin/admins`
    - `getAdminPermissionCatalog()` → `GET /admin/admins/permissions`
    - `createAdminAccount(payload)` → `POST /admin/admins`
    - `updateAdminAccount(id, payload)` → `PUT /admin/admins/{id}`
    - `deleteAdminAccount(id)` → `DELETE /admin/admins/{id}` (204 → `void`)
    - `applyPermissionImplications(selected, catalog)` — helper murni yang menambahkan izin `implies` secara transitif, tanpa API, tanpa menambahkan `always_granted`/`superadmin_only`, hasil terurut.
  - `frontend/types/settings.ts`: menambahkan `hero_image` dan `hero_image_alt` ke `PUBLIC_SETTING_KEYS` pada urutan registry backend, menambahkan `"image"` ke `AdminSettingType`, dan `preview_url?: string` ke `AdminSettingItem`. Group/tipe lain tidak diubah.
  - `frontend/lib/public/settings.ts`: menambahkan `hero_image: ""` dan `hero_image_alt: ""` ke `PUBLIC_SETTINGS_FALLBACK`; `resolvePublicSettings` tidak diubah dan tetap aman karena fallback kini memuat seluruh key.
  - `frontend/lib/admin/news.ts`: `uploadAdminNewsImage` memanggil `compressImageForUpload(file)` sebelum `formData.append("file", ...)`; parameter `caption`/`sort_order` dan endpoint tidak berubah.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - Cocok-silang registry settings (skrip read-only di luar repo): backend **47 key**, frontend **47 key**; tidak ada key hilang/berlebih; **urutan sama persis**. `PUBLIC_SETTINGS_FALLBACK` juga memuat 47 key dengan urutan yang sama.
  - `npx tsc --noEmit` di `frontend/` — lulus tanpa output/error.
  - `npm run lint` di `frontend/` — lulus tanpa error/warning.
- **Ketidakcocokan kontrak yang ditemukan:**
  - `Backend/app/schemas/auth.py` (`AdminOut`) **belum memuat `is_superadmin`**, sehingga `response_model=AuthResponse` pada `/auth/login` dan `/auth/me` membuang field yang sudah dihasilkan `admin_payload()` meskipun `Backend/docs/ADMIN_API.md` mencantumkannya. `GET /admin/admins` tidak memakai `response_model` sehingga field itu ada di respons daftar akun. Frontend tetap menambahkan field ke type sesuai instruksi dan memakai fallback `roles` di `AuthContext`; backend perlu menambahkan field ke schema agar konsisten. Tidak diubah karena `Backend/` di luar scope.
- **File yang diubah/dibuat:**
  - `frontend/types/auth.ts` (diubah)
  - `frontend/lib/api/auth.ts` (diubah)
  - `frontend/lib/auth/permissions.ts` (baru)
  - `frontend/context/AuthContext.tsx` (diubah)
  - `frontend/types/admin-accounts.ts` (baru)
  - `frontend/lib/admin/accounts.ts` (baru)
  - `frontend/types/settings.ts` (diubah)
  - `frontend/lib/public/settings.ts` (diubah)
  - `frontend/lib/admin/news.ts` (diubah)
  - `docs/progress.md` (diubah)
- **Konfirmasi batas scope:**
  - Hanya `frontend/lib/`, `frontend/types/`, `frontend/context/AuthContext.tsx`, dan `docs/progress.md` yang diubah. `app/`, `components/`, styling, `Backend/`, `package.json`, dan `.env*` tidak disentuh.
  - Tidak install/upgrade paket npm; tidak commit/push/deploy.
- **Langkah berikutnya:** bangun halaman/form admin (kelola akun + centang izin, pengaturan termasuk unggah foto hero, ganti kata sandi) memakai service F2b. Backend perlu menambahkan `is_superadmin` ke `AdminOut`. **Berhenti.**

---

### Sesi 2026-11-18 — Batch UI-0: Komponen form dasar + gerbang izin admin

- **Status:** Selesai; tidak commit, push, merge, rebase, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. Working tree bersih sebelum batch dimulai.
- **Tujuan batch:** menambah primitif form admin (`Input`, `Textarea`, `Select`,
  `Checkbox`, `FormField`) dan gerbang izin (`Can`, `RequirePermission`),
  memakainya pada form/filter yang sudah ada, serta mengganti nama izin manual
  di navigasi admin dengan konstanta `PERMISSIONS`. Tanpa perubahan backend,
  dependency, halaman publik, atau alur submit.
- **Yang selesai:**
  - `frontend/components/ui/Input.tsx` (baru): `<input>` dengan `invalid?`,
    `aria-invalid`, border/ring `gold` saat fokus, state `disabled`, dan
    penerusan `ref`/props native React 19.
  - `frontend/components/ui/Textarea.tsx` (baru): sama seperti `Input`,
    `rows` default 4, `resize-y`.
  - `frontend/components/ui/Select.tsx` (baru): `<select>` native, panah SVG
    inline, `invalid?`, dan `placeholder?` yang dirender sebagai
    `<option value="" disabled>`.
  - `frontend/components/ui/Checkbox.tsx` (baru): input checkbox + label dan
    `description?`; seluruh area label dapat diklik.
  - `frontend/components/ui/FormField.tsx` (baru): label, `hint?`, `error?`,
    `required?`; memakai `useId` bila `id` tidak diberikan, menghubungkan
    `htmlFor`/`id` dan `aria-describedby`, menampilkan tanda wajib, serta error
    `role="alert"` berwarna `danger`. Pola penghubung: `cloneElement` ke satu
    kontrol anak (menyuntikkan `id`, `required`, `aria-describedby`,
    `aria-invalid`).
  - `frontend/components/admin/shared/Can.tsx` (baru): `permission`/`anyOf` +
    `fallback?`, memakai `useAuth()` (`can`, `isSuperadmin`).
  - `frontend/components/admin/shared/RequirePermission.tsx` (baru):
    `permission`/`anyOf`/`superadminOnly`, state loading sama dengan layout
    admin, panel "Anda tidak memiliki akses ke halaman ini" + tombol kembali
    ke Dashboard tanpa redirect otomatis.
  - `frontend/components/admin/shell/admin-navigation.tsx`: type `Permission`
    lokal dihapus; `NavItem.permission` memakai `PermissionName`, seluruh isi
    navigasi memakai `PERMISSIONS.*`. Item menu dan perilaku filter tidak
    berubah.
  - `frontend/features/programs/components/admin/ProgramFormDialog.tsx`:
    seluruh `<input>`, `<select>`, `<textarea>` diganti `FormField` +
    `Input`/`Select`/`Textarea`. Nama field, nilai, validasi, dan alur submit
    tidak diubah.
  - `frontend/features/news/components/admin/NewsList.tsx`: filter status
    diganti `FormField` + `Select`; class input/label lokal dihapus. Kontrol
    lain tidak diubah.
  - `frontend/features/programs/components/admin/ProgramsList.tsx`: tombol
    tambah/edit/hapus dan kolom aksi digerbang `Can permission=
    {PERMISSIONS.PROGRAMS_MANAGE}`; prop `canManage` dihapus dari komponen
    karena gerbang kini memakai konteks auth.
  - Halaman admin:
    - `dashboard` dibungkus `RequirePermission` `dashboard.view`; blok akses
      ditolak lokal dihapus karena sudah ditangani pembungkus.
    - `news` dibungkus `RequirePermission` `news.view`; `canCreate` memakai
      `news.create`.
    - `programs` dibungkus `RequirePermission` `programs.view`; tambah/ubah/
      hapus memakai `programs.manage`.
  - `frontend/STRUCTURE.md`: daftar komponen `components/ui/`, API props, pola
    `FormField`, dan contoh pemakaian `Can`/`RequirePermission`.
- **File yang dibuat:** `frontend/components/ui/{Input,Textarea,Select,Checkbox,FormField}.tsx`,
  `frontend/components/admin/shared/{Can,RequirePermission}.tsx`.
- **File yang diubah:** `frontend/app/(private)/(admin)/admin/{dashboard,news,programs}/page.tsx`,
  `frontend/components/admin/shell/admin-navigation.tsx`,
  `frontend/features/news/components/admin/NewsList.tsx`,
  `frontend/features/programs/components/admin/{ProgramFormDialog,ProgramsList}.tsx`,
  `frontend/STRUCTURE.md`, `docs/progress.md`.
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npx tsc --noEmit` di `frontend/` — lulus tanpa output/error (exit 0).
  - `npm run lint` di `frontend/` — lulus tanpa error/warning (exit 0).
  - `npm run build` di `frontend/` — sukses; 9 route dihasilkan
    (`/`, `/struktur`, `/login`, `/admin/dashboard`, `/admin/news`,
    `/admin/programs`, `/_not-found`, `/robots.txt`, `/sitemap.xml`).
  - Grep `<input`/`<select`/`<textarea` mentah pada `ProgramFormDialog.tsx`
    dan `NewsList.tsx` — tidak ada hasil. Tidak ada `type="file"` di kedua file
    maupun di `frontend/features`.
- **Risiko/regresi yang diperiksa:**
  - Form program tetap memakai field, nilai awal, validasi (`required`,
    `minLength`, `maxLength`, urutan tanggal, status), dan payload yang sama.
  - `Select` tetap native; placeholder hanya opsi kosong `disabled`, sehingga
    perilaku pilihan dan keyboard tetap standar.
  - Sidebar tetap memfilter item dengan daftar izin yang sama; tidak ada item
    menu baru.
  - `FormField` memakai `cloneElement`, jadi anak harus satu kontrol form.
    Dokumentasi di `STRUCTURE.md` mencantumkan batasan ini.
  - `news.update` dan `news.delete` belum punya kontrol di halaman news karena
    halaman masih read-only; belum ada tombol edit/hapus untuk digerbang.
    Tombol tambah kini mengikuti `news.create`, tetapi handler `onCreate` masih
    stub lama (alur tambah belum dibuat).
- **Blocker/keputusan yang diperlukan:** Tidak ada blocker teknis. Alur
  tambah/ubah/hapus berita masih menjadi pekerjaan batch berikutnya.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak.
  - Database/schema/migration berubah: Tidak.
  - API contract/client/auth/CSRF/RBAC/cookie policy berubah: Tidak.
  - Dependency, `.env*`, deployment, secret, atau konfigurasi environment
    berubah: Tidak.
  - Halaman/komponen publik berubah: Tidak (login dan
    `StructureDirectory.tsx` tidak disentuh).
- **Langkah berikutnya:** lanjutkan batch UI admin berikutnya (form/halaman
  baru) memakai primitif dan gerbang izin ini; lengkapi alur tambah/ubah/hapus
  berita agar `news.update`/`news.delete` punya kontrol nyata.

---

### Sesi 2026-11-18 — Batch ORG-A: halaman admin Struktur Organisasi (periode & divisi)

- **Status:** Selesai di working tree; tidak commit, push, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `6d21625` (`feat(frontend): form primitives and permission gates (UI-0)`); working tree bersih sebelum batch.
- **Tujuan:** membangun halaman admin `/admin/organization` untuk periode dan divisi sesuai kontrak `Backend/docs/ORGANIZATION_API.md`, pola halaman `programs`, dan perilaku prototipe `Design/admin/`; sekaligus tiga perbaikan kecil untuk akun terbatas.
- **Perbaikan kecil lebih dulu:**
  - Dashboard: kartu statistik difilter izin (`news.view` → Publikasi, `programs.view` → Program Kerja, `organization.view` → Anggota, `visitor_logs.view` → Pengunjung); kartu Agenda dihapus. Baris Ringkasan hanya tampil bila izinnya ada, grid menyesuaikan jumlah kartu (1–4).
  - Sidebar: label akun bawah memakai `isSuperadmin` → "Superadmin", selain itu "Pengurus".
  - Navigasi: label "News" → "Publikasi" (route `/admin/news` tetap), dan item `/admin/organization` diberi label "Struktur Organisasi" serta dimasukkan `implementedAdminRoutes`.
- **Yang selesai (ORG-A):**
  - Halaman `app/(private)/(admin)/admin/organization/page.tsx` dibungkus `RequirePermission` `organization.view`.
  - Pemilih periode native (`Select`) berisi semua periode, aktif ditandai "(aktif)", default periode aktif atau periode terbaru; info nama, rentang tanggal, dan status aktif.
  - Buat periode (`FormDialog`: nama wajib 2–50, mulai, selesai) selalu `is_active: false`, menampilkan notice periode baru tidak aktif, lalu langsung memilih periode hasil create. Ubah periode hanya mengirim nama/tanggal.
  - Aktifkan periode lewat dialog konfirmasi dengan teks prototipe (situs publik langsung menampilkan periode; periode aktif lama otomatis nonaktif); `warnings` dari respons backend ditampilkan dan tombol aktivasi disembunyikan untuk periode yang sudah aktif.
  - Hapus periode: tombol dinonaktifkan dengan alasan untuk periode aktif; penolakan backend `409` (masih ada divisi/anggota/program) ditampilkan apa adanya.
  - Checklist periode tidak aktif: divisi sudah ada, anggota "dikelola di bagian Anggota" (data anggota belum dimuat di ORG-A), dan tombol aktifkan.
  - Divisi periode terpilih dimuat lewat `getAdminDivisions(periodId)`, diurutkan `sort_order` lalu nama; tabel menampilkan nama, deskripsi, urutan. State kosong: "Periode ini belum punya divisi" + tombol tambah/salin.
  - Tambah/ubah divisi (`FormDialog`: nama wajib, deskripsi opsional, urutan angka bulat ≥ 0) dan hapus divisi (`ConfirmDialog`, `409` backend ditampilkan).
  - Salin divisi: dialog memuat jumlah divisi tiap periode lain, hanya menampilkan periode sumber yang punya divisi, menampilkan ringkasan "X divisi disalin, Y dilewati" beserta nama yang dilewati; bila tidak ada sumber, tampil pesan informatif (bukan error).
  - Mode baca saja untuk akun tanpa `organization.manage`: banner singkat di atas halaman dan semua tombol tambah/ubah/hapus/aktifkan/salin dibungkus `Can`.
- **Cara error 409 ditampilkan:** semua pemanggilan tulis melempar `ApiError`; `features/organization/errors.ts` memprioritaskan `ApiError.detail` (fallback `Error.message`) sehingga pesan backend seperti "Periode tidak bisa dihapus: masih ada 9 divisi, 57 anggota, 1 program kerja" muncul di `ConfirmDialog`/`FormDialog` terkait, bukan pesan generik.
- **File dibuat:**
  - `frontend/app/(private)/(admin)/admin/organization/page.tsx`
  - `frontend/features/organization/errors.ts`
  - `frontend/features/organization/components/admin/OrganizationPrimitives.tsx`
  - `frontend/features/organization/components/admin/PeriodToolbar.tsx`
  - `frontend/features/organization/components/admin/PeriodFormDialog.tsx`
  - `frontend/features/organization/components/admin/PeriodActivateDialog.tsx`
  - `frontend/features/organization/components/admin/PeriodDeleteDialog.tsx`
  - `frontend/features/organization/components/admin/PeriodChecklist.tsx`
  - `frontend/features/organization/components/admin/DivisionsSection.tsx`
  - `frontend/features/organization/components/admin/DivisionFormDialog.tsx`
  - `frontend/features/organization/components/admin/DivisionDeleteDialog.tsx`
  - `frontend/features/organization/components/admin/DivisionCopyDialog.tsx`
- **File diubah:**
  - `frontend/app/(private)/(admin)/admin/dashboard/page.tsx`
  - `frontend/components/admin/shell/AdminSidebar.tsx`
  - `frontend/components/admin/shell/admin-navigation.tsx`
  - `frontend/STRUCTURE.md`
  - `docs/progress.md`
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npx tsc --noEmit` di `frontend/` — lulus tanpa output.
  - `npm run lint` di `frontend/` — lulus tanpa error/warning.
  - `npm run build` di `frontend/` — sukses, 10 route termasuk `/admin/organization`; warning Turbopack lockfile di luar repository tetap ada dan tidak menggagalkan build.
- **Konfirmasi batas scope:**
  - `Backend/`, `.env*`, dependency, API contract, auth/CSRF/RBAC, deployment: tidak diubah/dibaca.
  - `features/organization/admin-api.ts` dan `types.ts` tidak diubah; tidak ditemukan bug kontrak.
  - Halaman/komponen publik tidak diubah.
  - Commit/push/deploy: tidak.
- **Catatan/ambiguitas:**
  - Data anggota belum dimuat di ORG-A (sesuai batasan), jadi checklist anggota bersifat informatif; jumlah anggota per periode baru akan tersedia di batch Anggota.
  - Jumlah divisi periode sumber pada dialog salin diambil dengan memanggil `GET /divisions?period_id=` per periode saat dialog dibuka; tidak ada endpoint agregat.
- **Langkah berikutnya:** batch ORG-B (anggota/posisi/foto) dan penyesuaian UI lain menunggu instruksi pemilik.

---

### Sesi 2026-11-18 — Batch ORG-B: anggota dan foto pada halaman admin Struktur Organisasi

- **Status:** Selesai di working tree; tidak commit, push, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `3726581` (`feat(frontend): admin organization page — periods and divisions (ORG-A)`); working tree bersih sebelum batch.
- **Tujuan:** melengkapi `/admin/organization` dengan daftar anggota per divisi, pencarian nama, form anggota (`FormDialog`), unggah/ganti/hapus foto lewat `POST /media/images`, hapus anggota, dan checklist periode berbasis jumlah anggota sebenarnya, sesuai `Backend/docs/ORGANIZATION_API.md` dan prototipe `Design/admin/`.
- **Yang selesai:**
  - `MembersSection` di bawah `DivisionsSection`: anggota periode terpilih dikelompokkan per divisi (urut `sort_order` divisi lalu nama), ditambah grup "Tanpa divisi" bila ada `division_id = null`; di dalam grup urut `sort_order` anggota lalu nama. Setiap kartu menampilkan foto (atau inisial), nama, dan jabatan dari `getAdminPositions`.
  - Pencarian nama sederhana di sisi klien; saat pencarian aktif hanya grup yang memiliki hasil ditampilkan, lengkap dengan state "tidak ada yang cocok" dan tombol menampilkan semua. Pencarian direset saat periode berganti.
  - Tombol "Tambah anggota" di header dan di tiap grup divisi (mengisi `division_id` otomatis), "Ubah" per kartu, dan tombol "Hapus anggota" di form ubah yang membuka `ConfirmDialog` berisi nama anggota dan periode.
  - `MemberFormDialog`: nama wajib, jabatan (`Select` wajib dari `getAdminPositions`), divisi (`Select` opsional berisi hanya divisi periode terpilih + "Tanpa divisi"), urutan tampil (angka bulat ≥ 0), dan foto. Form tidak menampilkan pemilih periode karena periode mengikuti pilihan halaman.
  - Foto: `uploadImage()` mengompres di browser lalu menyimpan `storage_key` hasil respons ke `photo_url` (bukan URL/path). Pratinjau memakai `mediaPathFromStorageKey()` + `resolveMediaUrl()` untuk storage key; nilai `photo_url` lama berupa URL/path ditampilkan apa adanya lewat `resolveMediaUrl()`. Input `accept="image/jpeg,image/png,image/webp"`, validasi tipe file, status "Mengompres dan mengunggah foto...", dan error kompresi/upload berbahasa Indonesia (termasuk batas hasil kompresi 3,8 MB). Aksi ganti dan hapus (`photo_url: null`) tersedia.
  - Tanpa `media.manage`, area unggah/hapus diganti pemberitahuan seperti prototipe; foto lama tetap tampil dan field lain tetap dapat diubah.
  - `PeriodChecklist` kini memakai `memberCount`, `membersLoading`, dan `membersError`; langkah "Anggota sudah ada" ditandai selesai bila jumlah anggota > 0 dan menampilkan jumlah sebenarnya.
  - Pesan error backend tetap lewat `ApiError.detail` (`getOrganizationErrorMessage`), termasuk `404`/`400`/`409`, bukan pesan generik.
- **File dibuat:**
  - `frontend/features/organization/components/admin/MembersSection.tsx`
  - `frontend/features/organization/components/admin/MemberFormDialog.tsx`
  - `frontend/features/organization/components/admin/MemberPhotoField.tsx`
  - `frontend/features/organization/components/admin/MemberAvatar.tsx`
  - `frontend/features/organization/components/admin/MemberDeleteDialog.tsx`
- **File diubah:**
  - `frontend/app/(private)/(admin)/admin/organization/page.tsx`
  - `frontend/features/organization/components/admin/PeriodChecklist.tsx`
  - `frontend/STRUCTURE.md`
  - `docs/progress.md`
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npx tsc --noEmit` di `frontend/` — lulus tanpa output.
  - `npm run lint` di `frontend/` — lulus tanpa error/warning.
  - `npm run build` di `frontend/` — sukses; `/admin/organization` ikut ter-build (10 route). Warning Turbopack tentang lockfile di luar repository tetap muncul dan tidak menggagalkan build.
- **Konfirmasi batas scope:**
  - `Backend/`, `.env*`, dependency/lockfile, API contract, auth/CSRF/RBAC, deployment: tidak diubah/dibaca. Build hanya memuat environment lewat mekanisme Next biasa.
  - `features/organization/admin-api.ts` dan `types.ts` tidak diubah; tidak ditemukan bug kontrak.
  - Halaman/komponen publik dan komponen shared tidak diubah.
  - Commit/push/deploy: tidak.
- **Catatan/ambiguitas:**
  - Prototipe menampilkan grup divisi hanya bila sudah punya anggota; implementasi menampilkan semua divisi periode agar tombol "Tambah anggota" per divisi tersedia. Divisi kosong menampilkan teks "Belum ada anggota di divisi ini."
  - `photo_url` lama yang bukan storage key V2 (URL eksternal atau path lama) tetap didukung lewat `resolveMediaUrl()`; tidak ada migrasi data.
  - Bila daftar jabatan gagal dimuat, anggota tetap dapat dilihat, tetapi tombol tambah dinonaktifkan dan form menampilkan pesan; tidak ada endpoint retry khusus positions.
- **Langkah berikutnya:** menunggu instruksi pemilik untuk batch admin berikutnya.

---

### Sesi 2026-11-18 — Batch ACC: kelola akun administrator dan Akun saya

- **Status:** Selesai di working tree; tidak commit, push, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. HEAD `ed04418` (`feat(frontend): admin organization members and photo upload (ORG-B)`); tree bersih sebelum batch.
- **Tujuan:** menambahkan halaman Administrator `/admin/accounts` (khusus superadmin) dan Akun saya `/admin/account` (semua akun), memindahkan helper pesan error ke shared, serta menghubungkan menu dan tautan sidebar.
- **Yang selesai:**
  - **Helper error:** logika `features/organization/errors.ts` dipindahkan menjadi `getApiErrorMessage(error, fallback)` di `frontend/lib/api/errors.ts`; seluruh pemakaian di `features/organization/` dan halaman organisasi diperbarui, lalu file lama dihapus. Perilaku tetap: `ApiError.detail` diprioritaskan, lalu `Error.message`, lalu fallback.
  - **`/admin/accounts`:** dibungkus `RequirePermission superadminOnly`; daftar akun menampilkan username, badge **Superadmin** atau ringkasan label modul katalog (izin `always_granted` tidak dihitung), status aktif/nonaktif, login terakhir format Indonesia atau "Belum pernah login", serta badge "Anda" pada akun sendiri.
  - **Tambah/ubah akun:** `FormDialog` ukuran `xl`; username wajib 3–50 karakter; saat membuat akun ada kata sandi + konfirmasi minimal 12 karakter. Ubah akun menyediakan username, status aktif, superadmin, dan izin. Untuk akun sendiri, status aktif, superadmin, izin, dan reset password disembunyikan dengan keterangan "Ubah akun Anda sendiri lewat menu Akun saya".
  - **Checklist izin:** dibangun dari `getAdminPermissionCatalog()`; modul `available: false` tidak ditampilkan; izin `always_granted` tercentang, nonaktif, dan berlabel "Selalu diberikan". Mencentang izin memakai `applyPermissionImplications` sehingga izin turunan ikut tercentang. Izin turunan yang berasal dari izin lain ditandai "Otomatis dari izin lain yang dipilih" dan nonaktif selama izin induknya masih tercentang; saat induk dilepas, izin turunan murni ikut dilepas.
  - **Superadmin:** sakelar menampilkan keterangan "Superadmin memiliki semua izin, termasuk mengelola akun. Maksimal 2 akun." dan menyembunyikan checklist. Demosi mengirim daftar izin yang dipilih; promosi tidak mengirim izin.
  - **Reset password:** dialog terpisah hanya untuk akun lain, kata sandi baru + konfirmasi minimal 12 karakter. Sukses menampilkan "Password direset. Semua sesi akun ini telah diakhiri."
  - **Hapus akun:** `ConfirmDialog` hanya untuk akun lain dan menyebut username. Error `400`/`409` (batas superadmin, superadmin aktif terakhir, larangan akun sendiri, username duplikat) ditampilkan dari pesan backend lewat `getApiErrorMessage`.
  - **`/admin/account`:** tersedia untuk semua akun yang login tanpa izin khusus. Menampilkan username, peran (Superadmin/Pengurus), login terakhir, dan jumlah izin. Halaman ini **tidak** memanggil katalog izin.
  - **Ganti password:** field kata sandi saat ini, kata sandi baru, dan konfirmasi; validasi wajib, minimal 12 karakter, konfirmasi sama, dan baru ≠ lama. Error backend "Kata sandi lama salah" ditempatkan pada field kata sandi saat ini. Sukses menampilkan "Password diganti. N sesi lain telah diakhiri." memakai `sessions_revoked`, mengosongkan form, dan tidak logout.
  - **Navigasi:** item "Administrator" (`admins.view`) diarahkan ke `/admin/accounts`; blok akun di sidebar menaut ke `/admin/account` (username dan teks "Akun saya").
- **File dibuat:**
  - `frontend/app/(private)/(admin)/admin/accounts/page.tsx`
  - `frontend/app/(private)/(admin)/admin/account/page.tsx`
  - `frontend/features/accounts/format.ts`
  - `frontend/features/accounts/permissions.ts`
  - `frontend/features/accounts/components/admin/AccountsPrimitives.tsx`
  - `frontend/features/accounts/components/admin/AccountsList.tsx`
  - `frontend/features/accounts/components/admin/AccountFormDialog.tsx`
  - `frontend/features/accounts/components/admin/PermissionChecklist.tsx`
  - `frontend/features/accounts/components/admin/AccountPasswordResetDialog.tsx`
  - `frontend/features/accounts/components/admin/AccountDeleteDialog.tsx`
  - `frontend/features/auth/components/ChangePasswordForm.tsx`
- **File diubah:**
  - `frontend/lib/api/errors.ts`
  - `frontend/app/(private)/(admin)/admin/organization/page.tsx`
  - `frontend/features/organization/components/admin/DivisionCopyDialog.tsx`
  - `frontend/features/organization/components/admin/DivisionDeleteDialog.tsx`
  - `frontend/features/organization/components/admin/DivisionFormDialog.tsx`
  - `frontend/features/organization/components/admin/MemberDeleteDialog.tsx`
  - `frontend/features/organization/components/admin/MemberFormDialog.tsx`
  - `frontend/features/organization/components/admin/MemberPhotoField.tsx`
  - `frontend/features/organization/components/admin/PeriodActivateDialog.tsx`
  - `frontend/features/organization/components/admin/PeriodDeleteDialog.tsx`
  - `frontend/features/organization/components/admin/PeriodFormDialog.tsx`
  - `frontend/components/admin/shell/admin-navigation.tsx`
  - `frontend/components/admin/shell/AdminSidebar.tsx`
  - `frontend/STRUCTURE.md`
  - `docs/progress.md`
- **File dihapus:**
  - `frontend/features/organization/errors.ts`
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npx tsc --noEmit` di `frontend/` — lulus tanpa output.
  - `npm run lint` di `frontend/` — lulus tanpa error/warning.
  - `npm run build` di `frontend/` — sukses, 12 route termasuk `/admin/accounts` dan `/admin/account`. Warning Turbopack tentang `pnpm-lock.yaml` di luar repository tetap muncul dan tidak menggagalkan build.
- **Risiko/regresi yang diperiksa:**
  - Alur login/logout/refresh `AuthContext` tidak diubah.
  - Halaman Akun saya hanya memakai `useAuth()` dan `POST /auth/change-password`; tidak memanggil katalog izin.
  - Perubahan izin tidak memaksa login ulang; reset password dan perubahan status aktif/superadmin mengandalkan pencabutan sesi backend dan menampilkan pesan konfirmasi.
  - Link lama `/admin/admins` tidak lagi dipakai di navigasi; direktori kosong `admin/admins` tidak terlacak Git dan dibiarkan apa adanya.
- **Blocker/keputusan yang diperlukan:** Tidak ada blocker teknis.
- **Konfirmasi batas scope:**
  - `Backend/`, database/migration, dependency/lockfile, environment/deployment, dan `.env*`: tidak diubah atau dibaca isinya.
  - API contract/auth/CSRF/RBAC/cookie policy: tidak diubah.
  - Commit/push/merge/rebase/deploy: tidak.
- **Langkah berikutnya:** menunggu instruksi pemilik untuk batch admin berikutnya.

---

### Sesi 2026-11-18 — Batch PERM: `programs.view` untuk baca periode & divisi

- **Status:** Selesai di working tree; tidak commit, push, atau deploy.
- **Branch:** `feat/admin-ui-foundation`. Tree bersih sebelum batch.
- **Tujuan:** memungkinkan akun dengan izin `programs.view` (tanpa
  `organization.view`) membuka form Program kerja, yang membutuhkan daftar
  periode dan divisi.
- **Yang selesai:**
  - Menambahkan `require_any_permission(*permissions)` di
    `Backend/app/database/dependencies.py` dengan pola dan pesan `403` yang sama
    seperti `require_permission`.
  - `GET /admin/organization/periods` dan
    `GET /admin/organization/divisions` kini memakai
    `require_any_permission("organization.view", "programs.view")`. Endpoint
    anggota, posisi, dan seluruh mutasi tidak berubah.
  - Menambahkan test akun dengan izin langsung `["programs.view"]` saja:
    periods `200`, divisions `200`, members `403`, positions `403`, dan
    POST periods `403`.
  - Mengganti pesan teknis di halaman Program kerja menjadi
    "Daftar periode tidak bisa dimuat. Coba muat ulang halaman." tanpa mengubah
    logika pemuatan periode.
  - Mencatat akses lintas modul pada `ORGANIZATION_API.md` dan `ADMIN_API.md`.
- **File diubah:**
  - `Backend/app/database/dependencies.py`
  - `Backend/app/routers/organization.py`
  - `Backend/tests/test_organization.py`
  - `Backend/docs/ORGANIZATION_API.md`
  - `Backend/docs/ADMIN_API.md`
  - `frontend/app/(private)/(admin)/admin/programs/page.tsx`
  - `docs/progress.md`
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `Backend/.venv` → `python -m pytest -q` — 224 passed, 37 warnings
    (baseline 223 + 1 test baru).
  - `Backend/.venv` → `python -m alembic check` — "No new upgrade operations
    detected."
  - `frontend/` → `npx tsc --noEmit` — lulus tanpa output.
  - `frontend/` → `npm run lint` — lulus tanpa error/warning.
- **Risiko/regresi yang diperiksa:**
  - Hanya dua endpoint baca yang memperoleh izin alternatif; posisi, anggota,
    dan semua endpoint tulis tetap memakai `organization.view`/
    `organization.manage`.
  - `programs.view` tidak mengimplikasikan `organization.view`, sehingga test
    benar-benar menguji jalur izin alternatif.
  - Pesan frontend diganti tanpa mengubah kondisi render atau alur data.
- **Blocker/keputusan yang diperlukan:** Tidak ada blocker teknis.
- **Konfirmasi batas scope:**
  - Backend berubah: Ya — hanya dependency, dua endpoint baca, test, dan
    dokumentasi sesuai instruksi.
  - Database/schema/migration berubah: Tidak.
  - Dependency/lockfile/environment/`.env*`/deployment berubah atau dibaca:
    Tidak.
  - Commit/push/merge/rebase/deploy: Tidak.
- **Langkah berikutnya:** menunggu instruksi pemilik untuk batch berikutnya.

---

## 3. Historical Archive

> **Arsip historis.** Entri di bawah ini dibuat sebelum 11 November 2026 dan memakai referensi desain yang sudah deprecated. Keputusan visual di dalamnya (token, font, layout, komposisi) **tidak berlaku**. Fakta teknis (dependency, kontrak API, hasil validasi, konfigurasi) hanya berlaku jika masih sesuai dengan source code terkini; verifikasi ulang sebelum dipakai. Jangan melanjutkan tugas atau "langkah berikutnya" dari entri ini tanpa konfirmasi. Untuk koreksi yang sudah diketahui, lihat Current Project State bagian Koreksi.

## Pemberitahuan — Perubahan Acuan Desain (11 November 2026)

Mulai 11 November 2026, seluruh referensi desain `HIMATKN_Public_Design_Reference` dan `HIMATKN_Admin_Panel_Design_Reference` dinyatakan deprecated dan tidak lagi menjadi acuan visual maupun implementasi.

Arah visual aktif menggunakan **HIMATKN V1 versi terbaru** yang disediakan oleh pemilik proyek dan ditempatkan di folder `Design/`.

Seluruh catatan pekerjaan sebelum tanggal ini tetap dipertahankan sebagai riwayat historis, tetapi keputusan desain, token visual, layout, komponen, dan aturan UI di dalamnya tidak boleh digunakan sebagai acuan aktif apabila bertentangan dengan HIMATKN V1 terbaru.

Untuk acuan aktif, baca:
- `docs/HIMATKN_V1_REDESIGN_GUIDE.md`
- `docs/DESIGN_REFERENCE_GUIDE.md`
- `Design/README.md`

Source code frontend V2 tetap menjadi sumber kebenaran untuk arsitektur, route, API, tipe data, autentikasi, dan perilaku teknis.

---

## Kondisi awal paket konteks

- **Tanggal paket:** 2026-10-27
- **Status:** Konteks kerja disiapkan; belum ada perubahan kode aplikasi yang dilakukan oleh paket ini.
- **Scope yang disetujui:** Frontend-only. Tidak menyentuh backend FastAPI, database TiDB, schema/migration, auth/security backend, environment secret, konfigurasi deployment, atau deployment.
- **Design reference yang disiapkan:** `HIMATKN_Public_Design_Reference/` dan `HIMATKN_Admin_Panel_Design_Reference/` (extract isi `design_references.zip` di root repository).
- **Langkah berikut:** Pastikan working tree lokal aman; lakukan audit awal tanpa mengubah kode; bandingkan frontend saat ini dengan referensi; tetapkan satu batch implementasi prioritas.

## Baseline repository yang diketahui (snapshot 2026-10-27)

Informasi ini berasal dari audit repo remote dan dapat berubah. Agent harus verifikasi ulang dari source lokal sebelum bertindak.

- Default branch: `main`.
- Commit `main` yang terakhir diperiksa: `4a68c61eaec7c9d61494958eb0baccb5576bbdd0` (`add lucide-react package and atomic design for future`).
- Deployment production Vercel yang terakhir diperiksa berstatus `READY` dan menggunakan SHA yang sama dengan `main` pada waktu audit.
- Branch remote `refactor/stabilize-api-client` saat terakhir diperiksa berada **8 commit di belakang `main` dan 0 commit di depan**. Hindari menjadikannya basis kerja baru tanpa mengecek perbandingan lagi.
- `frontend/package.json` pada baseline memakai Next.js `16.3.2`, React `19.2.8`, Tailwind CSS v4, TypeScript 5, ESLint 9, serta `lucide-react` `^1.57.0`.
- Script yang tercantum: `dev`, `build`, `start`, `lint`. Verifikasi script lokal sebelum menjalankan pemeriksaan.
- Implementasi `FormDialog.tsx` dan `ConfirmDialog.tsx` sudah ada dan digunakan di alur Programs. Periksa dan reuse sebelum membuat dialog baru.
- Admin Programs memiliki alur CRUD di UI. Halaman News yang diperiksa hanya menampilkan list/filter dan belum mengaktifkan create/action (`canCreate={false}`); audit ulang sebelum mengubahnya.
- Pada baseline yang diperiksa, file berikut di `frontend/components/ui/` kosong: `Button.tsx`, `FormField.tsx`, `Input.tsx`, `Select.tsx`. Verifikasi lagi di lokal; jangan menganggap placeholder ini sebagai komponen yang siap dipakai.

## Catatan sesi kerja

### Sesi 0 — Menyiapkan aturan dan konteks

- **Status:** Selesai untuk paket dokumen; belum ada implementasi aplikasi.
- **Dikerjakan:** Membuat `AGENTS.md`, dokumen konteks frontend, panduan design reference, arsitektur frontend, dan prompt audit awal.
- **Pemeriksaan:** Isi ZIP design reference diperiksa; README public/admin dan token CSS ditinjau.
- **Perubahan aplikasi:** Tidak ada.
- **Berikutnya:** Taruh file yang sesuai di root repo lokal dan jalankan audit awal OpenCode pada working tree yang benar.

---

### Sesi 2026-10-27 — Audit awal frontend (tanpa implementasi)

- **Status:** Selesai untuk audit; tidak ada implementasi aplikasi.
- **Branch:** `feat/admin-ui-foundation`; `git status --short` bersih sebelum dan sesudah pemeriksaan.
- **Tujuan batch:** memetakan route/layout/UI/API/design gap dan menetapkan rencana batch awal.
- **Yang selesai:**
  - Audit route/layout aktual, shell admin, komponen shared/duplikat, dan file placeholder.
  - Verifikasi kontrak API read-only dari router FastAPI; tidak mengubah backend/DB.
  - Perbandingan public/admin dengan HTML reference.
  - Menjalankan lint dan production build.
- **File yang diubah:**
  - `progress.md` (hanya catatan sesi ini).
- **Pemeriksaan yang dijalankan + hasil:**
  - `git status --short`: bersih; branch `feat/admin-ui-foundation`.
  - `npm run lint`: PASS (tidak ada output error).
  - `npm run build`: PASS (Next.js 16.3.2; route statis: `/`, `/login`, `/admin/dashboard`, `/admin/news`, `/admin/programs`, `/robots.txt`, `/sitemap.xml`, `_not-found`).
  - Grep frontend: tidak ditemukan `localStorage`, `sessionStorage`, `console.*`, `document.cookie`, atau `Authorization`/`Bearer`.
  - `frontend/.env.local` terdeteksi oleh build sebagai environment, tetapi isinya tidak dibaca/dicetak; file ini di-ignore dan tidak tracked.
  - Build memberi warning Turbopack root karena ada `package-lock.json` di luar repository (`C:\Users\faqih`); build tetap sukses.
- **Temuan utama:**
  - Public site belum terbangun; `/` masih placeholder health-check.
  - Belum ada public organization/visits service; response organization berbeda dari pola `{items}`.
  - Media URL backend relatif; belum ada resolver ke origin API.
  - Risiko auth cross-origin (CORS/cookie SameSite) belum bisa diverifikasi tanpa konfirmasi origin/environment.
  - Bug admin: tombol tambah program bisa no-op, halaman kosong setelah hapus di halaman terakhir tidak punya tombol kembali, kolom Aksi berita kosong, error auth/API belum dibedakan.
  - Gap desain utama: token/font public-admin, shell admin putih/zinc vs hijau gelap/cream, login dan state 403/404/429/503 belum ada.
- **Risiko/regresi yang diperiksa:**
  - Tidak ada file tracked yang berubah selain `progress.md`; build menghasilkan artefak yang tidak di-track.
  - Backend, database, dependency, dan konfigurasi tidak diubah.
- **Blocker/keputusan yang diperlukan:**
  - Konfirmasi origin frontend/backend, format `NEXT_PUBLIC_API_URL` (harus mencakup `/api/v1`), dan kebijakan cookie/CORS untuk admin.
  - Konfirmasi apakah daftar program publik boleh menampilkan semua status (backend tidak memfilter status).
  - Konfirmasi apakah News CRUD (create/edit/delete) masuk batch awal atau ditunda.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - Secret/kredensial diekspos: Tidak
- **Langkah berikutnya:**
  - Setelah konfirmasi blocker, mulai Batch 1: fondasi token/typography + public shell + beranda + 404, lalu lint/build dan cek mobile.

---

### Sesi 2026-10-28 — Batch 1: Frontend foundation

- **Status:** Selesai untuk Batch 1; tidak melanjutkan ke Batch 2.
- **Branch:** `feat/admin-ui-foundation`; sebelum implementasi working tree hanya memiliki perubahan `progress.md` dari sesi audit.
- **Tujuan batch:** fondasi token/typography, public shell, beranda, dan halaman 404 yang konsisten dengan design reference.
- **Yang selesai:**
  - Menetapkan token public (hijau/cream/gold, serif Cormorant Garamond, sans Manrope) dan scope typography admin (Playfair Display/Inter) melalui `.admin-theme`.
  - Menambahkan public layout dengan skip link, header responsif, menu mobile yang bisa ditutup dengan Escape, dan footer.
  - Mengganti placeholder beranda dengan hero, tentang, program kerja, publikasi, struktur, dan penutup yang responsif.
  - Menambahkan custom global 404, skeleton loading public, dan metadata/route metadata yang tidak menunjuk ke halaman yang belum ada.
  - Menambahkan resolver URL media relatif dari backend dan state error/empty publikasi.
  - Mengimplementasikan `Button`/`ButtonLink` karena dipakai nyata; file UI placeholder lain tidak diisi.
  - Membersihkan `sitemap.ts` dan `robots.ts` dari rute yang tidak tersedia (`/tentang`, `/auth-test`).
- **File yang ditambah:**
  - `frontend/app/(public)/layout.tsx`
  - `frontend/app/(public)/loading.tsx`
  - `frontend/app/not-found.tsx`
  - `frontend/components/public/BrandMark.tsx`
  - `frontend/components/public/PublicImage.tsx`
  - `frontend/components/public/PublicationsSection.tsx`
  - `frontend/components/public/RefreshButton.tsx`
  - `frontend/components/public/SiteFooter.tsx`
  - `frontend/components/public/SiteHeader.tsx`
  - `frontend/lib/api/media.ts`
- **File yang diubah:**
  - `frontend/app/globals.css`
  - `frontend/app/layout.tsx`
  - `frontend/app/(public)/page.tsx`
  - `frontend/app/sitemap.ts`
  - `frontend/app/robots.ts`
  - `frontend/components/ui/Button.tsx`
  - `frontend/lib/api/client.ts`
  - `frontend/lib/public/news.ts`
  - `frontend/components/admin/shell/AdminShell.tsx`
  - `frontend/app/(private)/(admin)/layout.tsx`
  - `frontend/app/(private)/(auth)/login/page.tsx`
  - `progress.md`
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm run lint`: PASS, tanpa output error.
  - `npm run build`: PASS. Route `/` menjadi dynamic (`ƒ`) karena beranda mengambil berita publik; route admin/login/robots/sitemap tetap static.
  - Chrome headless/CDP pada viewport 360, 768, dan 1280 px: `document.documentElement.scrollWidth` sama dengan viewport; tidak ada elemen overflow; menu mobile terbuka, tertutup lewat Escape, dan menutup setelah link diklik.
  - Chrome/CDP: computed font public = Manrope/Cormorant Garamond; heading login admin = Playfair Display.
  - `curl` ke URL acak mengembalikan status `404` dengan konten halaman 404 kustom.
  - Beranda lokal dirender dengan error state publikasi karena backend API tidak berjalan saat validasi; tidak ada data berita fiktif yang ditampilkan.
- **Risiko/regresi yang diperiksa:**
  - Perubahan token warna/heading global berpotensi memengaruhi admin. Scope `.admin-theme` sudah dipasang pada shell admin, layout loading admin, dan login; halaman admin yang membutuhkan autentikasi belum bisa diperiksa visual setelah login.
  - Beranda sekarang bergantung pada API publik saat runtime. Jika `NEXT_PUBLIC_API_URL` salah/tidak menjangkau backend, beranda menampilkan error state yang jujur, bukan data palsu.
  - Resolver media `frontend/lib/api/media.ts` belum diuji dengan URL media nyata karena API tidak berjalan saat validasi.
  - `apiFetch` tetap memakai kontrak yang sama; perubahan hanya membuat resolusi `NEXT_PUBLIC_API_URL` menjadi lazy agar import tidak langsung gagal saat build.
  - Section program kerja sengaja tidak memanggil API karena aturan status/visibilitas belum dikonfirmasi. Section struktur juga belum menampilkan data organisasi pada batch ini.
  - Build mengeluarkan warning Turbopack lama tentang `package-lock.json` di luar repository (`C:\Users\faqih`); warning tidak berasal dari patch ini dan tidak menggagalkan build.
- **Blocker/keputusan yang diperlukan:**
  - Konfirmasi origin frontend/backend, isi/format `NEXT_PUBLIC_API_URL` (harus mencakup `/api/v1`), serta kebijakan cookie/CORS admin cross-site.
  - Konfirmasi aturan status/visibilitas `GET /api/v1/public/programs` sebelum data program ditampilkan.
  - Konfirmasi apakah data organisasi akan ditampilkan di Batch 2 dan perilaku saat tidak ada periode aktif.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - Secret/kredensial diekspos: Tidak
  - Commit/push/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau hasil lokal dan konfirmasi blocker di atas.
  - Jika disetujui, lanjutkan Batch 2 secara terpisah: halaman publik berbasis route (`/tentang`, `/publikasi`, detail publikasi, `/struktur`) dengan kontrak API yang sudah diverifikasi.

---

### Sesi 2026-10-29 — Batch 1.1: Figma alignment pass

- **Status:** Selesai untuk Batch 1.1; tidak memulai Batch 2.
- **Branch:** `feat/admin-ui-foundation`; perubahan Batch 1 sebelumnya tetap belum di-commit.
- **Tujuan batch:** menyelaraskan homepage publik dengan `HIMATKN_Public_Figma_Reference` tanpa mengubah backend, database, API contract, auth, atau deployment.
- **Yang selesai:**
  - Header publik dibuat overlay di atas hero, dengan brand ringkas, lima nav sesuai Figma (Beranda, Tentang, Program Kerja, Struktur, Kontak), dan menu mobile yang bisa ditutup dengan Escape.
  - Hero memakai foto grup yang ditemukan di aset lokal repository, overlay hijau gelap, heading Playfair Display uppercase, tagline Kabinet Nexus, dan dua CTA ke section yang benar-benar ada.
  - Tipografi publik diselaraskan ke Space Grotesk, Playfair Display, JetBrains Mono, Crimson Text, dan Inter; tipografi admin tetap Playfair Display/Inter melalui `.admin-theme`.
  - Palet diselaraskan dengan nilai Figma; varian `gold-ink`, `ink-soft`, dan `on-dark-soft` dipakai agar teks normal memenuhi WCAG AA.
  - Section Tentang diubah menjadi intro editorial + tiga kolom fokus dengan garis tipis, tanpa ikon dekoratif.
  - Section Program Kerja memakai permukaan hijau gelap dan placeholder jujur; tidak mengambil atau menampilkan data program yang belum terverifikasi.
  - Section Publikasi diubah menjadi baris editorial dengan gambar, judul, tanggal, dan state loading/empty/error yang berbeda; gambar rusak/kosong jatuh ke fallback.
  - Section Struktur memakai tabel bergaris di desktop dan ringkasan ringkas di mobile; tidak ada nama pengurus, jumlah divisi, atau periode yang dikarang.
  - Section penutup/Kontak memakai bidang hijau gelap dan dua CTA; detail email, sekretariat, dan peta sengaja ditandai “Menunggu verifikasi”.
  - Footer diselaraskan menjadi garis legal + tautan “Kembali ke atas”.
  - Loading skeleton dan halaman 404 disesuaikan dengan komposisi baru; masalah cascade global pada warna tautan dan margin heading diperbaiki agar CTA dan menu mobile tidak kehilangan kontras.
- **File yang ditambah:**
  - `frontend/public/images/hero-group.jpg`
  - `docs/validation/batch-1.1/` (screenshot dan `browser-report.json`)
- **File yang diubah pada sesi ini:**
  - `frontend/app/layout.tsx`
  - `frontend/app/globals.css`
  - `frontend/app/(public)/layout.tsx`
  - `frontend/app/(public)/page.tsx`
  - `frontend/app/(public)/loading.tsx`
  - `frontend/app/not-found.tsx`
  - `frontend/components/public/SiteHeader.tsx`
  - `frontend/components/public/SiteFooter.tsx`
  - `frontend/components/public/PublicationsSection.tsx`
  - `frontend/components/public/PublicImage.tsx`
  - `frontend/components/ui/Button.tsx`
  - `progress.md`
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm run lint`: PASS, tanpa output error.
  - `npm run build`: PASS. `/` tetap dynamic (`ƒ`); admin/login/metadata tetap static. Build mengeluarkan warning Turbopack lama tentang lockfile di luar repository, tetapi build sukses.
  - `git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada file yang sudah ada.
  - Chrome headless/CDP pada 360, 390, 768, dan 1280 px: `scrollWidth` sama dengan `clientWidth`, tidak ada elemen overflow, dan seluruh anchor `#` menemukan target.
  - Menu mobile: `aria-expanded=true` dan panel tampil setelah dibuka; kembali `false` dan panel tertutup setelah Escape. Screenshot menu terbuka tersedia.
  - Font publik terverifikasi di browser: Space Grotesk pada body, Playfair Display pada heading, JetBrains Mono pada kicker/meta, Crimson Text pada judul publikasi.
  - API publik lokal dapat dijangkau saat validasi; beranda menampilkan satu item berita nyata dan media `1200x800` berhasil di-resolve.
  - State publikasi diuji dengan build sementara dan API mock lokal: empty state menampilkan “Belum Ada Berita Terbaru”; error state menampilkan `role="alert"` dan tombol “Coba lagi”. Build final dikembalikan ke konfigurasi proyek dan kembali memuat berita nyata.
  - Fallback gambar rusak diuji dengan memicu event `error`: elemen `<img>` diganti fallback ikon, bukan gambar rusak.
  - Kontras teks normal yang diukur: ink/paper `14.35:1`, soft ink/paper `5.89:1`, gold ink/paper `4.76:1`, on-dark/green `14.58:1`, on-dark-soft/green `6.92:1`, button text/gold `6.56:1`.
  - Login admin masih memakai Playfair Display untuk heading dan Inter untuk input; tidak ada overflow pada 1280 px. Halaman admin setelah login belum diperiksa karena tidak ada kredensial/sesi.
- **Screenshot validasi:**
  - `docs/validation/batch-1.1/home-360-full.png`
  - `docs/validation/batch-1.1/home-390-full.png`
  - `docs/validation/batch-1.1/home-768-full.png`
  - `docs/validation/batch-1.1/home-1280-full.png`
  - `docs/validation/batch-1.1/home-390-menu-open.png`
  - `docs/validation/batch-1.1/not-found-1280.png`
  - `docs/validation/batch-1.1/login-1280.png`
- **Blocker/keputusan yang diperlukan:**
  - Logo asli HIMATKN belum ditemukan sebagai aset sumber; `BrandMark` geometris yang sudah ada dipertahankan sementara. Diperlukan file logo resmi dari pemilik organisasi.
  - Email, alamat sekretariat, dan tautan peta belum diverifikasi; jangan publikasikan nilai dari fixture Figma sebelum dikonfirmasi.
  - Aturan status/visibilitas `GET /api/v1/public/programs` dan perilaku organisasi tanpa periode aktif masih belum dikonfirmasi; karena itu program dan struktur belum mengambil API.
  - Halaman detail publikasi belum ada; aksi baris publikasi ditampilkan sebagai “Detail segera hadir”, bukan tautan mati. List API juga belum menyediakan excerpt, sehingga baris publikasi hanya memuat judul dan tanggal.
  - Tahun/periode “2026” dan contoh program dari Figma tidak ditampilkan sebagai data resmi.
  - Provenance dan hak pakai foto hero yang ditemukan di storage lokal perlu dikonfirmasi pemilik.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - Secret/kredensial diekspos: Tidak
  - Commit/push/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau screenshot dan blocker di atas.
  - Setelah logo/kontak/visibilitas data dikonfirmasi, lanjutkan Batch 2 pada route publik terpisah dan integrasi API yang sudah disetujui.

---

### Sesi 2026-10-29 — Targeted visual polish (hero, program empty state, struktur)

- **Status:** Selesai untuk targeted polish; tidak memulai Batch 2.
- **Branch:** `feat/admin-ui-foundation`; seluruh perubahan tetap belum di-commit.
- **Tujuan:** melakukan koreksi visual terbatas setelah review screenshot Batch 1.1, tanpa redesign global atau perubahan kontrak API.
- **Yang selesai:**
  - Hero desktop dipisahkan dari komposisi mobile. Pada 1280 px hero setinggi 600 px, heading dua baris berukuran 33.92 px/36.63 px, dan CTA dibuat lebih ringkas (40 px) tanpa menghilangkan target sentuh mobile.
  - Hero mobile pada 390 px setinggi 748 px (712 px pada 360 px), heading empat baris berukuran 24 px/33 px, tagline dua baris, dan dua CTA ditumpuk dengan target sentuh 44 px.
  - Section Program Kerja sekarang memakai surface cream dan panel empty-state bergaris tipis, bukan section hijau gelap bergaya populated. Tidak ada tahun/periode, program contoh, atau panggilan ke endpoint program.
  - Section Struktur memakai komposisi tabel Figma: baris BPH penuh, dua sel Divisi/Periode aktif, lalu ringkasan dua metrik. Semua nilai tetap "Belum diverifikasi"; tidak ada nama, jumlah divisi, atau periode fiktif.
  - Di mobile, grid struktur diringkas menjadi kartu ringkasan yang tetap memuat kedua metrik dan CTA.
- **File yang diubah:**
  - `frontend/app/(public)/page.tsx`
  - `frontend/app/globals.css`
  - `progress.md`
- **File validasi baru:**
  - `docs/validation/batch-1.2/browser-report.json`
  - `docs/validation/batch-1.2/publication-states.json`
  - `docs/validation/batch-1.2/home-360-full.png`
  - `docs/validation/batch-1.2/home-390-full.png`
  - `docs/validation/batch-1.2/home-768-full.png`
  - `docs/validation/batch-1.2/home-1280-full.png`
  - `docs/validation/batch-1.2/home-390-hero.png`
  - `docs/validation/batch-1.2/home-1280-hero.png`
  - `docs/validation/batch-1.2/login-1280.png`
  - `docs/validation/batch-1.2/dashboard-unauth-1280.png`
  - `docs/validation/batch-1.2/not-found-1280.png`
  - `docs/validation/batch-1.2/publications-empty-390.png`
  - `docs/validation/batch-1.2/publications-error-390.png`
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm run lint`: PASS, tanpa output error.
  - `npm run build`: PASS. Route `/` tetap dynamic; build mengeluarkan warning Turbopack lama tentang lockfile di luar repository, bukan error.
  - `git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada file yang sudah ada.
  - Playwright/Chrome production build pada 360, 390, 768, dan 1280 px: `scrollWidth` sama dengan `clientWidth`, tidak ada overflow, dan seluruh 18 tautan hash menemukan target section.
  - Klik CTA `#program` dan menu mobile ke `#struktur` berhasil menggulir ke target; menu mobile tertutup setelah navigasi, dan Escape menutup panel menu.
  - Publication happy path memuat satu berita nyata dari API dan gambar `1200x800` berhasil di-resolve. Empty state dan error state diuji lewat route validasi sementara yang kemudian dihapus: empty menampilkan "Belum Ada Berita Terbaru", error memiliki `role="alert"` dan tombol "Coba lagi", keduanya tanpa overflow pada 390 px.
  - `/login` dapat diakses tanpa sesi dan tetap memakai Playfair Display untuk heading serta Inter untuk input. `/admin/dashboard` tanpa sesi diarahkan kembali ke `/login`. Dashboard setelah login tidak diperiksa karena kredensial/sesi tidak tersedia.
  - Halaman 404 kustom tetap memakai shell publik, lebar 1280 px, dan tidak overflow.
- **Keputusan visual yang perlu ditinjau:**
  - File referensi `programs-empty-state-desktop.png` memakai surface cream, sedangkan `programs-empty-state-mobile.png` memakai surface hijau gelap. Implementasi memakai surface cream pada kedua lebar sesuai arahan untuk tidak mempertahankan section program populated yang hijau gelap. Jika varian mobile gelap memang diinginkan, keputusan itu perlu dikonfirmasi terpisah.
  - Skala heading section lain tidak diubah; polish ini fokus pada proporsi hero, state kosong program, dan grid struktur.
- **Blocker/risiko yang masih ada:**
  - Logo asli, detail kontak, dan hak pakai foto hero masih menunggu konfirmasi pemilik.
  - Aturan status/visibilitas `GET /api/v1/public/programs` dan perilaku organisasi tanpa periode aktif belum dikonfirmasi.
  - Halaman detail publikasi belum tersedia; aksi detail masih berupa label "Detail segera hadir".
  - Pemeriksaan halaman admin setelah login belum dapat dilakukan tanpa sesi.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - API contract berubah: Tidak
  - Secret/kredensial diekspos: Tidak
  - Commit/push/merge/rebase/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau screenshot Batch 1.2 dan konfirmasi keputusan surface empty-state program mobile.
  - Lanjutkan Batch 2 hanya setelah logo, kontak, foto, dan aturan visibilitas data disetujui.

---

### Sesi 2026-10-29 - Koreksi visual empty state program mobile (Batch 1.2)

- **Status:** Selesai; tidak memulai Batch 2.
- **Branch:** `feat/admin-ui-foundation`; seluruh perubahan tetap belum di-commit.
- **Tujuan:** menyelaraskan surface empty state Program Kerja pada mobile dengan `programs-empty-state-mobile.png`, tanpa mengubah state desktop, data program, atau kontrak API.
- **Yang selesai:**
  - Section Program Kerja diberi penanda `program-section`. Pada viewport maksimal 640 px, surface berubah menjadi hijau gelap (`--green-950`) sesuai varian referensi mobile; desktop tetap cream (`--paper`) tanpa perubahan komposisi.
  - Warna teks mobile diselaraskan untuk surface gelap: heading dan judul panel memakai `--on-dark`, body copy memakai `--on-dark-soft`, kicker dan CTA memakai `--gold-bright`. Hover/focus CTA berubah ke `--on-dark` agar tetap terbaca.
  - Border panel mobile memakai `rgba(241, 238, 228, 0.4)` dan focus ring memakai `--gold-bright`, sehingga batas panel dan indikator fokus tetap terlihat pada surface gelap.
  - Tidak ada data program contoh, tahun/periode fiktif, atau panggilan ke endpoint program. Komponen populated tidak diubah karena belum ada data program yang disetujui.
- **File yang diubah:**
  - `frontend/app/(public)/page.tsx`
  - `frontend/app/globals.css`
  - `progress.md`
- **File validasi baru/diperbarui:**
  - `docs/validation/batch-1.2/program-tone-report.json`
  - `docs/validation/batch-1.2/program-empty-390.png`
  - `docs/validation/batch-1.2/program-empty-1280.png`
  - `docs/validation/batch-1.2/home-360-full.png`
  - `docs/validation/batch-1.2/home-390-full.png`
  - `docs/validation/batch-1.2/home-768-full.png`
  - `docs/validation/batch-1.2/home-1280-full.png`
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm run lint`: PASS, tanpa output error.
  - `npm run build`: PASS. Route `/` tetap dynamic; warning Turbopack lama tentang lockfile di luar repository tetap muncul, bukan error.
  - `git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada file yang sudah ada.
  - Playwright/Chrome pada 360, 390, 768, dan 1280 px: `scrollWidth` sama dengan `clientWidth`, tidak ada overflow, dan seluruh tautan hash menemukan target.
  - Pada 390 px, section Program Kerja terukur `rgb(6, 38, 27)` (hijau gelap); pada 768 dan 1280 px tetap `rgb(246, 244, 236)` (cream). Screenshot elemen program tersedia pada 390 dan 1280 px.
  - Menu mobile: terbuka dengan `aria-expanded=true`, tertutup dengan Escape, dan tautan Program Kerja menutup menu serta menghasilkan hash `#program`.
  - Publikasi masih memuat satu berita nyata dari API lokal dan gambar `1200x800` berhasil di-resolve. Tidak ada request ke endpoint program dan tidak ada console error pada keempat viewport.
  - Kontras state mobile: heading `13.88:1`, body copy `6.59:1`, CTA `9.11:1`, focus ring `9.11:1`, dan border panel `3.34:1`. State desktop tidak diubah.
- **Keputusan yang diselesaikan:**
  - Varian surface empty state program mobile kini mengikuti referensi hijau gelap; desktop tetap cream.
- **Blocker/risiko yang masih ada:**
  - Logo asli, detail kontak, dan hak pakai foto hero masih menunggu konfirmasi pemilik.
  - Aturan status/visibilitas `GET /api/v1/public/programs` dan perilaku organisasi tanpa periode aktif belum dikonfirmasi; endpoint tetap tidak dipanggil.
  - Halaman detail publikasi belum tersedia; aksi detail masih berupa label "Detail segera hadir".
  - Pemeriksaan halaman admin setelah login belum dapat dilakukan tanpa sesi.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - API contract berubah: Tidak
  - Secret/kredensial diekspos: Tidak
  - Commit/push/merge/rebase/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau screenshot koreksi mobile ini.
  - Lanjutkan Batch 2 hanya setelah logo, kontak, foto, dan aturan visibilitas data disetujui.

---

### Sesi 2026-10-29 - Perbaikan build Vercel Google Fonts (Next.js 16.4.3)

- **Status:** Selesai; tidak commit, push, atau deploy.
- **Commit dasar:** `c2919f1c066f73e61488dffa7f4c434a25ee5ef8`.
- **Branch:** `feat/admin-ui-foundation`.
- **Masalah:** Vercel gagal pada `next/font/google` Playfair Display melalui Turbopack dengan error `Can't resolve '@vercel/turbopack-next/internal/font/google/font` dan `next/font/google queries have exactly one entry`.
- **Verifikasi rilis:**
  - `npm view next@16.4.3` menunjukkan `16.4.3` sebagai dist-tag `latest` dan versi stabil.
  - Catatan rilis resmi Next.js `v16.4.3` memuat perbaikan "Fix extensionless Google font URLs in both bundlers" (PR #100277), yaitu area kegagalan yang sama.
  - Peer dependency Next.js 16.4.3 menerima React `^18.2.0 || ^19.0.0`; React proyek tetap `19.2.8` dan tidak diubah.
  - Next.js 16.4.3 membutuhkan Node `>=20.9.0`; validasi lokal memakai Node `24.22.1`.
  - `frontend/next.config.ts` tetap kosong dan tidak diubah.
- **Perubahan dependency:**
  - Sebelum: `next` `16.3.2`, `eslint-config-next` `16.3.2`.
  - Sesudah: `next` `16.4.3`, `eslint-config-next` `16.4.3`.
  - React dan React DOM tetap `19.2.8`.
  - Package manager proyek adalah npm (`frontend/package-lock.json`, lockfile v3). Tidak ada lockfile kedua yang dibuat.
  - Perubahan lockfile hanya untuk Next.js, paket `@next/*`, `eslint-config-next`, `sharp`/libvips, dan `fastq` sebagai transitive dependency yang ikut berubah.
- **File yang diubah:**
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `progress.md`
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm ci`: berhasil setelah dev server lama dihentikan; 359 paket terpasang dari lockfile. npm melaporkan 4 high severity vulnerability yang tidak diperbaiki karena di luar scope perubahan ini.
  - `npm run lint`: PASS, tanpa output error.
  - `.next` dihapus sebelum build agar tidak memakai cache lama.
  - `npm run build`: PASS dengan `Next.js 16.4.3 (Turbopack)`, compile sukses, TypeScript sukses, dan seluruh route existing terbentuk. Tidak ada error `next/font/google`.
  - Build masih menampilkan warning lama tentang `pnpm-lock.yaml` di luar repository (`C:\Users\faqih`). File tersebut bukan lockfile proyek dan tidak dipakai; warning tidak menggagalkan build.
  - `git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF.
  - Playwright/Chrome pada production build bersih di 1280 px: lima keluarga font publik termuat (`Space Grotesk`, `Playfair Display`, `JetBrains Mono`, `Crimson Text`, `Inter`), `document.fonts.status` bernilai `loaded`, dan tidak ada overflow (`scrollWidth === clientWidth`).
  - Tampilan font publik tidak berubah: body memakai Space Grotesk, heading memakai Playfair Display, tagline memakai Inter, kicker memakai JetBrains Mono, dan judul publikasi memakai Crimson Text.
  - `/login` tetap memakai Playfair Display untuk heading dan Inter untuk input, tanpa overflow. `/admin/dashboard` tanpa sesi tetap diarahkan ke `/login`.
  - Pemeriksaan login lokal sempat mencatat error CORS `auth/me` dari backend lokal pada origin port validasi; ini bukan regresi font dan konfigurasi CORS tidak diubah.
- **Keputusan teknis:**
  - Upgrade versi dipilih karena changelog resmi 16.4.3 secara eksplisit memperbaiki resolusi URL Google Fonts di kedua bundler. `next/font/local`, penggantian font, dan perubahan konfigurasi aplikasi tidak diperlukan.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - API contract berubah: Tidak
  - Autentikasi/CORS/deployment berubah: Tidak
  - Secret/kredensial diekspos: Tidak
  - Commit/push/merge/rebase/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau diff dependency dan jalankan build Vercel dari commit lokal yang sudah memuat perubahan ini setelah di-commit oleh pemilik repository.

---

### Sesi 2026-10-29 - Batch 2.1 Integrasi struktur kepengurusan homepage

- **Status:** Selesai; tidak commit, push, merge, rebase, atau deploy.
- **Commit dasar:** `168473ba9a233e55cd8a4c8b66d2485c7a6bb11e`.
- **Branch:** `feat/admin-ui-foundation`.
- **Tujuan batch:** mengganti placeholder section Struktur Kepengurusan dengan data aktual dari `GET /api/v1/public/organization`, tanpa mengubah backend atau mengintegrasikan endpoint program.
- **Kontrak dan data yang teramati:**
  - Endpoint lokal merespons `200` dengan top-level key `period`, `divisions`, `members`, dan `positions`.
  - `period` berisi `id` dan `name`; `divisions` berisi `id`, `name`, `description`; `members` berisi `id`, `name`, `division_id`, `position_id`, `photo_url`; `positions` berisi `id`, `name`.
  - Periode aktif yang teramati: `2025/2026`.
  - Jumlah aktual: 9 divisi, 57 anggota, dan 10 posisi/jabatan.
  - Tidak ada anggota dengan `division_id` null, `position_id` null, atau `photo_url` terisi pada respons yang diperiksa.
  - BPH tidak memiliki flag khusus pada model maupun respons. BPH muncul sebagai divisi bernama `Badan Pengurus Harian (BPH)` dan dikelompokkan netral berdasarkan `division_id`, bukan ditebak sebagai tipe tersendiri.
- **Yang selesai:**
  - Tipe publik ditambahkan ke `frontend/types/organization.ts` sesuai bentuk respons nyata; tipe admin existing tidak diubah.
  - Service `frontend/lib/public/organization.ts` ditambahkan menggunakan `apiFetch`, `cache: "no-store"`, dan `AbortSignal`.
  - Homepage memuat berita dan organisasi secara terpisah dengan timeout 5 detik; kegagalan salah satu endpoint tidak menjatuhkan section lainnya.
  - `OrganizationSection` menampilkan periode aktif, divisi, anggota, jabatan, jumlah divisi, dan jumlah anggota dari data aktual. Tidak ada nama, jumlah, atau periode contoh yang di-hardcode.
  - State dibedakan eksplisit: kegagalan API memakai panel `role="alert"` dan tombol coba lagi; tidak ada periode aktif memakai empty state tanpa tombol error; periode aktif tanpa divisi dan divisi tanpa anggota memiliki pesan masing-masing.
  - Anggota dengan relasi divisi yang tidak tersedia dikelompokkan sebagai `Tanpa divisi` dengan keterangan bahwa respons API tidak menyertakan divisinya, bukan diberi divisi karangan.
  - Layout desktop memakai dua kolom; mobile menjadi satu kolom. Jika jumlah divisi ganjil, sel terakhir memenuhi lebar grid agar tidak menyisakan blok kosong.
  - Ringkasan section memakai dua metrik aktual: jumlah divisi dan jumlah anggota.
- **File yang diubah/ditambahkan:**
  - `frontend/app/(public)/page.tsx`
  - `frontend/app/globals.css`
  - `frontend/types/organization.ts`
  - `frontend/lib/public/organization.ts` (baru)
  - `frontend/components/public/OrganizationSection.tsx` (baru)
  - `progress.md`
  - `docs/validation/batch-2.1/` (screenshot dan laporan validasi, untracked)
- **Pemeriksaan yang dijalankan + hasil:**
  - `npm run lint`: PASS.
  - `.next` dihapus setelah dev server dihentikan sementara, lalu `npm run build`: PASS dengan Next.js 16.4.3, TypeScript sukses, dan route final tidak memuat route validasi sementara.
  - Pemeriksaan API lokal: `GET /api/v1/public/organization` merespons `200`; shape, periode, dan jumlah dicatat di `docs/validation/batch-2.1/organization-integration-report.json`.
  - Chrome production build pada 1280 px: 9 divisi, 57 baris anggota, grid dua kolom, heading Playfair Display, body Space Grotesk, `scrollWidth` sama dengan viewport.
  - Chrome production build pada 390 px: 9 divisi, 57 baris anggota, grid satu kolom, tidak ada horizontal overflow.
  - State tanpa periode, error API, periode tanpa divisi, dan divisi tanpa anggota diperiksa melalui route sementara di build validasi. Route tersebut sudah dihapus dan tidak ada pada build final.
  - `git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF.
  - Dev server lokal dikembalikan berjalan di port 3000 dan halaman merespons `200` setelah build bersih.
- **Risiko/pertanyaan yang belum terjawab:**
  - Belum ada penanda BPH eksplisit. Perlu keputusan pemilik data apakah divisi BPH harus selalu ditampilkan sebagai baris khusus atau tetap sebagai bagian grid divisi.
  - State tanpa periode aktif hanya diuji melalui data komponen sementara karena backend lokal saat ini memiliki periode aktif; tidak ada perubahan database untuk membuat state tersebut.
  - Endpoint program kerja sengaja belum diintegrasikan; aturan visibilitas/statusnya tetap belum dikonfirmasi.
  - Detail kontak, logo resmi, hak pakai foto hero, dan verifikasi visual admin setelah login masih menjadi blocker yang sudah tercatat pada sesi sebelumnya.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak
  - Database/schema/migration berubah: Tidak
  - API contract berubah: Tidak
  - Autentikasi/CORS/CSRF/rate limit/Redis/storage berubah: Tidak
  - Deployment/secret berubah: Tidak
  - `package.json`/`package-lock.json`/`.gitignore`/`.agents` berubah pada batch ini: Tidak
  - Commit/push/merge/rebase/reset/deploy: Tidak
- **Langkah berikutnya:**
  - Tinjau tampilan struktur populated dan state kosong pada screenshot batch 2.1.
  - Konfirmasi keputusan tampilan BPH sebelum polish lanjutan.
  - Setelah disetujui, lanjutkan batch terpisah untuk program kerja atau halaman publikasi berikutnya tanpa menebak kontrak API.

---

### Sesi 2026-10-30 — Perbaikan alignment kartu tunggal dan rasio foto Struktur

- **Status:** Selesai; tidak commit, push, merge, rebase, atau deploy.
- **Branch:** `feat/admin-ui-foundation`.
- **HEAD teramati saat validasi:** `58b829c` (`penyesuaian desain struktur, landing pages`); commit eksternal yang sudah ada di branch, tidak dibuat oleh agent.
- **Tujuan batch:** memusatkan kartu anggota tunggal pada halaman `/struktur`, mengubah area foto menjadi 1:1, membuat kartu lebih compact, dan memindahkan layout grid/foto ke Tailwind CSS v4.
- **Root cause:**
  - `MemberGrid` tetap memakai grid multi-kolom ketika hanya ada satu anggota, sehingga kartu menempati kolom pertama dan terlihat rata kiri.
  - `.structure-card__photo` masih menetapkan `aspect-ratio: 4 / 5`, sehingga area foto terlalu tinggi.
- **Yang selesai:**
  - `MemberGrid` sekarang memakai utility Tailwind:
    - satu anggota: `grid-cols-[minmax(0,11.5rem)] justify-center`;
    - dua anggota atau lebih: `grid-cols-2 min-[640px]:grid-cols-3 min-[900px]:grid-cols-4`;
    - gap: `gap-3 sm:gap-4`.
  - `MemberCard` memakai `aspect-square w-full` pada `PublicImage`; fallback foto tetap memakai wrapper yang sama sehingga tetap persegi.
  - Selector lama `.structure-card-grid`, seluruh responsive declaration-nya, gap mobile khusus, dan `.structure-card__photo` dihapus dari `frontend/app/globals.css`.
  - BPH hierarchy, aturan centering BPH, mapping posisi, mekanisme foto, dan fallback foto tidak diubah.
- **File yang diubah:**
  - `frontend/components/public/StructureDirectory.tsx`
  - `frontend/app/globals.css`
  - `progress.md`
- **Pemeriksaan yang dijalankan + hasil aktual:**
  - `npm run lint` — lulus tanpa error.
  - `npm run build` — lulus; build final dari `.next` yang dibersihkan, 9 route, fixture validasi sementara tidak ikut ter-build.
  - `git diff --check` — tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada file yang disentuh.
  - `rg`/`Select-String` untuk `structure-card-grid` dan `structure-card__photo` — tidak ada selector lama tersisa.
  - Validasi browser production di `http://localhost:3001` pada viewport 390, 768, dan 1280:
    - Pembimbing 1 anggota: delta titik tengah kartu terhadap container, heading, dan dropdown = `0` pada ketiga viewport.
    - Lihat Semua, Pembimbing 1 anggota: delta titik tengah kartu terhadap container = `0`; heading/informasi mengikuti layout existing.
    - Rasio area foto = `1.0` pada Pembimbing, Lihat Semua, kartu dengan foto valid, dan fallback foto rusak.
    - Divisi 2 anggota: 2 kartu berjajar; track grid 2/3/4 pada 390/768/1280.
    - Divisi 5 anggota (Keuangan): track grid 2/3/4 pada 390/768/1280.
    - Tidak ada horizontal overflow (`scrollWidth === innerWidth`) pada seluruh skenario.
  - Screenshot dan laporan tersimpan di `docs/validation/batch-2.2/`:
    - `pembimbing-390.png`, `pembimbing-768.png`, `pembimbing-1280.png`
    - `lihat-semua-390.png`, `lihat-semua-768.png`, `lihat-semua-1280.png`
    - `divisi-2-390.png`, `divisi-2-768.png`, `divisi-2-1280.png`
    - `divisi-5-390.png`, `divisi-5-768.png`, `divisi-5-1280.png`
    - `layout-validation-report.json`
- **Catatan validasi:**
  - Kasus 2 anggota dan foto rusak divalidasi memakai fixture sementara `frontend/app/(public)/structure-layout-test`; fixture dihapus sebelum build final dan tidak ada di route final.
  - Screenshot memuat nama anggota publik dari API aktual; tinjau sebelum dipublikasikan atau di-commit.
  - Perubahan lokal tak terkait pada `frontend/app/(public)/page.tsx` (teks CTA publikasi) tidak disentuh dan bukan bagian batch ini.
- **Risiko/regresi yang diperiksa:**
  - BPH hierarchy dan grid BPH tidak berubah.
  - Kartu Pembimbing tetap memakai lebar maksimum 11.5rem dan berada di tengah pada semua breakpoint.
  - Grid multi-anggota tetap 2/3/4 kolom pada 390/768/1280.
  - Foto valid dan fallback sama-sama memakai wrapper 1:1; `object-cover` tetap aktif.
- **Blocker/keputusan yang diperlukan:**
  - Tidak ada blocker teknis.
  - Perlu keputusan pemilik untuk meninjau screenshot dan melakukan commit jika hasil sudah disetujui.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak.
  - Database/schema/migration berubah: Tidak.
  - API contract/client/auth/CSRF/RBAC/cookie policy berubah: Tidak.
  - Dependency, `.gitignore`, deployment, secret, atau konfigurasi environment berubah: Tidak.
- **Langkah berikutnya:**
  - Tinjau screenshot di `docs/validation/batch-2.2/`.
  - Hubungkan aset foto dari `frontend/public/` sesuai mekanisme yang sudah ada.
  - Commit hanya setelah pemilik menyetujui hasil.

---

### Sesi 2026-11-18 - Batch FE-S: struktur folder frontend per domain (`features/`)

- **Status:** Selesai; tidak commit, push, merge, rebase, atau deploy.
- **Branch:** `feat/admin-ui-foundation`.
- **Tujuan batch:** memindahkan file API, tipe, dan komponen frontend ke folder
  per domain di `frontend/features/`, memperbarui import, menghapus file yang
  tidak dipakai, dan mendokumentasikan struktur baru. Tidak ada perubahan
  logika, JSX, class Tailwind, atau teks.
- **Struktur baru:**
  - `frontend/features/auth/`: `api.ts`, `types.ts`, `permissions.ts`,
    `AuthContext.tsx`.
  - `frontend/features/accounts/`: `api.ts`, `types.ts`.
  - `frontend/features/organization/`: `admin-api.ts`, `public-api.ts`,
    `types.ts`, `components/OrganizationSection.tsx`,
    `components/StructureDirectory.tsx`, `components/StructurePage.tsx`.
  - `frontend/features/news/`: `admin-api.ts`, `public-api.ts`, `types.ts`,
    `components/admin/*`, `components/public/PublicationsSection.tsx`.
  - `frontend/features/programs/`: `admin-api.ts`, `public-api.ts`, `types.ts`,
    `status.ts`, `components/admin/*`.
  - `frontend/features/settings/`: `admin-api.ts`, `public-api.ts`, `types.ts`,
    `links.ts`.
  - `frontend/features/dashboard/admin-api.ts` dan
    `frontend/features/visits/public-api.ts`.
  - Shared yang tetap: `lib/api/client.ts`, `lib/api/errors.ts`,
    `lib/media/{api,compress,types}.ts`, `components/ui/Button.tsx`,
    `components/admin/shell/*`, `components/admin/shared/*`, dan komponen publik
    lintas fitur di `components/public/`.
  - Folder lama `types/`, `context/`, `lib/admin/`, `lib/public/`, `lib/auth/`,
    `lib/programs/`, `components/admin/news/`, dan `components/admin/programs/`
    kosong lalu dihapus.
  - Dokumentasi aturan struktur ditambahkan di `frontend/STRUCTURE.md`.
- **File yang dihapus:** `frontend/lib/api/health.ts`,
  `frontend/components/public/BrandMark.tsx`, `frontend/components/ui/FormField.tsx`,
  `frontend/components/ui/Input.tsx`, `frontend/components/ui/Select.tsx`.
  Pencarian `lib/api/health`, `BrandMark`, `FormField`, `Input`, dan `Select`
  pada seluruh `*.ts`/`*.tsx` hanya menemukan definisi di file itu sendiri;
  tidak ada import dari file lain.
- **Catatan wiring:** `frontend/features/settings/links.ts` masih berisi
  konstanta `PUBLIC_LINKS`; pada batch wiring akan diganti dengan
  `getPublicLinks(settings)`.
- **File yang diubah:** file yang dipindah (lihat `git status --short`, Git
  mencatatnya sebagai rename) serta import di `app/**` dan
  `components/**`; `frontend/STRUCTURE.md`; `docs/progress.md`.
- **Pemeriksaan yang dijalankan + hasil:**
  - Baseline sebelum pindah: `npx tsc --noEmit` lulus (exit 0),
    `npm run lint` lulus (exit 0), `npm run build` berhasil compile dan
    menghasilkan 9 route tetapi berhenti dengan `SecurityFatalError` dari
    Next.js 16.4.3 yang meminta upgrade keamanan (bukan error kode).
  - Sesudah refactor: `npx tsc --noEmit` lulus, `npm run lint` lulus,
    `npm run build` menunjukkan hasil yang sama dengan baseline (compile dan
    route sukses, berhenti pada pengingat upgrade keamanan Next.js).
  - Pencarian import lama (`@/lib/admin`, `@/lib/public`, `@/types/`,
    `@/context/`, `@/lib/auth`, `@/lib/programs`, `@/lib/api/media`,
    `@/lib/api/auth`, `@/components/admin/news`,
    `@/components/admin/programs`) tidak menemukan sisa.
- **Risiko/regresi yang diperiksa:**
  - Hanya baris import yang berubah; isi komponen, logika, dan class Tailwind
    tidak disentuh.
  - Semua pemindahan memakai `git mv`, sehingga Git mencatat rename (`R`/`RM`),
    bukan pasangan hapus+tambah.
- **Blocker/keputusan yang diperlukan:** Tidak ada blocker teknis. Build
  produksi tetap meminta upgrade keamanan Next.js, di luar scope batch ini.
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak.
  - Database/schema/migration berubah: Tidak.
  - API contract/client/auth/CSRF/RBAC/cookie policy berubah: Tidak.
  - Dependency, `.env*`, deployment, secret, atau konfigurasi environment
    berubah: Tidak.
- **Langkah berikutnya:** lanjutkan batch wiring, termasuk mengganti
  `PUBLIC_LINKS` dengan `getPublicLinks(settings)`.

---

### Sesi 2026-11-19 — Batch SEC-2: IP klien, brute-force login, audit login, timeout database

- **Status:** Selesai; **berhenti**. Tidak commit, push, deploy, atau menyambung ke TiDB/MySQL/Redis sungguhan.
- **Branch/HEAD:** `feat/admin-ui-foundation`, HEAD `e8e07f7`. Working tree bersih sebelum batch dimulai.
- **Tujuan batch:** menutup SEC-S1 (brute-force), SEC-S2 (IP klien), SEC-R5 (audit login), dan temuan operasional query menggantung saat koneksi TiDB putus.
- **Satu sumber IP klien (`app/utils/ip.py`):**
  - `resolve_client_ip(request)` menjadi satu-satunya sumber IP; `get_client_ip()` (audit) dan `RateLimiter.client_ip()` memanggilnya, sehingga rate limit dan audit selalu mencatat IP yang sama.
  - Setting baru `CLIENT_IP_SOURCE` (default `direct`; nilai `direct`, `trusted_proxy`, `vercel`). Nilai lain ditolak validator Pydantic saat startup.
  - `direct`: `request.client.host`. `vercel`: `x-vercel-forwarded-for` elemen pertama, lalu `x-real-ip`, lalu `request.client.host`; setiap kandidat divalidasi `ipaddress.ip_address` dan kandidat tidak valid dilewati. `trusted_proxy`: hanya bila peer ada di `TRUSTED_PROXY_IPS`, lalu `X-Forwarded-For` dibaca **dari kanan** dan hop pertama yang bukan proxy tepercaya dipakai (elemen kiri tidak dapat dipalsukan).
  - `validate_runtime()` menolak startup bila `APP_ENV=production`, environment variable `VERCEL` ada, dan `CLIENT_IP_SOURCE != vercel`.
- **Brute-force login:**
  - Bucket baru `login-account-global:{username_casefold}` (casefold dipotong 100) dengan `LOGIN_ACCOUNT_GLOBAL_LIMIT` default **20** dan `LOGIN_ACCOUNT_GLOBAL_WINDOW_SECONDS` default **900**. Berlaku untuk semua username (ada maupun tidak) sehingga tidak membocorkan keberadaan akun. 429 memakai pesan dan `Retry-After` yang sama dengan bucket akun yang ada.
  - Bucket per-IP dan per-IP+username tidak diubah.
- **Brute-force ganti password:**
  - `POST /auth/change-password` sekarang `async` dan memakai bucket `change-password:{admin_id}` dengan `CHANGE_PASSWORD_LIMIT` default **5** dan `CHANGE_PASSWORD_WINDOW_SECONDS` default **900**. Dicek **sebelum** verifikasi kata sandi lama; 429 + `Retry-After`. Pesan error login seragam tidak diubah.
- **Trade-off bucket global:** penyerang dapat sengaja mengirim 20 percobaan gagal untuk satu username dan memicu 429 bagi pemilik akun (denial-of-service sementara, maksimal 15 menit). Tanpa bucket ini, brute force terdistribusi dari banyak IP hanya dibatasi bucket per-IP sehingga efektif tak terbatas. Default 20/900 dipilih agar pengguna wajar (salah ketik, NAT kantor bersama) tidak mudah terkena, sementara laju tebakan lintas IP dibatasi; nilainya jauh di atas batas per-IP (5/60 detik) sehingga pengguna tunggal normal tidak pernah mencapainya. Bucket ganti password 5/900 cukup untuk beberapa kesalahan, tetapi membatasi penggunaan sesi yang dicuri sebagai oracle kata sandi lama karena pengecekan dilakukan sebelum verifikasi.
- **Audit login (`log_activity`, tanpa password/token, IP dari `get_client_ip`):**
  - `auth.login.success` (admin_id terisi) ditulis dalam transaksi yang sama dengan sesi login.
  - `auth.login.failure`: `admin_id` terisi bila username ada, `None` bila tidak; `description` berisi username yang dicoba, CR/LF dibuang, dipotong 100 karakter.
  - `auth.login.rate_limited` untuk setiap 429 login (per-IP, per-akun, atau global), tanpa `admin_id`.
  - `auth.logout` ditulis bersama pencabutan sesi.
  - Jalur gagal/429 menulis audit lalu `commit` sebelum `HTTPException` dikirim; kegagalan audit di-rollback tanpa mengubah respons error login.
- **Timeout database (`app/database/connection.py`):**
  - Helper murni `build_db_connect_args(url)` mengembalikan `connect_timeout`/`read_timeout`/`write_timeout` hanya untuk backend `mysql`/`mariadb` (TiDB memakai MySQL). SQLite mengembalikan `{}`.
  - Default `DB_CONNECT_TIMEOUT=10`, `DB_READ_TIMEOUT=30`, `DB_WRITE_TIMEOUT=30`. `pool_pre_ping`, `pool_recycle=300`, dan `NullPool` produksi tidak diubah.
- **Kebersihan config:** duplikasi `general_read_limit`, `general_read_window_seconds`, `general_write_limit`, `general_write_window_seconds` dihapus; hanya versi `Field(..., ge=1)` yang dipertahankan. Nilai default efektif tidak berubah: read **120/60 detik**, write **60/60 detik**.
- **Dokumentasi:** `Backend/.env.example` (semua setting baru + komentar + contoh produksi Vercel `CLIENT_IP_SOURCE=vercel`, `RATE_LIMIT_BACKEND=redis`, `REDIS_URL=rediss://...`), `Backend/README.md` bagian Security (sumber IP, bucket, audit, timeout), dan entri ini.
- **File yang diubah/ditambah:**
  - `Backend/app/utils/ip.py` (ditulis ulang)
  - `Backend/app/core/config.py`, `Backend/app/core/rate_limit.py`
  - `Backend/app/routers/auth.py`, `Backend/app/database/connection.py`
  - `Backend/.env.example`, `Backend/README.md`
  - `Backend/tests/test_client_ip.py` (baru), `Backend/tests/test_db_connection.py` (baru), `Backend/tests/test_config.py`, `Backend/tests/test_auth.py`
  - `docs/progress.md`
- **Test yang ditambahkan (+27):**
  - IP: `vercel` memakai `x-vercel-forwarded-for`, fallback `x-real-ip`, kandidat tidak valid dilewati; `direct` mengabaikan header forwarded; `trusted_proxy` mengambil hop kanan pertama non-proxy dan mengabaikan elemen kiri yang dipalsukan; peer tidak tepercaya diabaikan; audit dan rate limiter menghasilkan IP yang sama.
  - Config: `CLIENT_IP_SOURCE` tidak valid → error; normalisasi nilai; default general limit tetap; produksi + `VERCEL` + sumber bukan `vercel` → error; `vercel` diterima; tanpa `VERCEL` sumber `direct` diterima.
  - Login: setelah limit global tercapai dari IP berbeda untuk username yang sama → 429 + `Retry-After`; username lain tidak terpengaruh.
  - Change password: percobaan ke-(limit+1) → 429 walaupun kata sandi lama benar, dan hash lama tidak berubah.
  - Audit: sukses, gagal (username ada dan tidak ada), sanitasi CR/LF, rate limited, dan logout masing-masing satu baris dengan aksi benar; tidak memuat kata sandi.
  - Engine: `connect_args` hanya untuk URL MySQL dan mengikuti setting; SQLite/URL tidak dikenal tanpa `connect_args`.
- **Pemeriksaan yang dijalankan + hasil:**
  - `python -m compileall app` → lulus.
  - `pytest -q` → **224 passed** (baseline) → **251 passed**, 37 warning deprecation dari dependency.
  - `alembic upgrade head` + `alembic check` pada SQLite sementara `alembic_sec2_check.sqlite3` → `No new upgrade operations detected`; file sementara dihapus.
- **Risiko/regresi yang diperiksa:**
  - Tidak ada perubahan model, migration, atau `frontend/`.
  - Bucket global hanya menambah pengecekan; pesan error 401 tetap seragam dan tidak membedakan username ada/tidak.
  - `trusted_proxy` membaca dari kanan, sehingga elemen `X-Forwarded-For` paling kiri tidak lagi dipercaya.
  - Timeout hanya dipasang untuk MySQL/TiDB; test SQLite tidak terpengaruh.
- **Blocker/keputusan yang diperlukan:** tidak ada untuk batch ini. Produksi Vercel wajib menyetel `CLIENT_IP_SOURCE=vercel`.
- **Konfirmasi batas scope:**
  - Hanya `Backend/` dan `docs/progress.md` diubah; `frontend/` tidak disentuh.
  - Tidak membaca/mencetak `.env*`; tidak install/upgrade paket; tidak commit/push/deploy.
- **Langkah berikutnya:** pemilik meninjau dan meng-commit SEC-2. **Berhenti.**

---

## 4. Template Catatan Sesi

Salin bagian ini dan isi dengan fakta aktual setiap selesai satu batch. Jangan mengklaim check/test berhasil jika tidak dijalankan.

Salin entri ke Active Development Log (Bagian 2) di `docs/progress.md`; jangan mengubah entri lama.

### Sesi YYYY-MM-DD — Judul batch

- **Status:** Belum mulai / Berjalan / Selesai / Terblokir
- **Branch:** 
- **Tujuan batch:** 
- **Yang selesai:**
  - 
- **File yang diubah:**
  - 
- **Pemeriksaan yang dijalankan + hasil:**
  - 
- **Risiko/regresi yang diperiksa:**
  - 
- **Blocker/keputusan yang diperlukan:**
  - Tidak ada / jelaskan
- **Konfirmasi batas scope:**
  - Backend berubah: Tidak / Ya — wajib eskalasi jika tidak diizinkan
  - Database/schema/migration berubah: Tidak / Ya — wajib eskalasi jika tidak diizinkan
  - Secret/kredensial diekspos: Tidak / Ya — berhenti dan eskalasi
  - Dokumentasi/Design berubah: Tidak / Ya — sebutkan file yang berubah
- **Langkah berikutnya:**
  - 

---
