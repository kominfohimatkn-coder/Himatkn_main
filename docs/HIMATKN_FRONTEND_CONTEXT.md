# Konteks Proyek HIMATKN — Frontend

## 1. Tujuan fase
Fokus fase ini adalah redesign **website publik** V2 berdasarkan **Prototype Desain HIMATKN V1** yang ditempatkan di folder `Design/` pada root repository. Detail prototype ada di `docs/DESIGN_REFERENCE_GUIDE.md` dan `Design/README.md`.

Referensi lama `HIMATKN_Public_Design_Reference`, `HIMATKN_Admin_Panel_Design_Reference`, dan `HIMATKN_Public_Figma_Reference` sudah deprecated dan tidak boleh digunakan sebagai acuan visual. Daftar lengkap referensi deprecated ada di Current Project State, `docs/progress.md`. Website V1 live (`kominfohimatkn-coder/Himatknuklir_website`) bukan acuan.

V2 tetap menjadi fondasi teknis. API layer frontend belum selesai; pekerjaan visual tidak boleh mengarang endpoint atau menampilkan data/state yang belum tersedia.

## 2. Stack yang diketahui
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS v4, ESLint.
- Ikon: lucide-react tercantum pada package frontend.
- Backend: FastAPI API-only, semua router di prefix `/api/v1`.
- Database: TiDB Cloud / MySQL-compatible.
- Konteks backend: cookie-based authentication + CSRF, permission-based RBAC, Redis rate limiting, dan S3-compatible object storage.

Ini konteks awal. Verifikasi source lokal sebelum mengandalkan detail implementasi. Backend dan database di luar scope redesign.

## 3. Route aktual V2 (terverifikasi dari source)

| Route | File | Status |
|---|---|---|
| `/` | `frontend/app/(public)/page.tsx` | Halaman publik produk (beranda) |
| `/struktur` | `frontend/app/(public)/struktur/page.tsx` | Halaman publik produk |
| `/__structure-state` | `frontend/app/(public)/__structure-state/page.tsx` | **Fixture** state dengan data hardcoded; dapat diakses publik dan belum diblokir `robots.ts`; perlu keputusan sebelum rilis |
| `/login` | `frontend/app/(private)/(auth)/login/page.tsx` | Auth admin |
| `/admin/dashboard` | `frontend/app/(private)/(admin)/admin/dashboard/page.tsx` | Panel admin |
| `/admin/news` | `frontend/app/(private)/(admin)/admin/news/page.tsx` | Daftar berita (read-only di UI) |
| `/admin/programs` | `frontend/app/(private)/(admin)/admin/programs/page.tsx` | CRUD program |
| 404 | `frontend/app/not-found.tsx` | Custom not found |

Tidak ada route `/publikasi`, `/publikasi/[slug]`, atau halaman daftar program kerja. Membuat route baru butuh keputusan pemilik (lihat Current Project State bagian keputusan tertunda).

## 4. Kontrak API dan data
Jangan menggunakan endpoint dari prototype HTML atau referensi desain apa pun sebagai kontrak API aktif. Kontrak yang boleh dipakai harus diverifikasi dari API client/service dan TypeScript types V2, serta OpenAPI/router/backend source yang disetujui sebagai sumber kontrak.

Endpoint publik yang benar-benar ada dan status pemakaiannya di frontend (diverifikasi dari source; detail bukti di `docs/audit/REDESIGN_AUDIT_2026-11-12.md`):

| Endpoint | Service frontend | Dipakai? |
|---|---|---|
| `GET /public/news` | `getPublicNews()` (`frontend/lib/public/news.ts`) | Ya (beranda) |
| `GET /public/news/{slug}` | `getPublicNewsBySlug()` (`frontend/lib/public/news.ts`) | Belum (route detail belum ada) |
| `GET /public/programs` | `getPublicPrograms()` (`frontend/lib/public/programs.ts`) | Belum (section Program Kerja masih empty state) |
| `GET /public/organization` | `getPublicOrganization()` / `loadPublicOrganization()` (`frontend/lib/public/organization.ts`) | Ya (beranda dan `/struktur`) |
| `POST /public/visits` | — | Belum dipanggil dari frontend |

Periksa endpoint, method, query, payload, response envelope, field, auth requirement, dan error behavior yang benar-benar tersedia. Jangan menyimpulkan dukungan API dari nama halaman, tabel database, atau mockup. Keterbatasan yang sudah terverifikasi: `/public/news` tanpa search/total/excerpt; `/public/programs` tanpa detail/filter status/search/total/metadata periode/divisi; status program string bebas sehingga UI wajib aman terhadap nilai tak dikenal.

Jika kebutuhan desain belum didukung API, tandai sebagai blocker. Jangan membuat route UI seolah fitur sudah tersedia, jangan membuat mock data production, dan jangan mengubah backend.

## 5. Bank Soal
Bank Soal adalah requirement klien yang dipenuhi dengan **link eksternal ke folder Google Drive** yang dibuka di tab baru; bukan fitur V2 (V2 bukan portal akademik). Untuk sementara URL di-hardcode di satu konstanta frontend (misalnya `frontend/lib/public/links.ts`) dan dipakai navbar desktop, menu mobile, dan footer. Ini utang teknis sampai backend menyediakan `GET /public/settings`. V2 tidak membangun upload/pencarian/filter bank soal.

## 6. Keamanan frontend
- Credential backend/database, API secret, private key, token rahasia, dan password tidak boleh berada di bundle browser atau NEXT_PUBLIC_*.
- Jangan membaca atau mencetak isi .env* secara penuh.
- Jangan menaruh token/session di localStorage/sessionStorage. Jangan membuat UI membaca HttpOnly cookie.
- Ikuti mekanisme auth/cookie/CSRF/RBAC existing.
- Jangan log authorization headers, cookies, token, password, raw body sensitif, atau response sensitif.
- Tangani 401, 403, 429, offline, dan error API sesuai implementasi yang tersedia; jangan melemahkan proteksi.
- Jangan menyalin nama anggota, username admin, hash password, atau data pribadi dari dump database (`*.sql`) ke dokumentasi; gunakan agregat.

## 7. Status audit historis
Informasi ini berasal dari snapshot remote sebelumnya dan wajib diverifikasi ulang:
- Branch dan commit dapat berubah; periksa branch aktif dan git status.
- Script frontend yang pernah ditemukan: dev, build, start, lint.
- FormDialog.tsx, ConfirmDialog.tsx, AdminShell.tsx, AdminSidebar.tsx, lib/admin/, dan lib/public/ pernah ditemukan.
- Beberapa UI primitive pernah kosong pada snapshot lama. Periksa source aktual sebelum digunakan.

Jangan menganggap working tree bersih atau snapshot historis masih cocok dengan source saat ini. Entri riwayat sebelum 11 November 2026 ada di `docs/progress.md` bagian Historical Archive; keputusan visualnya tidak berlaku.

## 8. Prioritas kerja
1. Baca `docs/AGENTS.md` dan Current Project State di `docs/progress.md`.
2. Audit route, components, API client/services, types, data flow, dan Git status.
3. Buat gap analysis terhadap Prototype Desain HIMATKN V1 di `Design/`.
4. Implementasikan visual-only dan interaksi yang tidak memerlukan kontrak API baru.
5. Catat fitur blocked by API; jangan membuat solusi palsu.
6. Verifikasi responsive behavior, lint/build yang tersedia, diff, dan perbarui `docs/progress.md`.
