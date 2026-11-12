# Audit Redesign Website Publik HIMATKN V2

**Tanggal audit:** 12 November 2026  
**Repository:** `Himatkn_main`  
**Branch aktif:** `feat/admin-ui-foundation`  
**HEAD saat audit:** `8e5afcb17aa4d2bda91a995a5d650db7f2e2d07b`  
**Sifat sesi:** audit dan analisis read-only; tidak ada implementasi redesign.

## 1. Ringkasan eksekutif

1. **V2 baru memiliki dua halaman publik produk (di luar 404 dan fixture)**, yaitu `/` dan `/struktur`. Route publik lain yang ada adalah `/__structure-state`, yang merupakan fixture state dengan data hardcoded, bukan halaman produk. `[S]`
2. **Prototype Desain HIMATKN V1 memiliki delapan halaman** (`index`, `struktur`, `kegiatan`, `publikasi`, `artikel`, `404`, `bank-soal`, `states`), tetapi tidak semuanya boleh atau mungkin dibuat pada fase frontend-only ini. `[S]`
3. **Sistem visual V2 saat ini tidak konsisten dengan Prototype V1 dan tidak menunjukkan bukti sebagai port langsung.** V2 memakai cream/gold, Playfair/Crimson/Space Grotesk, header absolute, dan hero terpusat; Prototype memakai mint/green, Literata/Inter, header sticky, dan hero kiri pada desktop. `[S]`
4. **Kontrak publik V2 sudah mendukung berita (list + detail), program (list), organisasi aktif, dan visitor log.** Namun belum ada pencarian publikasi, detail program, filter/status program, total pagination, excerpt berita, atau metadata periode/divisi pada program. `[S]`
5. **Section Program Kerja di homepage sengaja masih empty state**, padahal service `getPublicPrograms()` sudah ada tetapi belum dipanggil. Section ini belum menampilkan data apa pun. `[S]`
6. **Section Publikasi hanya menampilkan judul dan tanggal**, dengan teks “Detail segera hadir”; belum ada route detail dan belum ada excerpt dari API list. `[S]`
7. **Section Kepengurusan di homepage hanya menampilkan periode dan jumlah anggota**, bukan grid divisi seperti Prototype. Ini juga berbeda dari catatan historis `docs/progress.md` yang menyatakan section tersebut menampilkan divisi dan anggota. `[S]/[D]`
8. **Halaman `/struktur` adalah bagian yang paling matang secara fungsi**: memakai API organisasi nyata, memiliki mode per-divisi/lihat-semua, hierarki BPH, serta state error/empty. Namun dropdown masih native `<select>`, visualnya berbeda dari Prototype, dan deteksi BPH bergantung pada nama divisi/jabatan. `[S]`
9. **`/__structure-state` adalah temuan risiko produksi.** Route ini berada di bawah layout publik, memakai data dummy, dan tidak diblokir `robots.ts`. Route ini harus dihapus atau dilindungi sebelum rilis; audit ini tidak mengubahnya. `[S]`
10. **Panel admin dipertahankan, bukan objek redesign visual.** Hanya tiga route admin yang terdaftar sebagai implemented: dashboard, news, programs. News masih read-only di UI; programs memiliki CRUD. Perubahan token publik secara global berisiko merusak admin karena token admin memakai keluarga token yang sama. `[S]`
11. **Baseline teknis lulus**: `npm run lint` dan `npx tsc --noEmit` dari `frontend/` selesai tanpa error. `npm run build` tidak dijalankan pada sesi ini. `[S]`
12. **Rekomendasi batch awal maksimal tiga**: R1 sistem visual + chrome publik + homepage; R2 halaman struktur; R3 section data homepage (organisasi dan program) dengan batas API yang jelas. Pencarian publikasi, daftar/detail publikasi, filter program, dan detail program tetap menjadi backlog yang diblokir route/API. `[A]`

## 2. Kondisi repository dan batas sesi

### 2.1 Status awal

`git status --short --branch` pada awal audit: `[S]`

```text
## feat/admin-ui-foundation...origin/feat/admin-ui-foundation
 M Design/index.html
?? Design/assets/img/favicon.png
```

`git log -5 --oneline`: `[S]`

```text
8e5afcb attention for opencode
bef3c30 finished prototype design
0256904 Merge remote-tracking branch 'origin/feat/admin-ui-foundation' into feat/admin-ui-foundation
6f06bf2 redesign and remove old design references
a2ed5d7 docs: add HIMATKN V1 frontend redesign guide
```

Perubahan lokal pada `Design/index.html` bukan pekerjaan audit dan tidak disentuh: `[S]`

- Menghapus inline SVG `brand__logo` tiruan dari homepage.
- Mengubah tautan `Bank Soal` dari `bank-soal.html` menjadi Google Drive.
- `Design/assets/img/favicon.png` masih untracked.
- Halaman prototype lain masih memakai inline SVG logo tiruan yang sama.

Konsekuensinya, `Design/` saat ini adalah **referensi yang sedang diedit pemilik**, bukan snapshot final yang bersih. `[A]`

### 2.2 Batas yang dipatuhi

- Tidak ada source code, backend, database, migration/seed, auth/CSRF/CORS/RBAC/cookie, dependency, lockfile, environment, deployment, atau konfigurasi yang diubah. `[S]`
- Tidak ada operasi Git mutatif: tidak ada checkout/switch, reset, clean, stash, rebase, merge, commit, push, PR, atau deploy. `[S]`
- File `.env*` tidak dibaca atau dicetak. Keberadaan `Backend/.env`, `Backend/.env.example`, dan `frontend/.env.local` hanya dicatat. `[S]`
- Database tidak di-query. Data kuantitatif di laporan ini berasal dari dump SQL `23_tabel_himatkn.sql` dan harus diperlakukan sebagai snapshot, bukan kondisi live. `[S]/[A]`
- `npm run build` tidak dijalankan. `[S]`

### 2.3 Baseline teknis

Dijalankan dari `frontend/`: `[S]`

| Perintah | Hasil |
|---|---|
| `npm run lint` | Lulus, tanpa output error. |
| `npx tsc --noEmit` | Lulus, tanpa output. |
| `npm run build` | Tidak dijalankan pada sesi audit ini. |

## 3. Metode, hierarki kebenaran, dan klasifikasi bukti

Hierarki yang dipakai: `[S]/[D]`

1. **Source frontend V2** menentukan route, komponen, tipe, data flow, dan perilaku yang benar-benar ada.
2. **Kontrak backend V2** menentukan endpoint, field, query, status code, dan batas data.
3. **Prototype Desain HIMATKN V1 di `Design/`** menentukan arah visual, layout, dan interaksi yang dimaksud.
4. **Dokumentasi `docs/`** menentukan workflow dan batasan teknis, tetapi tidak boleh mengalahkan source.

Label bukti yang dipakai di laporan ini:

- `[S]` = terverifikasi dari source/working tree.
- `[D]` = tertulis di dokumen, tetapi belum atau tidak terverifikasi dari source.
- `[A]` = asumsi, interpretasi, atau pertanyaan terbuka.
- `[B]` = blocked by API/scope; tidak boleh dibuat tanpa keputusan atau kontrak baru.

Catatan penting:

- Tidak ditemukan file screenshot Figma/V1 di repository. Yang ada hanya screenshot validasi V2 di `docs/validation/`. Karena itu, klaim dokumen tentang “screenshot revisi pemilik” tidak dapat diverifikasi dari repository. `[S]/[D]`
- Prototype `Design/` memakai Lorem ipsum, data contoh, logo tiruan, dan foto beresolusi rendah. `Design/README.md:59-66` secara eksplisit menyatakan hal ini. `[S]`
- Nama anggota pada dump SQL dan screenshot validasi tidak direproduksi di laporan ini; laporan hanya memakai agregat. `[S]`

## 4. Dokumen dan file yang dibaca

### 4.1 Dokumentasi

- `docs/AGENTS.md`
- `docs/progress.md`
- `docs/HIMATKN_FRONTEND_CONTEXT.md`
- `docs/HIMATKN_V1_REDESIGN_GUIDE.md`
- `docs/DESIGN_REFERENCE_GUIDE.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/INSTALL_GUIDE.md`
- `docs/OPEN_CODE_FIRST_PROMPT.md`
- `Design/README.md`
- `README.md`
- `Backend/README.md`
- `frontend/README.md`
- `frontend/AGENTS.md`
- Dokumentasi Next.js lokal di `frontend/node_modules/next/dist/docs/` untuk server/client components, fonts, metadata, dan CSS.

### 4.2 Prototype `Design/`

- `Design/index.html`
- `Design/struktur.html`
- `Design/kegiatan.html`
- `Design/publikasi.html`
- `Design/artikel.html`
- `Design/404.html`
- `Design/states.html`
- `Design/bank-soal.html`
- `Design/assets/style.css`
- `Design/assets/app.js`
- `Design/assets/img/hero.jpg`
- `Design/assets/img/pelantikan-2.jpg`
- `Design/assets/img/favicon.png`
- `Design/README.md`

### 4.3 Frontend V2

- `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/app/not-found.tsx`, `frontend/app/robots.ts`, `frontend/app/sitemap.ts`
- `frontend/app/(public)/layout.tsx`, `page.tsx`, `loading.tsx`, `struktur/page.tsx`, `struktur/loading.tsx`, `__structure-state/page.tsx`
- `frontend/app/(private)/(auth)/login/page.tsx`
- `frontend/app/(private)/(admin)/layout.tsx`, `loading.tsx`, `admin/dashboard/page.tsx`, `admin/news/page.tsx`, `admin/programs/page.tsx`
- `frontend/components/public/*`
- `frontend/components/admin/*`
- `frontend/components/ui/Button.tsx`
- `frontend/lib/api/*`, `frontend/lib/public/*`, `frontend/lib/admin/*`
- `frontend/types/*`
- `frontend/context/AuthContext.tsx`
- `frontend/package.json`, `frontend/next.config.ts`, `frontend/postcss.config.mjs`

### 4.4 Backend V2 dan data

- `Backend/app/main.py`
- `Backend/app/routers/public.py`
- `Backend/app/routers/programs.py`
- `Backend/app/routers/news.py`
- `Backend/app/routers/organization.py`
- `Backend/app/routers/media.py`
- `Backend/app/routers/dashboard.py`
- `Backend/app/core/config.py`
- `Backend/app/models/content.py`
- `Backend/app/models/organization.py`
- `Backend/app/schemas/content.py`
- `Backend/app/schemas/organization.py`
- `Backend/app/seed.py`
- `23_tabel_himatkn.sql` (snapshot skema dan data; bukan query live)

### 4.5 Aset dan validasi

- `frontend/public/` (inventaris)
- `Backend/storage/uploads/` dan `Backend/storage/test-uploads/` (inventaris nama/jumlah, bukan audit isi)
- `docs/validation/batch-1.1/`, `batch-1.2/`, `batch-2.1/`, `batch-2.2/` (screenshot V2, bukan referensi V1)

## 5. Peta Prototype Desain HIMATKN V1

### 5.1 Halaman dan isi

| Halaman | Isi utama | Bukti |
|---|---|---|
| `index.html` | Hero foto grup, stats, Tentang, Program Kerja, Publikasi, Kepengurusan, footer + peta | `Design/index.html:16-129` |
| `struktur.html` | Judul, tab “Per Divisi/Lihat Semua”, select divisi, tree kepengurusan | `Design/struktur.html:42-56` |
| `kegiatan.html` | Daftar program, search, filter status | `Design/kegiatan.html:43-60` |
| `publikasi.html` | Daftar publikasi, search, pagination | `Design/publikasi.html:43-57` |
| `artikel.html` | Referensi detail artikel/program | `Design/artikel.html:43-52` |
| `404.html` | Halaman not found | `Design/404.html:43-50` |
| `bank-soal.html` | Referensi bank soal | `Design/README.md:20`; keputusan produk: di luar scope |
| `states.html` | Galeri state untuk inspeksi, bukan route produksi | `Design/README.md:39-48`; `docs/HIMATKN_V1_REDESIGN_GUIDE.md:26` |

### 5.2 Karakter visual yang terverifikasi dari CSS

- Token warna: green-950 `#06261B`, green-900 `#0B2A1F`, green-800 `#0F4D36`, green-700 `#1E5A43`, mint `#E3EEE8`, paper `#FBFDFC`, ink `#13201A`, muted `#5B6863`, line `#DCE4E0`, amber `#B07A18`. `[S]` — `Design/assets/style.css:4-27`
- Font: `--serif: "Literata"`, `--sans: "Inter"`. Namun README menyatakan Literata masih perkiraan dari screenshot. `[S]/[D]` — `Design/assets/style.css:20-21`; `Design/README.md:60`
- Container `1130px`, gutter `24px`, header `72px`, radius `4px`. `[S]` — `Design/assets/style.css:23-26`
- Header sticky dengan background paper dan border bawah. `[S]` — `Design/assets/style.css:65-67`
- Hero desktop kiri, judul serif dengan baris kedua italic. `[S]` — `Design/assets/style.css:91-99`; `Design/index.html:42-56`
- Hero mobile terpusat, judul 38px, tombol berdampingan, stats disembunyikan. `[S]` — `Design/assets/style.css:308-317`
- Struktur memakai tree, kartu person, avatar bulat 100px. `[S]` — `Design/assets/style.css:202-220`
- 404 memakai kode besar berwarna mint di atas paper. `[S]` — `Design/assets/style.css:272-277`

### 5.3 Batas Prototype yang harus dihormati

- Konten program/berita adalah Lorem ipsum dan data contoh. `[S]` — `Design/assets/app.js:8-19`; `Design/README.md:64`
- Data divisi hanya contoh; 7 divisi di prototype tidak sama dengan 9 divisi pada snapshot database. `[S]` — `Design/assets/app.js:20-36`; `23_tabel_himatkn.sql:164-173`
- `pelantikan.jpg` dirujuk tetapi tidak ada; hanya `pelantikan-2.jpg` beresolusi 181x122. `[S]` — `Design/assets/app.js:17`; `Design/README.md:62`; inventaris aset.
- Logo masih SVG tiruan; README meminta diganti dengan logo asli. `[S]` — `Design/README.md:61`; `Design/kegiatan.html:19`
- Filter kegiatan hanya memetakan `berjalan`, `terencana`, `selesai`; tidak ada `cancelled`. `[S]` — `Design/kegiatan.html:54-58`; `Design/README.md:44`
- Pagination publikasi adalah markup statis 1/2/3, bukan perilaku data nyata. `[S]` — `Design/publikasi.html:55-56`
- Bank soal masih data contoh dan tautan unduhan belum ada; keputusan produk mengecualikannya dari scope. `[S]` — `Design/README.md:65`

## 6. Kondisi Website V2 saat ini

### 6.1 Route dan layout

| Route | File | Status | Catatan |
|---|---|---|---|
| `/` | `frontend/app/(public)/page.tsx` | Ada | Homepage; memuat berita dan organisasi dari API. |
| `/struktur` | `frontend/app/(public)/struktur/page.tsx` | Ada | Memuat organisasi aktif. |
| `/__structure-state` | `frontend/app/(public)/__structure-state/page.tsx` | Ada, bukan produk | Fixture state dengan data hardcoded. |
| `/login` | `frontend/app/(private)/(auth)/login/page.tsx` | Ada | Auth admin; bukan redesign publik. |
| `/admin/dashboard` | `frontend/app/(private)/(admin)/admin/dashboard/page.tsx` | Ada | Panel admin. |
| `/admin/news` | `frontend/app/(private)/(admin)/admin/news/page.tsx` | Ada | Daftar berita read-only di UI. |
| `/admin/programs` | `frontend/app/(private)/(admin)/admin/programs/page.tsx` | Ada | CRUD program. |
| 404 | `frontend/app/not-found.tsx` | Ada | Custom not found. |

Tidak ada route `/publikasi`, `/publikasi/[slug]`, `/kegiatan`, `/kegiatan/[slug]`, atau `/bank-soal`. `[S]` — inventaris `frontend/app/`.

`robots.ts` hanya melarang `/admin/` dan `/login`; `__structure-state` tidak dilarang. `[S]` — `frontend/app/robots.ts:3-11`

### 6.2 Homepage

Struktur aktual: `[S]`

1. Hero — `frontend/app/(public)/page.tsx:74-115`
2. Tentang — `frontend/app/(public)/page.tsx:117-147`
3. Program Kerja — `frontend/app/(public)/page.tsx:149-180`
4. Publikasi — `frontend/app/(public)/page.tsx:182-185`
5. Kepengurusan — `frontend/app/(public)/page.tsx:187-190`
6. Kontak — `frontend/app/(public)/page.tsx:192-243`

Data flow homepage: `[S]`

- `loadLatestNews()` memanggil `getPublicNews({ limit: 3 })` dengan timeout 5 detik; error menghasilkan `items: []`, `hasError: true`. `frontend/app/(public)/page.tsx:39-64`
- `loadPublicOrganization()` memanggil `getPublicOrganization()` dengan timeout 5 detik. `frontend/lib/public/organization.ts:34-55`
- Keduanya dijalankan paralel dengan `Promise.all`. `frontend/app/(public)/page.tsx:66-70`
- `getPublicPrograms()` tersedia tetapi tidak dipanggil dari homepage atau komponen mana pun. `[S]` — `frontend/lib/public/programs.ts:21-37`; hasil pencarian pemanggil hanya definisi.

### 6.3 Halaman struktur

- `frontend/app/(public)/struktur/page.tsx` memuat organisasi dan meneruskan `data`/`hasError`. `[S]`
- `StructurePage` menangani error, tidak ada periode, dan tidak ada divisi/anggota. `frontend/components/public/StructurePage.tsx:59-109`
- `StructureDirectory` menangani mode `division`/`all`, select divisi, grid anggota, BPH hierarchy, dan accordion. `frontend/components/public/StructureDirectory.tsx:452-633`
- Dropdown masih `<select>` native. `frontend/components/public/StructureDirectory.tsx:530-551`
- Deteksi BPH/advisor memakai regex nama divisi; kategori BPH memakai regex nama jabatan. `frontend/components/public/StructureDirectory.tsx:73-116`
- Semua state berada di atas tema gelap (`structure-page`, `data-tone="dark"`). `frontend/components/public/StructurePage.tsx:16-17`

### 6.4 404, metadata, dan SEO

- 404 V2 memakai latar gelap dan angka `404` berwarna gold. `frontend/app/not-found.tsx:17-47`
- Metadata root memakai `metadataBase: https://himatknuklir.vercel.app`. `frontend/app/layout.tsx:47`
- Sitemap memakai domain `https://www.himatknuklir.web.id/` dan hanya memuat `/` dan `/struktur`. `frontend/app/sitemap.ts:3-17`
- Robots memakai domain sitemap yang sama. `frontend/app/robots.ts:10`
- Ada inkonsistensi domain canonical/metadata vs sitemap. `[S]`

### 6.5 Admin panel

- Hanya tiga route yang terdaftar implemented: `/admin/dashboard`, `/admin/news`, `/admin/programs`. `frontend/components/admin/shell/admin-navigation.tsx:206-210`
- Sidebar memfilter item berdasarkan permission dan `implementedAdminRoutes`. `frontend/components/admin/shell/AdminSidebar.tsx:38-48`
- Admin layout adalah client guard yang redirect ke `/login` jika tidak ada admin. `frontend/app/(private)/(admin)/layout.tsx:17-35`
- News page memakai `getAdminNews`, filter status, dan pagination; `canCreate={false}`, `renderActions={() => null}`. `frontend/app/(private)/(admin)/admin/news/page.tsx:127-140`
- Programs page memakai `getAdminPrograms`, `getAdminPeriods`, dan dialog create/edit/delete. `frontend/app/(private)/(admin)/admin/programs/page.tsx:33-264`
- Backend memiliki endpoint admin organization/news/media yang lebih luas daripada UI; UI tidak boleh dianggap lengkap. `[S]` — dekorator router `organization.py`, `news.py`, `media.py`.

### 6.6 Placeholder dan file kosong

| File | Ukuran | Dampak |
|---|---:|---|
| `frontend/app/(private)/(admin)/loading.tsx` | 0 byte | Tidak ada loading fallback admin. |
| `frontend/components/ui/FormField.tsx` | 0 byte | Placeholder; jangan dipakai. |
| `frontend/components/ui/Input.tsx` | 0 byte | Placeholder; jangan dipakai. |
| `frontend/components/ui/Select.tsx` | 0 byte | Placeholder; jangan dipakai. |
| `frontend/lib/admin/settings.ts` | 0 byte | Placeholder; tidak ada implementasi settings. |
| `frontend/types/settings.ts` | 50 byte | Hanya `AdminSettings { id: number }`; belum lengkap. |

`docs/FRONTEND_ARCHITECTURE.md:51` sudah memperingatkan bahwa file kosong adalah placeholder, bukan implementasi. `[S]/[D]`

## 7. Kontrak backend V2 yang terverifikasi

### 7.1 Prefix dan router

- Semua router didaftarkan di `/api/v1`. `[S]` — `Backend/app/main.py:44-52`
- Public router memakai prefix `/public`. `[S]` — `Backend/app/routers/public.py:23-26`
- Batas `limit` publik adalah 50. `[S]` — `Backend/app/routers/public.py:28`

### 7.2 Endpoint publik

| Endpoint | Method | Auth | Query/field | Perilaku | Bukti |
|---|---|---|---|---|---|
| `/api/v1/public/news` | GET | Publik | `offset`, `limit` (1–50) | Hanya `status == "published"`; urut `published_at`, `created_at`, `id`; return `items/offset/limit`; tanpa total, search, excerpt | `public.py:75-100` |
| `/api/v1/public/news/{slug}` | GET | Publik | path `slug` | Hanya published; return detail + `content`; 404 jika tidak ada | `public.py:103-125` |
| `/api/v1/public/programs` | GET | Publik | `offset`, `limit` (1–50) | Semua program, semua periode; urut `created_at`; return `items/offset/limit`; tanpa detail, filter, total, periode/divisi | `public.py:128-159` |
| `/api/v1/public/organization` | GET | Publik | — | Periode aktif + divisions/members/positions; `photo_url` dikembalikan mentah | `public.py:162-238` |
| `/api/v1/public/visits` | POST | Publik + rate limit | `page` | Mencatat `VisitorLog`; 429 jika limit; tidak dipakai frontend | `public.py:241-279` |

### 7.3 Bentuk data publik

- News list item: `id`, `title`, `slug`, `featured_image`, `published_at`, `images`; `content` hanya pada detail. `[S]` — `public.py:53-72`; `frontend/types/news.ts:34-45`
- News image: `id`, `news_id`, `storage_key`, `url`, `caption`, `sort_order`, `created_at`. `[S]` — `public.py:41-50`
- Program publik: `id`, `name`, `slug`, `description`, `status`, `start_date`, `end_date`. `[S]` — `public.py:146-154`; `frontend/types/programs.ts:16-24`
- Organization: `period {id,name}`, `divisions {id,name,description}`, `members {id,name,division_id,position_id,photo_url}`, `positions {id,name}`. `[S]` — `public.py:208-238`; `frontend/types/organization.ts:17-46`

### 7.4 Status dan validasi

- News status adalah string `VARCHAR(20)` dengan default `draft`; nilai yang dipakai frontend: `draft`, `published`, `archived`. `[S]` — `Backend/app/models/content.py:44-49`; `frontend/types/news.ts:1`
- Program status adalah string bebas `VARCHAR(30)` dengan default `planned`; **tidak ada enum/check constraint/validasi nilai**. `[S]` — `Backend/app/schemas/content.py:3`; `Backend/app/models/content.py:211-215`; `23_tabel_himatkn.sql:470-483`
- Admin UI memetakan empat status: `planned`, `ongoing`, `completed`, `cancelled`. `[S]` — `frontend/components/admin/programs/ProgramPrimitives.tsx:1-13`
- Karena backend tidak memvalidasi status, UI publik harus menangani nilai tak dikenal dan tidak boleh menganggap `cancelled` tidak ada. `[S]/[A]`

### 7.5 Data snapshot

Dari `23_tabel_himatkn.sql` (snapshot, bukan live DB): `[S]`

- 1 periode aktif: `2025/2026` (`:389-390`).
- 9 divisi, termasuk `Pembimbing`, `Badan Pengurus Harian (BPH)`, Internal, Eksternal, Reaksi, Minat dan Bakat, Keuangan, Minfo, Sosmas (`:164-173`).
- 57 anggota; seluruh `photo_url` bernilai `NULL` (`:223-280`).
- 1 berita `published`, tanpa `featured_image` (`:305-306`).
- Tabel `programs` ada, tetapi tidak ada baris `INSERT INTO programs` pada dump. `[S]` — `:470-483`; pencarian insert.

Karena tidak ada data program pada snapshot, state “program terisi” tidak dapat diverifikasi dari data saat ini. `[A]`

## 8. Temuan dan gap analysis

### 8.1 Kondisi repository, baseline, dan batas bukti

**Temuan:** `[S]`

- Working tree tidak bersih karena perubahan lokal `Design/index.html` dan file untracked `Design/assets/img/favicon.png`. Perubahan ini bukan bagian audit dan harus dipertahankan.
- Komponen/visual publik utama V2 saat ini ditambahkan pada commit `58b829c` (`StructurePage`, `StructureDirectory`, `OrganizationSection`, aset logo, dan fixture state), sedangkan `Design/` versi terbaru diselesaikan pada `bef3c30`. Secara kronologis, tidak ada bukti bahwa V2 dibangun sebagai port langsung Prototype terbaru. `[S]`
- Baseline `lint`/`tsc` lulus; build tidak dijalankan.
- Tidak ada screenshot V1/Figma di repository; hanya screenshot validasi V2.

**Klasifikasi:** kondisi repository adalah fakta; interpretasi “V2 saat ini tidak dibangun sebagai port langsung Prototype terbaru” adalah `[A]` yang didukung urutan commit.

### 8.2 Route/layout dan cakupan halaman publik

**Gap:** `[S]/[B]`

- Prototype memiliki halaman Kegiatan, Publikasi, Artikel, 404, Bank Soal; V2 hanya punya `/` dan `/struktur` sebagai halaman publik produk.
- `SiteHeader` hanya memiliki lima item: Beranda, Tentang, Program Kerja (anchor), Struktur, Kontak. Tidak ada tautan ke halaman Publikasi/Kegiatan karena route-nya tidak ada. `frontend/components/public/SiteHeader.tsx:10-16`
- `sitemap.ts` hanya memuat dua URL. `frontend/app/sitemap.ts:3-17`
- `docs/AGENTS.md:16` dan `docs/HIMATKN_V1_REDESIGN_GUIDE.md:50-63` melarang membuat page/route baru hanya untuk meniru HTML/state. Jadi halaman Kegiatan/Publikasi/Artikel tidak boleh dibuat tanpa persetujuan eksplisit dan dukungan API.

**Dampak:** redesign tidak bisa “menyamakan semua halaman” dengan Prototype tanpa keputusan produk tentang route baru. `[A]`

### 8.3 Komponen publik: reuse, duplikasi, dan placeholder

**Temuan:** `[S]`

- Komponen publik yang ada: `SiteHeader`, `SiteFooter`, `BrandMark`, `OrganizationSection`, `PublicationsSection`, `PublicImage`, `RefreshButton`, `StructurePage`, `StructureDirectory`.
- `PublicImage` memakai `<img>` (bukan `next/image`), lazy loading, dan fallback ikon. `frontend/components/public/PublicImage.tsx:16-63`
- `SiteHeader` adalah client component dengan state menu mobile; `SiteFooter` statis; `StructureDirectory` client component untuk mode/accordion.
- Tidak ada komponen `ProgramsSection`, `PublicationCard`, `PageHero`, `Breadcrumb`, `Pagination`, `SearchField`, atau `EmptyState` reusable. Section saat ini dirender langsung di page/komponen.
- `frontend/components/ui` hanya `Button.tsx` yang terisi; `FormField`, `Input`, `Select` kosong.

**Gap:** belum ada design-system layer publik yang cukup untuk menampung variasi Prototype (status badge, search, pagination, detail, map). Membuat semuanya sekaligus akan menjadi refactor besar; batch harus incremental. `[A]`

### 8.4 Data flow/API client dan service yang belum dipakai

**Temuan:** `[S]`

- `getPublicNews()` dipakai homepage. `getPublicNewsBySlug()` ada tetapi tidak dipanggil. `frontend/lib/public/news.ts:15-38`
- `getPublicPrograms()` ada tetapi tidak dipanggil. `frontend/lib/public/programs.ts:21-37`
- `getPublicOrganization()` dipakai homepage dan `/struktur`. `frontend/lib/public/organization.ts:14-22`
- `/public/visits` tidak dipanggil dari frontend; dashboard `visitors_total` akan tetap 0 tanpa pemanggil. `Backend/app/routers/dashboard.py:8-10`; pencarian `visits` di frontend tidak menemukan hasil.
- `apiFetch` menangani CSRF dan credentials; auth admin memakai cookie/CSRF existing. `frontend/lib/api/client.ts:17-122`; `frontend/context/AuthContext.tsx:49-128`

**Gap:** ada kapabilitas backend yang belum dipakai (detail berita, program list, visits). Ini bukan blocker visual, tetapi menunjukkan API layer belum “selesai” seperti yang dikatakan dokumen. `[S]/[D]`

### 8.5 Design system: token, tipografi, layout, breakpoint

**Temuan:** `[S]`

| Aspek | Prototype V1 | V2 saat ini |
|---|---|---|
| Latar utama | paper `#FBFDFC` | paper `#F6F4EC`, cream `#F1EEE4`, cream-2 `#E7E3D6` |
| Aksen | green-800 `#0F4D36`, mint `#E3EEE8`, amber `#B07A18` | gold `#C79A3E`, gold-soft `#E4BE66`, gold-ink `#8A6624` |
| Heading | Literata (perkiraan) | Playfair Display + Crimson Text |
| Body/UI | Inter | Space Grotesk + Inter annotation |
| Mono | tidak ada | JetBrains Mono |
| Container | 1130px | 1180px |
| Radius | 4px | 3px |
| Header | sticky, paper, 72px | absolute, transparan di atas hero, 60/72px |
| Hero desktop | kiri, serif, baris kedua italic | terpusat, uppercase sans/serif, tanpa italic |
| Hero mobile | 38px, CTA berdampingan, stats disembunyikan | 1.5rem, CTA kolom, tanpa stats |
| Struktur | tree + kartu person + avatar bulat | grid kartu + foto persegi |
| 404 | paper + mint | dark + gold |

Bukti V2: `frontend/app/globals.css:9-99` (token), `:265-278` (container/section), `:324-418` (hero), `:1328-1352` (mobile hero), `frontend/app/layout.tsx:2-44` (font). Bukti Prototype: `Design/assets/style.css:4-27`, `:65-99`, `:202-220`, `:290-317`, `:272-277`.

**Klasifikasi:** perbedaan token dan implementasi adalah `[S]`. Apakah Prototype atau V2 yang final adalah `[A]/[D]`, karena README Prototype menyebut font masih perkiraan dan screenshot V1 tidak ada di repo.

**Risiko:** token V2 bersifat global dan dipakai admin. `frontend/app/globals.css:6` menyatakan admin memakai keluarga token yang sama; `:41-52` mempertahankan alias semantik. Mengubah `--gold`, `--ink`, `--cream`, atau `--paper` secara global bisa mengubah admin. R1 harus men-scope token publik (misalnya di `.public-site`) atau menambah alias publik, bukan mengganti token global. `[S]/[A]`

### 8.6 Header, navigasi, mobile menu, dan logo

**Temuan:** `[S]`

- `SiteHeader` memakai `data-tone="dark"` dan `className="absolute ..."`; selalu memakai teks `text-on-dark`. `frontend/components/public/SiteHeader.tsx:49-63`
- Header tidak sticky, sehingga navigasi hilang saat scroll. Prototype sticky. `Design/assets/style.css:65-67`
- Navigasi desktop hanya muncul pada `min-[1000px]`; Prototype beralih pada 960px. `frontend/components/public/SiteHeader.tsx:66-68`; `Design/assets/style.css:290-293`
- Menu mobile adalah blok `div` yang di-toggle `block/hidden`, tanpa overlay/transition/focus trap; Prototype memakai panel fixed dengan transisi. `frontend/components/public/SiteHeader.tsx:99-121`; `Design/assets/style.css:293-297`
- Hanya Beranda dan Struktur yang bisa mendapat `aria-current`; anchor section tidak. `frontend/components/public/SiteHeader.tsx:24-30`
- `BrandMark` adalah SVG geometris abstrak, bukan logo HIMATKN. `frontend/components/public/BrandMark.tsx:3-21`
- File logo aktual tersedia di `frontend/public/favicon.png` dan `frontend/public/icon.png` (1080x1350, identik dengan `Design/assets/img/favicon.png`), tetapi tidak dipakai kode. `[S]`
- Prototype masih memakai logo SVG tiruan dan README meminta diganti. `Design/README.md:61`; `Design/kegiatan.html:19`
- `Design/index.html` versi lokal menghapus logo tiruan, tetapi halaman prototype lain masih memakainya. `[S]`

**Gap:** header belum menjadi chrome yang bisa dipakai di halaman terang/gelap; logo belum diputuskan; menu mobile belum memenuhi standar keyboard/focus yang diminta `docs/HIMATKN_V1_REDESIGN_GUIDE.md:48`. `[S]/[A]`

### 8.7 Homepage: hero dan section Tentang

**Temuan:** `[S]`

- Hero V2 memakai `/images/hero-group.jpg` 2400x1800, foto yang sama dengan `Design/assets/img/hero.jpg` 4160x3120 tetapi file/hash berbeda. `frontend/app/(public)/page.tsx:80-89`; inventaris aset.
- Hero V2 terpusat, judul dua baris tanpa italic, tagline “Kabinet Nexus — Beyond Chemistry Into Energy”, dua CTA. `frontend/app/(public)/page.tsx:92-113`; `frontend/app/globals.css:369-418`
- Hero Prototype kiri pada desktop, judul serif dengan baris kedua italic, CTA “Lihat Kegiatan” dan “Kenali Pengurus”, serta tiga stats. `Design/index.html:42-56`; `Design/assets/style.css:91-99`
- Hero V2 tidak memiliki stats; Prototype menampilkan “Kabinet Nexus/Periode 2026”, “7 Divisi/+ BPH”, “Babarsari/Student Center”. Stats ini tidak boleh di-hardcode; jika dipakai, harus diturunkan dari API dan konten yang diverifikasi. `[A]`
- Section Tentang V2 memakai tiga pilar hardcoded di `page.tsx:21-37` dan copy yang lebih pendek. Prototype memakai copy yang lebih panjang dan tiga pilar dengan judul berbeda. `Design/index.html:59-71`
- Hero mobile V2 memakai judul 1.5rem dan CTA kolom. `frontend/app/globals.css:1328-1352`; Prototype memakai 38px dan CTA berdampingan. `Design/assets/style.css:308-317`

**Gap visual:** besar; bukan sekadar penyesuaian warna. `[S]`

### 8.8 Homepage: Program Kerja

**Temuan:** `[S]`

- Section V2 selalu menampilkan empty panel; tidak memanggil `getPublicPrograms()`. `frontend/app/(public)/page.tsx:149-180`
- Teks panel mengatakan “Belum ada program kerja” dan “Kami tidak menampilkan contoh agenda sebagai data resmi.” Ini jujur, tetapi tidak memanfaatkan API yang tersedia. `[S]`
- Link panel berlabel “Pantau kabar terbaru di Instagram” tetapi `href="#publikasi"`; teks dan tujuan tidak cocok. `frontend/app/(public)/page.tsx:174-177`
- Prototype menampilkan tiga kartu program dengan status, organisasi/periode, deskripsi, dan tautan; datanya Lorem ipsum. `Design/index.html:74-80`; `Design/assets/app.js:11-15`
- API publik program menyediakan `name`, `slug`, `description`, `status`, `start_date`, `end_date`, tetapi tidak menyediakan `period_id`, nama periode, `division_id`, atau nama divisi. `Backend/app/routers/public.py:146-154`
- API tidak memiliki detail program, filter status, search, atau total. `Backend/app/routers/public.py:128-159`
- Status backend bebas string; admin UI memetakan empat status termasuk `cancelled`. `Backend/app/schemas/content.py:3`; `frontend/components/admin/programs/ProgramPrimitives.tsx:1-13`
- Prototype hanya memetakan tiga status (`berjalan`, `terencana`, `selesai`), tanpa `cancelled`. `Design/kegiatan.html:54-58`

**Gap:** `[B]` untuk detail/filter/search; `[S]` untuk empty section yang belum memakai API list. Jika R3 mengintegrasikan list, `cancelled` wajib dipetakan dan ditampilkan, bukan diabaikan.

### 8.9 Homepage: Publikasi

**Temuan:** `[S]`

- `PublicationsSection` menampilkan gambar (jika ada), judul, tanggal, dan teks “Detail segera hadir”; tidak ada link. `frontend/components/public/PublicationsSection.tsx:85-108`
- API list tidak mengirim excerpt/content; hanya detail yang mengirim `content`. `Backend/app/routers/public.py:53-72`, `:96-100`
- API list tidak mengirim total; hanya `items/offset/limit`. `Backend/app/routers/public.py:96-100`
- API list tidak memiliki parameter search. `Backend/app/routers/public.py:75-100`
- API detail ada dan `getPublicNewsBySlug()` sudah tersedia, tetapi route detail belum ada. `Backend/app/routers/public.py:103-125`; `frontend/lib/public/news.ts:32-38`
- Prototype menampilkan dua publikasi dengan gambar, judul, excerpt, tanggal, dan tautan detail; gambar `pelantikan.jpg` hilang dan `pelantikan-2.jpg` beresolusi rendah. `Design/index.html:82-88`; `Design/assets/app.js:16-19`; `Design/README.md:62`

**Gap:** visual card bisa diperbaiki dengan data saat ini, tetapi excerpt, detail, search, dan pagination tidak bisa dipenuhi tanpa keputusan route/API. `[B]`

### 8.10 Homepage: Kepengurusan, kontak, footer, dan peta

**Temuan:** `[S]`

- `OrganizationSection` hanya menampilkan periode aktif dan jumlah anggota, plus tombol ke `/struktur`. `frontend/components/public/OrganizationSection.tsx:62-82`
- Prototype menampilkan section gelap dengan judul, stats, grid tujuh divisi, dan tautan “Selengkapnya”. `Design/index.html:90-101`
- API organisasi menyediakan `divisions` (nama/deskripsi) dan `members`; grid divisi bisa dibuat tanpa API baru, tetapi jumlah anggota per divisi perlu dihitung dari `members`. `[S]`
- V2 menambahkan section Kontak yang tidak ada di Prototype; semua nilai kontak masih “Menunggu verifikasi”. `frontend/app/(public)/page.tsx:192-243`
- Footer V2 hanya copyright, tautan Struktur, dan “Kembali ke atas”. `frontend/components/public/SiteFooter.tsx:7-31`
- Prototype footer memiliki navigasi, peta Google Maps, alamat “Jl. Babarsari, Yogyakarta 55281”, dan tautan Maps. `Design/index.html:103-129`
- Data alamat/email/peta belum diverifikasi dan tidak boleh dianggap benar hanya karena ada di Prototype. `[A]`

**Gap:** grid kepengurusan adalah gap visual yang bisa dikerjakan dengan API existing; kontak/peta adalah gap konten yang butuh verifikasi pemilik. `[S]/[A]`

### 8.11 Halaman struktur dan custom dropdown

**Temuan:** `[S]`

- `StructureDirectory` memiliki dua mode, select divisi, grid anggota, BPH hierarchy, dan accordion “Lihat Semua”. `frontend/components/public/StructureDirectory.tsx:452-633`
- Select masih `<select>` native; ini bertentangan dengan koreksi pemilik “custom dropdown struktur: jangan tampil seperti select bawaan browser.” `frontend/components/public/StructureDirectory.tsx:538-549`; `docs/HIMATKN_V1_REDESIGN_GUIDE.md:48`
- Prototype juga memakai `<select>` di markup, tetapi dibungkus `.select` dan diberi styling; koreksi pemilik tetap meminta dropdown custom. `Design/struktur.html:51-54`; `Design/assets/style.css` selector `.select`.
- Struktur V2 memakai tema gelap dan kartu foto persegi; Prototype memakai paper terang, tree, kartu person, avatar bulat. `frontend/components/public/StructurePage.tsx:16-17`; `Design/assets/style.css:202-220`
- BPH dideteksi dengan regex nama divisi (`/\bbph\b|badan pengurus harian/i`) dan kategori jabatan (`Ketua Himpunan`, `Wakil Ketua`, `Sekretaris/Bendahara`). `frontend/components/public/StructureDirectory.tsx:73-116`
- API tidak menyediakan flag BPH/advisor; deteksi nama adalah asumsi data. `[A]`
- `docs/progress.md:404` historis menyatakan BPH “dikelompokkan netral berdasarkan division_id, bukan ditebak sebagai tipe tersendiri”; source saat ini justru menebak tipe. Ini adalah drift dokumentasi atau perubahan desain yang belum dicatat. `[D]/[S]`
- Mode “Lihat Semua” memakai accordion untuk divisi non-BPH, sedangkan Prototype menampilkan seluruh divisi bertumpuk. `frontend/components/public/StructureDirectory.tsx:591-630`; `Design/assets/style.css:218-220`

**Gap:** interaction-only untuk custom dropdown; visual-only untuk tema/tree/kartu; ambiguous untuk BPH dan mode “Lihat Semua”. `[S]/[A]`

### 8.12 404, metadata, SEO, dan fixture `__structure-state`

**Temuan:** `[S]`

- 404 V2 ada, tetapi visualnya dark/gold; Prototype paper/mint. `frontend/app/not-found.tsx:17-47`; `Design/404.html:43-50`
- 404 V2 CTA kedua “Lihat publikasi” mengarah ke `/#publikasi`; Prototype CTA kedua “Lihat Program Kerja” ke `kegiatan.html`. `frontend/app/not-found.tsx:39-42`; `Design/404.html:48`
- Metadata root memakai domain Vercel; sitemap/robots memakai domain `himatknuklir.web.id`. `frontend/app/layout.tsx:47`; `frontend/app/sitemap.ts:6,12`; `frontend/app/robots.ts:10`
- `__structure-state` memakai data hardcoded (`period`, `states`) dan dirender sebagai `StructurePage`. `frontend/app/(public)/__structure-state/page.tsx:4-62`
- Route ini berada di bawah `(public)` layout, sehingga mendapat header/footer publik. `frontend/app/(public)/layout.tsx:16-18`
- `robots.ts` tidak melarang route ini. `frontend/app/robots.ts:3-11`
- Ini melanggar prinsip “jangan membuat halaman produksi berdasarkan states.html” dan “jangan membuat TSX untuk dummy data/state” pada `docs/AGENTS.md:19-21`. `[S]/[D]`

**Gap:** route fixture harus dihapus/dilindungi sebelum rilis; metadata domain harus diputuskan; 404 visual perlu diselaraskan. `[S]/[A]`

### 8.13 Drift dokumentasi dan rekomendasi pembaruan

**Temuan:** `[S]/[D]`

| Dokumen | Klaim/isi | Kondisi aktual | Rekomendasi |
|---|---|---|---|
| `docs/progress.md:409-413` | `OrganizationSection` menampilkan divisi, anggota, jabatan, jumlah divisi/anggota | Source hanya periode + jumlah anggota (`OrganizationSection.tsx:62-82`) | Perbarui catatan historis di entri baru; jangan edit entri lama. |
| `docs/progress.md:404` | BPH tidak ditebak; dikelompokkan netral | Source mendeteksi BPH via regex (`StructureDirectory.tsx:73-79`) | Catat sebagai perubahan perilaku dan minta keputusan pemilik. |
| `docs/progress.md:502` | Fixture validasi sementara tidak ikut build | `__structure-state` adalah route nyata dan tidak diblokir robots | Hapus/lindungi fixture; perbarui catatan. |
| `docs/progress.md:499` | Menyebut `progress.md` root | File aktual `docs/progress.md` | Perbaiki referensi path di dokumentasi baru; jangan ubah riwayat lama. |
| `docs/INSTALL_GUIDE.md:8-10` | Menyebut `AGENTS.md`, `progress.md`, `OPEN_CODE_FIRST_PROMPT.md` di root dan dua folder design reference lama | Path aktual `docs/AGENTS.md`, `docs/progress.md`; folder lama deprecated | Perbarui guide pada sesi dokumentasi terpisah. |
| `docs/OPEN_CODE_FIRST_PROMPT.md:10` | Hanya boleh menambahkan catatan ke `docs/progress.md` | Sesi ini juga membuat laporan audit baru | Tambahkan pengecualian laporan audit pada prompt berikutnya. |
| `docs/HIMATKN_V1_REDESIGN_GUIDE.md:16` | Screenshot revisi mencakup homepage/struktur | Tidak ditemukan screenshot V1 di repo | Lampirkan screenshot atau tandai tidak tersedia. |
| `docs/DESIGN_REFERENCE_GUIDE.md:29-30` | Mengikuti perbedaan desktop/mobile pada screenshot | Screenshot V1 tidak ditemukan | Sama seperti di atas. |
| `docs/AGENTS.md:16` | API layer frontend belum selesai | Masih benar, tetapi ada service publik yang belum dipakai | Tambahkan inventaris endpoint/service aktual. |
| `docs/FRONTEND_ARCHITECTURE.md:51` | Beberapa UI primitive kosong | Akurat: `FormField`, `Input`, `Select` kosong | Tidak perlu diubah sekarang; jaga sebagai placeholder. |

**Klasifikasi:** semua baris di atas adalah drift dokumentasi yang terverifikasi dari source; rekomendasi pembaruan belum dieksekusi. `[S]/[D]`

## 9. Rencana batch redesign

### 9.1 Gate keputusan sebelum implementasi

Sebelum batch R1 dimulai, pemilik perlu mengonfirmasi:

1. Apakah Prototype `Design/` versi final adalah acuan visual, termasuk token mint/green dan tipografi Literata/Inter? `[A]`
2. Apakah logo resmi adalah `Design/assets/img/favicon.png` / `frontend/public/favicon.png` / `icon.png`, dan apakah boleh dipakai sebagai logo header? `[A]`
3. Apakah foto hero boleh dipakai, dan versi mana yang menjadi sumber (Design 4160x3120 atau V2 2400x1800)? `[A]`
4. Apakah route baru `/publikasi`, `/publikasi/[slug]`, `/kegiatan`, `/kegiatan/[slug]` diizinkan? Tanpa izin ini, halaman-halaman Prototype tidak bisa dibuat. `[B]`
5. Apakah status program yang tampil di publik mencakup `cancelled`, dan bagaimana urutan/visibilitasnya? `[A]`
6. Apakah data program akan diisi pemilik sebelum validasi visual? Snapshot saat ini tidak memiliki program. `[A]`
7. Apakah kontak/peta/alamat sudah diverifikasi? `[A]`

### 9.2 Batch R1 — Sistem visual publik, chrome, dan homepage

**Tujuan:** menyelaraskan bahasa visual publik dengan Prototype V1 tanpa mengubah admin, backend, atau route.

**Scope yang mungkin disentuh:**

- `frontend/app/globals.css` — token publik yang di-scope, tipografi, spacing, container, hero, section, publication/organization teaser.
- `frontend/app/layout.tsx` — hanya jika pemilik mengonfirmasi keluarga font; saat ini memuat lima font.
- `frontend/components/public/SiteHeader.tsx`, `SiteFooter.tsx`, `BrandMark.tsx` — header sticky/theme-aware, logo decision, menu mobile focus.
- `frontend/app/(public)/page.tsx` — hero, Tentang, kontak; tanpa mengubah data flow API.
- `frontend/app/(public)/loading.tsx`, `frontend/app/not-found.tsx` — skeleton/404 visual.
- `frontend/components/public/PublicationsSection.tsx` — visual card, tetap tanpa link detail palsu.

**Non-goals:** tidak membuat route baru, tidak menambah endpoint, tidak mengubah admin token global, tidak menyalin HTML/CSS/JS Prototype mentah.

**Risiko:** token global dapat merusak admin; font loading lima keluarga; hero photo rights; copy kontak belum terverifikasi.

**Verifikasi:** `npm run lint`, `npx tsc --noEmit`, screenshot 390/768/1280, keyboard menu, focus state, tidak ada horizontal overflow, admin dashboard/login tidak berubah.

### 9.3 Batch R2 — Halaman `/struktur`

**Tujuan:** menyelaraskan visual dan interaksi struktur dengan Prototype, terutama custom dropdown.

**Scope yang mungkin disentuh:**

- `frontend/components/public/StructurePage.tsx`
- `frontend/components/public/StructureDirectory.tsx`
- `frontend/app/(public)/struktur/loading.tsx`
- `frontend/app/globals.css` — style struktur yang di-scope.

**Pekerjaan:**

- Ganti native `<select>` dengan listbox custom yang memiliki keyboard interaction, focus, selected state, dan `aria` yang benar.
- Pertahankan mode “Per Divisi”/“Lihat Semua”, BPH hierarchy, dan state error/empty.
- Selaraskan tema terang/gelap, tree/kartu, avatar, dan responsive dengan Prototype.
- Jangan menambah flag BPH ke API; jika tetap memakai regex, dokumentasikan sebagai asumsi data.

**Non-goals:** tidak mengubah `/public/organization`; tidak menambah route; tidak mengubah data anggota.

**Verifikasi:** keyboard (Tab/Arrow/Enter/Escape), focus visible, screen reader label, 390/768/1280, state error/no-period/no-divisions/empty-members, tidak ada overflow.

### 9.4 Batch R3 — Section data homepage (organisasi dan program)

**Tujuan:** mengisi gap data yang sudah didukung API tanpa membuat route/detail palsu.

**Scope yang mungkin disentuh:**

- `frontend/app/(public)/page.tsx`
- komponen presentasional baru di `frontend/components/public/` jika diperlukan (misalnya `ProgramsSection`, `DivisionGrid`)
- `frontend/lib/public/programs.ts` (sudah ada; hanya dipanggil)
- `frontend/types/programs.ts` (sudah ada)
- `frontend/app/globals.css`

**Pekerjaan:**

- Organisasi: tampilkan grid divisi dari `data.divisions` dan hitung anggota per divisi dari `data.members`; tetap gunakan periode aktif API.
- Program: panggil `getPublicPrograms()` dengan batas kecil; tampilkan status dengan mapping empat nilai (`planned`, `ongoing`, `completed`, `cancelled`), termasuk label “Dibatalkan” untuk `cancelled`; jangan membuat link detail karena endpoint detail tidak ada.
- Jika aturan periode/visibilitas belum dikonfirmasi, pertahankan empty state jujur dan jangan menampilkan data yang tidak pasti.
- Perbaiki teks/link “Instagram” yang saat ini mengarah ke `#publikasi`.

**Non-goals:** tidak membuat filter/search program, tidak membuat pagination, tidak membuat detail program, tidak mengubah API.

**Risiko:** `/public/programs` tidak memiliki filter periode; program lama bisa muncul. Tanpa `period_id`, tidak mungkin memfilter program berdasarkan periode aktif hanya dari response program. Ini harus diputuskan sebelum menampilkan data program sebagai “periode aktif”. `[B]/[A]`

**Verifikasi:** mapping status termasuk `cancelled`, empty/error state, data program kosong saat snapshot, 390/768/1280, lint/tsc.

### 9.5 Backlog yang diblokir

| Fitur | Blocker | Bukti |
|---|---|---|
| Halaman `/publikasi` + search | Route baru dilarang; API tidak punya `q`; tidak ada total | `public.py:75-100`; `docs/AGENTS.md:19-22` |
| Pagination angka publikasi | API tidak punya total; hanya offset/limit | `public.py:96-100` |
| Excerpt publikasi | List tidak mengirim content/excerpt | `public.py:53-72`, `:97` |
| Detail publikasi `/publikasi/[slug]` | API siap, route belum ada; butuh izin route | `public.py:103-125`; `getPublicNewsBySlug` ada |
| Halaman `/kegiatan` + filter/search | Route baru dilarang; API tidak punya status/q/total | `public.py:128-159` |
| Detail program `/kegiatan/[slug]` | Tidak ada endpoint detail program | `public.py:128-159` |
| Metadata periode/divisi program | Response program tidak memuat `period_id`/`division_id`/nama | `public.py:146-154` |
| Peta/kontak | Alamat/email/peta belum diverifikasi | `page.tsx:223-240`; Prototype `index.html:115-127` |
| Visitor analytics | `/public/visits` tidak dipanggil | `public.py:241-279`; `dashboard.py:8-10` |
| Bank soal | Keputusan produk: di luar scope | `Design/README.md:65` |

## 10. Risiko dan pertanyaan terbuka

| ID | Pertanyaan/keputusan | Dampak | Rekomendasi |
|---|---|---|---|
| Q1 | Prototype atau V2 yang menjadi acuan visual final? | Menentukan seluruh token, font, header, hero, struktur | Konfirmasi sebelum R1; jangan rewrite token global tanpa keputusan. |
| Q2 | Font final: Literata/Inter atau Playfair/Crimson/Space Grotesk? | Tipografi seluruh situs; performance | Konfirmasi dari Figma/screenshot; Prototype README menyebut Literata masih perkiraan. |
| Q3 | Logo resmi mana? | Brand identity, header/favicon | Gunakan file logo asli setelah dikonfirmasi; jangan pakai SVG tiruan. |
| Q4 | Hak pakai foto hero dan versi resolusi | Legal/asset | Konfirmasi pemilik; gunakan sumber resolusi tinggi jika diizinkan. |
| Q5 | Route publikasi/kegiatan/detail diizinkan? | Menentukan cakupan redesign | Jika tidak, redesign hanya `/` dan `/struktur`. |
| Q6 | Apakah search publikasi harus server-side? | Fitur search | API belum mendukung; jangan mock. |
| Q7 | Apakah program detail akan dibuat? | Kartu program clickable | API detail belum ada; jangan buat link palsu. |
| Q8 | Status `cancelled` ditampilkan bagaimana? | Kebenaran data | Wajib dipetakan; jangan diabaikan. |
| Q9 | Program dari periode mana yang tampil? | Kebenaran data | API tidak punya filter periode; perlu keputusan/endpoint. |
| Q10 | Kontak/peta/alamat resmi? | Konten produksi | Verifikasi pemilik; jangan pakai placeholder di rilis. |
| Q11 | Foto anggota kosong; fallback apa? | Visual struktur | `default-avatar.png` tersedia tetapi belum dipakai; pilih ikon/avatar. |
| Q12 | `__structure-state` dihapus/dilindungi? | Risiko produksi | Hapus atau block sebelum rilis. |
| Q13 | Domain canonical: Vercel atau `himatknuklir.web.id`? | SEO | Samakan metadataBase, sitemap, robots. |
| Q14 | Apakah lima font dipertahankan? | Performance | Kurangi jika Prototype hanya butuh dua keluarga. |
| Q15 | Data program kosong; siapa mengisi? | Validasi R3 | Jangan seed/ubah DB; minta data pemilik. |

## 11. Verifikasi akhir

Dijalankan setelah laporan dan entri `docs/progress.md` ditulis. `[S]`

`git status --short --branch`:

```text
## feat/admin-ui-foundation...origin/feat/admin-ui-foundation
 M Design/index.html
 M docs/progress.md
?? Design/assets/img/favicon.png
?? docs/audit/
```

`git diff --check`: tidak ada whitespace error; hanya warning normalisasi LF/CRLF pada `Design/index.html` dan `docs/progress.md`.

Konfirmasi:

- Perubahan baru dari sesi ini hanya `docs/audit/REDESIGN_AUDIT_2026-11-12.md` dan entri baru di `docs/progress.md`. `[S]`
- `Design/index.html` dan `Design/assets/img/favicon.png` adalah kondisi awal yang dipertahankan; tidak diubah, di-stage, atau di-revert. `[S]`
- Tidak ada perubahan backend, database, migration/seed, auth/CSRF/CORS/RBAC/cookie, dependency/lockfile, environment, deployment, atau source frontend. `[S]`
- `npm run build` tidak dijalankan. `[S]`

## Lampiran A — Route matrix

| Route | File | Layout | Data | State | Status |
|---|---|---|---|---|---|
| `/` | `frontend/app/(public)/page.tsx` | Public | `/public/news`, `/public/organization` | news error/empty; org error/no-period; program hardcoded empty; contact placeholder | Produksi |
| `/struktur` | `frontend/app/(public)/struktur/page.tsx` | Public | `/public/organization` | error/no-period/no-divisions/empty-members | Produksi |
| `/__structure-state` | `frontend/app/(public)/__structure-state/page.tsx` | Public | Hardcoded | error/no-period/no-divisions/empty-members | Fixture; risiko |
| `/login` | `frontend/app/(private)/(auth)/login/page.tsx` | Private auth | `/auth/*` | login/error/loading | Admin |
| `/admin/dashboard` | `frontend/app/(private)/(admin)/admin/dashboard/page.tsx` | Admin | `/admin/dashboard` | loading/error/permission | Admin |
| `/admin/news` | `frontend/app/(private)/(admin)/admin/news/page.tsx` | Admin | `/admin/news` | loading/error/status filter/pagination | Admin, read-only |
| `/admin/programs` | `frontend/app/(private)/(admin)/admin/programs/page.tsx` | Admin | `/admin/programs`, `/admin/organization/periods` | loading/error/CRUD dialogs | Admin |
| 404 | `frontend/app/not-found.tsx` | Root | — | — | Produksi |

## Lampiran B — Component/data matrix

| Komponen | Dipakai di | Data | Catatan |
|---|---|---|---|
| `SiteHeader` | Public layout | Statis | Nav 5 item; dark absolute; mobile menu client. |
| `SiteFooter` | Public layout, 404 | Statis | Minimal; tanpa peta/alamat. |
| `BrandMark` | `SiteHeader` | Statis | SVG abstrak, bukan logo asli. |
| `PublicationsSection` | `/` | `PublicNewsItem[]` | Tanpa detail link; “Detail segera hadir”. |
| `OrganizationSection` | `/` | `PublicOrganizationResponse` | Hanya periode + jumlah anggota. |
| `StructurePage` | `/struktur`, fixture | `PublicOrganizationResponse` | Error/empty states; dark. |
| `StructureDirectory` | `StructurePage` | `PublicOrganizationResponse` | Mode, select native, BPH regex, accordion. |
| `PublicImage` | Publications, Structure | URL/relative | `<img>` + fallback; resolver media. |
| `RefreshButton` | Error states | — | `router.refresh()` + transition. |
| `NewsList` | `/admin/news` | `AdminNews[]` | Read-only; status filter. |
| `ProgramsList` | `/admin/programs` | `AdminProgram[]` | CRUD; status badge 4 nilai. |

## Lampiran C — API contract matrix

| Endpoint | Ada | Dipakai frontend | Gap |
|---|---|---|---|
| `GET /public/news` | Ya | Ya | Tanpa search/total/excerpt. |
| `GET /public/news/{slug}` | Ya | Tidak | Route detail belum ada. |
| `GET /public/programs` | Ya | Tidak | Tanpa detail/filter/total/period metadata. |
| `GET /public/organization` | Ya | Ya | `photo_url` mentah; tanpa flag BPH. |
| `POST /public/visits` | Ya | Tidak | Analytics dashboard tidak terisi. |
| Admin news/programs/organization/media | Ya | Sebagian | UI admin belum selengkap backend. |

## Lampiran D — Asset inventory

| Aset | Dimensi | Ukuran | Dipakai | Catatan |
|---|---:|---:|---|---|
| `Design/assets/img/hero.jpg` | 4160x3120 | 1.043.515 B | Prototype | Foto grup; hash berbeda dari V2. |
| `frontend/public/images/hero-group.jpg` | 2400x1800 | 526.942 B | Homepage V2 | Scene sama; resolusi lebih rendah. |
| `Design/assets/img/pelantikan-2.jpg` | 181x122 | 12.555 B | Prototype | Resolusi sangat rendah; jangan produksi. |
| `Design/assets/img/pelantikan.jpg` | — | — | Prototype | **Tidak ada**; dirujuk `app.js:17`. |
| `Design/assets/img/favicon.png` | 1080x1350 | 250.200 B | Tidak | Logo; untracked; identik dengan public favicon/icon. |
| `frontend/public/favicon.png` | 1080x1350 | 250.200 B | Tidak | Identik; bukan ikon persegi. |
| `frontend/public/icon.png` | 1080x1350 | 250.200 B | Tidak | Identik; tidak direferensikan kode. |
| `frontend/public/default-avatar.png` | 1600x1600 | 16.255 B | Tidak | Fallback avatar tersedia tetapi belum dipakai. |
| `frontend/app/favicon.ico` | — | — | Next metadata | Ikon aplikasi. |
| `Backend/storage/uploads/images/*.jpg` | — | 5 file | Runtime | Upload; bukan aset frontend; belum diaudit isinya. |
| `Backend/storage/uploads/documents/*.pdf` | — | 1 file | Runtime | Upload; bukan aset frontend. |

## Lampiran E — Documentation drift

| File:line | Isu | Tindakan yang disarankan |
|---|---|---|
| `docs/INSTALL_GUIDE.md:8-10` | Path root lama dan folder design reference deprecated | Perbarui ke `docs/AGENTS.md`, `docs/progress.md`, dan `Design/`; hapus instruksi folder lama. |
| `docs/OPEN_CODE_FIRST_PROMPT.md:10` | Hanya progress note yang diizinkan | Tambahkan pengecualian laporan audit baru. |
| `docs/HIMATKN_V1_REDESIGN_GUIDE.md:16` | Screenshot V1 disebut ada | Lampirkan atau tandai tidak tersedia. |
| `docs/DESIGN_REFERENCE_GUIDE.md:29-30` | Screenshot V1 disebut ada | Sama. |
| `docs/progress.md:404` | BPH tidak ditebak | Catat perubahan source saat ini; minta keputusan. |
| `docs/progress.md:409-413` | OrganizationSection menampilkan divisi/anggota | Catat bahwa source saat ini hanya stats. |
| `docs/progress.md:499` | `progress.md` root | Gunakan `docs/progress.md`. |
| `docs/progress.md:502` | Fixture tidak ikut build | `__structure-state` adalah route nyata; hapus/lindungi. |
| `docs/AGENTS.md:16` | API layer belum selesai | Tambahkan inventaris endpoint/service yang sudah ada. |
| `docs/FRONTEND_ARCHITECTURE.md:51` | Placeholder UI | Akurat; pertahankan peringatan. |

## Lampiran F — Evidence index

| Klaim | Bukti |
|---|---|
| Hanya dua halaman publik produk | `frontend/app/(public)/page.tsx`, `struktur/page.tsx`; inventaris route |
| Fixture publik | `frontend/app/(public)/__structure-state/page.tsx:4-62`; `robots.ts:3-11` |
| Header 5 item | `frontend/components/public/SiteHeader.tsx:10-16` |
| Header absolute/dark | `frontend/components/public/SiteHeader.tsx:49-63` |
| Footer minimal | `frontend/components/public/SiteFooter.tsx:7-31` |
| Program empty + link mismatch | `frontend/app/(public)/page.tsx:149-180`, `:174-177` |
| Publikasi tanpa detail | `frontend/components/public/PublicationsSection.tsx:85-108` |
| Organisasi hanya stats | `frontend/components/public/OrganizationSection.tsx:62-82` |
| Struktur native select | `frontend/components/public/StructureDirectory.tsx:530-551` |
| BPH regex | `frontend/components/public/StructureDirectory.tsx:73-116` |
| V2 tokens | `frontend/app/globals.css:9-99` |
| Prototype tokens | `Design/assets/style.css:4-27` |
| V2 fonts | `frontend/app/layout.tsx:2-44` |
| Prototype font caveat | `Design/README.md:60` |
| Public news contract | `Backend/app/routers/public.py:75-125` |
| Public program contract | `Backend/app/routers/public.py:128-159` |
| Organization contract | `Backend/app/routers/public.py:162-238` |
| Visits unused | `Backend/app/routers/public.py:241-279`; grep frontend |
| Program status free string | `Backend/app/schemas/content.py:3`; `models/content.py:211-215` |
| Status mapping 4 nilai | `frontend/components/admin/programs/ProgramPrimitives.tsx:1-13` |
| Data snapshot 9 divisi/57 anggota | `23_tabel_himatkn.sql:164-173`, `:223-280` |
| Satu berita published | `23_tabel_himatkn.sql:305-306` |
| Tidak ada data program | `23_tabel_himatkn.sql:470-483`; tidak ada insert |
| Admin routes implemented | `frontend/components/admin/shell/admin-navigation.tsx:206-210` |
| Admin news read-only | `frontend/app/(private)/(admin)/admin/news/page.tsx:127-140` |
| Metadata domain mismatch | `frontend/app/layout.tsx:47`; `sitemap.ts:6,12` |
| Lint/tsc lulus | hasil eksekusi sesi ini |
