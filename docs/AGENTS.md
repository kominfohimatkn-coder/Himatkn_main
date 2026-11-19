# HIMATKN — Instruksi Kerja OpenCode

## Mulai di sini

Agent **tidak boleh mengandalkan** pemuatan otomatis file `AGENTS.md` oleh tooling. Prompt setiap sesi harus menyebut file ini secara eksplisit; jika prompt tidak menyebutnya, tetap baca file ini sebelum bekerja.

Urutan baca konteks pada awal setiap sesi:
1. `docs/AGENTS.md` (file ini)
2. `docs/progress.md` → bagian **Current Project State**
3. `docs/HIMATKN_V1_REDESIGN_GUIDE.md`
4. `docs/DESIGN_REFERENCE_GUIDE.md`
5. `Design/README.md`
6. `docs/HIMATKN_FRONTEND_CONTEXT.md`
7. `docs/FRONTEND_ARCHITECTURE.md`
8. `frontend/AGENTS.md`
9. Laporan audit terbaru di `docs/audit/` (saat ini: `docs/audit/REDESIGN_AUDIT_2026-11-12.md`)

Entri riwayat yang lebih tua dari 11 November 2026 ada di `docs/progress.md` bagian **Historical Archive**. Keputusan visual di dalamnya (token, font, layout, komposisi) tidak berlaku; fakta teknis wajib diverifikasi ulang terhadap source sebelum dipakai.

## 1. Konteks wajib dibaca
Pada awal tugas:
1. Baca `docs/progress.md` — mulai dari bagian **Current Project State**.
2. Baca `docs/HIMATKN_FRONTEND_CONTEXT.md` sebelum mengubah frontend/API layer.
3. Baca `docs/HIMATKN_V1_REDESIGN_GUIDE.md` dan referensi aktual di `Design/` sebelum mengubah UI.
4. Baca `docs/FRONTEND_ARCHITECTURE.md` sebelum membuat/memindahkan komponen.
5. Periksa source aktual dan Git status.

**Acuan desain aktif adalah Prototype Desain HIMATKN V1 di `Design/`.** Referensi lama `HIMATKN_Public_Design_Reference`, `HIMATKN_Admin_Panel_Design_Reference`, dan `HIMATKN_Public_Figma_Reference` sudah deprecated dan tidak boleh dipakai atau dicampur. Daftar lengkap referensi deprecated ada di Current Project State bagian "Referensi deprecated". Jika referensi yang dibutuhkan belum tersedia, laporkan; jangan mengarang.

## 2. Konten mengikuti backend, bukan prototype
`Design/` hanya acuan visual dan interaksi. Konten mengikuti data dari backend:
- Jangan hardcode dari prototype: nama pengurus, jumlah divisi, periode, stats hero, kontak, email, alamat, isi program, dan isi berita.
- Jika backend belum menyediakan data, tampilkan empty state yang jujur atau sembunyikan elemennya, lalu catat sebagai gap.
- **Pengecualian:** link Bank Soal. Sesuai keputusan pemilik, Bank Soal dipenuhi dengan link eksternal ke folder Google Drive yang dibuka di tab baru, untuk sementara di-hardcode di satu konstanta frontend (misalnya `frontend/lib/public/links.ts`) dan dipakai navbar desktop, menu mobile, dan footer. Ini utang teknis sampai backend menyediakan `GET /public/settings`. V2 tidak membangun fitur bank soal sendiri.

## 3. Scope frontend-only
Untuk fase ini hanya frontend yang boleh diubah. Tanpa persetujuan eksplisit, dilarang mengubah backend FastAPI, database/TiDB, migration/Alembic, auth, RBAC, CORS, CSRF, cookie policy, Redis/rate limiting, storage, deployment, environment, secret, DNS/domain, atau konfigurasi produksi.

API layer frontend belum selesai. Redesign hanya menyesuaikan tampilan dan interaksi pada route/komponen yang sudah ada.

## 4. Batasan redesign
- Jangan membuat file page/route TSX baru hanya untuk menampilkan halaman/state yang belum ada.
- Jangan membuat TSX baru untuk dummy data, mock records, lorem ipsum, atau hardcoded success state.
- Jangan membuat halaman produksi berdasarkan states.html; itu hanya galeri referensi.
- Jangan mengarang endpoint, API service, response type, field, query parameter, atau perilaku backend.
- Jangan menyalin HTML/CSS/JS referensi mentah ke runtime production.
- Jangan menghapus fitur V2 yang sudah berfungsi demi visual.
- Komponen presentasional reusable boleh dibuat jika diperlukan oleh halaman V2 yang memang sudah ada, bukan untuk menyamarkan fitur/state yang belum tersedia.

Jika kebutuhan desain terhalang API, tandai blocked by API. Jangan membuat solusi palsu.

## 5. Keamanan
- Jangan membaca atau mencetak isi .env* secara penuh.
- Jangan menyimpan secret di kode frontend atau NEXT_PUBLIC_*.
- Jangan log token, cookie, password, authorization header, atau response sensitif.
- Jangan menyimpan session token di localStorage/sessionStorage.
- Ikuti mekanisme cookie, CSRF, auth, dan RBAC existing.
- Jangan menonaktifkan proteksi untuk melewati 401, 403, 429, CORS, atau CSRF.
- Jangan menyalin nama anggota, username admin, hash password, atau data pribadi dari dump database (`*.sql`) ke dokumentasi; gunakan agregat.

## 6. Workflow
1. Audit git status, branch, file terkait, route, komponen, dan data flow.
2. Tulis rencana singkat dan daftar file yang akan disentuh.
3. Untuk tugas besar, buat gap analysis dan kerjakan per batch kecil.
4. Implementasikan perubahan minimal dalam scope.
5. Review git diff; pastikan tidak ada perubahan backend/database/config/deployment.
6. Jalankan lint/build/typecheck yang tersedia dan catat hasil aktual.
7. Perbarui `docs/progress.md` setiap sesi dan setiap batch berhasil/gagal/terblokir. Tambahkan entri baru ke bagian Active Development Log; jangan mengubah entri lama. Koreksi atas catatan lama dicatat di Current Project State.
8. Sesi audit boleh menulis laporan audit ke folder `docs/audit/` bila sesi memintanya, selain entri `docs/progress.md`.
9. Laporkan file yang berubah, hasil verifikasi, blocker, dan langkah berikutnya.

## 7. Perlindungan perubahan
Jangan mengganti branch, reset, clean, rebase, menghapus file, menimpa perubahan pengguna, commit, push, membuka/merge PR, atau deploy tanpa instruksi eksplisit. Periksa Git status sebelum perubahan. Jika ada perubahan lokal berisiko tertimpa, berhenti dan laporkan.

## 8. Standar implementasi
Implementasikan referensi V1 ke pola Next.js App Router, TypeScript, dan Tailwind CSS v4 yang benar-benar digunakan V2. Reuse komponen existing sebelum membuat baru. Jaga semantic HTML, aksesibilitas, keyboard navigation, focus state, dan responsive behavior. Jangan menambah dependency tanpa alasan kuat. Hindari refactor besar di luar scope. Jangan mengklaim lint/build/test sukses jika belum dijalankan.
