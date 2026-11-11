# Konteks Proyek HIMATKN — Frontend

## 1. Tujuan fase
Fokus fase ini adalah redesign frontend V2 berdasarkan HIMATKN V1 yang diberikan pemilik proyek dan ditempatkan di folder Design/. Referensi desain lama HIMATKN_Public_Design_Reference dan HIMATKN_Admin_Panel_Design_Reference tidak lagi berlaku dan tidak boleh digunakan sebagai acuan visual.

V2 tetap menjadi fondasi teknis. API layer frontend belum selesai; pekerjaan visual tidak boleh mengarang endpoint atau menampilkan data/state yang belum tersedia.

## 2. Stack yang diketahui
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS v4, ESLint.
- Ikon: lucide-react tercantum pada package frontend.
- Backend: FastAPI API-only.
- Database: TiDB Cloud / MySQL-compatible.
- Konteks backend: cookie-based authentication + CSRF, permission-based RBAC, Redis rate limiting, dan S3-compatible object storage.

Ini konteks awal. Verifikasi source lokal sebelum mengandalkan detail implementasi. Backend dan database di luar scope redesign.

## 3. Kontrak API dan data
Jangan menggunakan daftar endpoint dari design reference lama sebagai kontrak API aktif. Kontrak yang boleh dipakai harus diverifikasi dari API client/service dan TypeScript types V2, serta OpenAPI/router/backend source yang disetujui sebagai sumber kontrak.

Periksa endpoint, method, query, payload, response envelope, field, auth requirement, dan error behavior yang benar-benar tersedia. Jangan menyimpulkan dukungan API dari nama halaman, tabel database, atau mockup.

Jika kebutuhan desain belum didukung API, tandai sebagai blocker. Jangan membuat route UI seolah fitur sudah tersedia, jangan membuat mock data production, dan jangan mengubah backend.

## 4. Keamanan frontend
- Credential backend/database, API secret, private key, token rahasia, dan password tidak boleh berada di bundle browser atau NEXT_PUBLIC_*.
- Jangan membaca atau mencetak isi .env* secara penuh.
- Jangan menaruh token/session di localStorage/sessionStorage. Jangan membuat UI membaca HttpOnly cookie.
- Ikuti mekanisme auth/cookie/CSRF/RBAC existing.
- Jangan log authorization headers, cookies, token, password, raw body sensitif, atau response sensitif.
- Tangani 401, 403, 429, offline, dan error API sesuai implementasi yang tersedia; jangan melemahkan proteksi.

## 5. Status audit historis
Informasi ini berasal dari snapshot remote sebelumnya dan wajib diverifikasi ulang:
- Branch dan commit dapat berubah; periksa branch aktif dan git status.
- Script frontend yang pernah ditemukan: dev, build, start, lint.
- FormDialog.tsx, ConfirmDialog.tsx, AdminShell.tsx, AdminSidebar.tsx, lib/admin/, dan lib/public/ pernah ditemukan.
- Beberapa UI primitive pernah kosong pada snapshot lama. Periksa source aktual sebelum digunakan.

Jangan menganggap working tree bersih atau snapshot historis masih cocok dengan source saat ini.

## 6. Prioritas kerja
1. Audit route, components, API client/services, types, data flow, dan Git status.
2. Buat gap analysis terhadap HIMATKN V1.
3. Implementasikan visual-only dan interaksi yang tidak memerlukan kontrak API baru.
4. Catat fitur blocked by API; jangan membuat solusi palsu.
5. Verifikasi responsive behavior, lint/build yang tersedia, diff, dan docs/progress.md.
