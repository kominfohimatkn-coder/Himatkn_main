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

> Terakhir diperbarui: 15 November 2026 (Batch R1 Fase A). Perbarui bagian ini pada setiap batch.

### a. Snapshot repository

- Branch: `feat/admin-ui-foundation`.
- HEAD terverifikasi saat Batch R1 Fase A: `00bf955cb9bb35c8adcf9e480834b01e43f11b2c` (`00bf955`), ahead 2 dari remote yang diketahui.
- HEAD terverifikasi saat Batch R0: `b388ae752270a03ae9a5fcbf25e44ad2b9c840fc` (`b388ae7` — "add something i thought was important").
- HEAD remote yang sebelumnya diketahui: `5e9aa6c` ("remove unused state"). HEAD lokal sudah lebih baru dari itu; `b388ae7` hanya mengubah `README.md`.
- `Design/bank-soal.html` sudah dihapus pada `5e9aa6c`; halaman tersebut bukan lagi bagian Prototype aktif. Link `bank-soal.html` yang masih tersisa di file `Design/` lain diabaikan.
- Working tree bersih sebelum Batch R0 dimulai.
- Batch R1 Fase A (15 Nov) meninggalkan perubahan **belum di-commit** di 6 file (4 diubah, 2 dihapus); lihat Active Development Log entri 15 November 2026.

### b. Scope fase saat ini

- Redesign **website publik** V2, frontend-only.
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
6. **Detail program kerja dan search publikasi belum didukung API.** Keduanya diperlakukan sebagai gap. Jangan membuat endpoint, parameter, atau data palsu.
7. **Status program wajib memetakan keempat nilai:** `planned`, `ongoing`, `completed`, `cancelled`. `cancelled` tidak boleh diabaikan. Backend tidak memvalidasi enum status, jadi UI harus aman terhadap nilai yang tidak dikenal. Status diisi manual oleh admin dan **tidak dihitung dari tanggal**.

### f. Kondisi aktual V2

Ringkasan dari audit 12 November 2026; detail dan bukti line-by-line ada di `docs/audit/REDESIGN_AUDIT_2026-11-12.md` (rujukan; jangan disalin ulang).

- Route publik produk: `/` dan `/struktur`. Fixture `/__structure-state` **sudah dihapus pada R1 Fase A** (folder berawalan `_` sebenarnya tidak pernah menjadi route Next; URL-nya 404 bahkan sebelum dihapus).
- Route admin: `/login`, `/admin/dashboard`, `/admin/news` (read-only di UI), `/admin/programs` (CRUD).
- Endpoint publik yang tersedia dan pemakaiannya:

  | Endpoint | Dipakai frontend? |
  |---|---|
  | `/public/news` | Ya |
  | `/public/news/{slug}` | Belum (service `getPublicNewsBySlug()` sudah ada; route detail belum ada) |
  | `/public/programs` | Belum (service `getPublicPrograms()` sudah ada; section homepage masih empty state) |
  | `/public/organization` | Ya |
  | `POST /public/visits` | Belum |

- Baseline: `npm run lint` dan `npx tsc --noEmit` lulus pada audit. `npm run build` pertama kali dijalankan pada R1 Fase A (15 Nov): **gagal** karena `frontend/app/(private)/(admin)/loading.tsx` berukuran 0 byte; setelah file itu dihapus (disetujui pemilik) build lulus 9 route.

### g. Keputusan yang masih tertunda (blok batch R1 dan seterusnya)

Status per 15 November 2026 (Batch R1 Fase A):

| # | Keputusan | Status |
|---|---|---|
| 1 | Font final: Literata + Inter dari prototype, atau yang lain | **Diputuskan pemilik:** Literata + Inter untuk publik |
| 2 | Logo header: apakah `frontend/public/favicon.png` / `icon.png` (1080×1350) adalah logo resmi | **Diputuskan pemilik:** `favicon.png` adalah logo resmi, dipakai header + footer |
| 3 | Foto hero: `Design/assets/img/hero.jpg` atau `frontend/public/images/hero-group.jpg` | **Diputuskan pemilik:** `frontend/public/images/hero-group.jpg` via optimasi Next.js |
| 4 | Acuan hero mobile: screenshot Figma slide 15–18 tidak ada di repo | **Diputuskan pemilik:** ikuti prototype untuk hero mobile |
| 5 | Izin route baru: `/publikasi`, `/publikasi/[slug]`, halaman daftar program kerja | Menunggu keputusan pemilik |
| 6 | Nama route program kerja: `/program-kerja` atau `/kegiatan` | Menunggu keputusan pemilik |
| 7 | Perlakuan status `cancelled` di UI publik | Menunggu keputusan pemilik |
| 8 | Program dari periode mana yang ditampilkan di publik (API tanpa filter periode) | Menunggu keputusan pemilik |
| 9 | Kontak, alamat, dan peta: nilai resmi terverifikasi atau disembunyikan | **Diputuskan pemilik:** disembunyikan dulu; terblokir `GET /public/settings`, jangan hardcode |
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
| R1 Fase A | Sistem visual publik: token prototype di-scope `.public-site`, font Literata + Inter, header sticky 72px + nav 6 item, menu mobile prototype, footer, logo resmi, konstanta link Bank Soal dipakai header/menu/footer, hapus fixture `__structure-state`, domain canonical | **Selesai 15 Nov 2026; menunggu persetujuan pemilik sebelum Fase B.** Perubahan belum di-commit |
| R1 Fase B | Hero, Tentang, section Program visual, Publikasi, Kepengurusan, Kontak disembunyikan, restyle 404, loading state | **Belum dikerjakan; diblok persetujuan pemilik atas Fase A** |
| R2 | Halaman `/struktur`: dropdown custom yang aksesibel, visual tree/kartu/avatar, fallback foto | — |
| R3 | Data homepage: grid divisi, program dengan 4 status, perbaikan link "Instagram" | Diblok keputusan g.7–8 |
| R4 | `/publikasi` dan `/publikasi/[slug]` | Diblok keputusan g.5 |

### l. Backlog untuk sesi backend

Bukan untuk dikerjakan OpenCode frontend:

1. `GET /public/settings` dengan whitelist key publik (misalnya `bank_soal_url`, `instagram_url`, `contact_email`, `secretariat_address`, `maps_url`), validasi URL hanya `https://` pada `PUT /admin/settings/{key}`, lalu halaman admin Pengaturan.
2. Detail program publik per slug; filter periode dan status; `total` di respons list; metadata periode/divisi pada respons program.
3. Search dan `total` untuk `/public/news`. Pertimbangkan excerpt dan tag.
4. Verifikasi `media.manage` di DB production.
5. Pembedaan permission role `admin` dan `editor`.
6. Pembersihan data uji sebelum rilis.

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
