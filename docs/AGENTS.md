# HIMATKN — Instruksi Kerja OpenCode

## 1. Konteks wajib dibaca
Pada awal tugas:
1. Baca docs/progress.md.
2. Baca docs/HIMATKN_FRONTEND_CONTEXT.md sebelum mengubah frontend/API layer.
3. Baca docs/HIMATKN_V1_REDESIGN_GUIDE.md dan referensi aktual di Design/ sebelum mengubah UI.
4. Baca docs/FRONTEND_ARCHITECTURE.md sebelum membuat/memindahkan komponen.
5. Periksa source aktual dan Git status.

**Desain lama HIMATKN_Public_Design_Reference dan HIMATKN_Admin_Panel_Design_Reference sudah tidak berlaku. Jangan gunakan atau gabungkan desain tersebut.** Acuan desain hanya HIMATKN V1 di Design/ dan screenshot revisi pemilik proyek. Jika referensi belum tersedia, laporkan; jangan mengarang.

## 2. Scope frontend-only
Untuk fase ini hanya frontend yang boleh diubah. Tanpa persetujuan eksplisit, dilarang mengubah backend FastAPI, database/TiDB, migration/Alembic, auth, RBAC, CORS, CSRF, cookie policy, Redis/rate limiting, storage, deployment, environment, secret, DNS/domain, atau konfigurasi produksi.

API layer frontend belum selesai. Redesign hanya menyesuaikan tampilan dan interaksi pada route/komponen yang sudah ada.

## 3. Batasan redesign
- Jangan membuat file page/route TSX baru hanya untuk menampilkan halaman/state yang belum ada.
- Jangan membuat TSX baru untuk dummy data, mock records, lorem ipsum, atau hardcoded success state.
- Jangan membuat halaman produksi berdasarkan states.html; itu hanya galeri referensi.
- Jangan mengarang endpoint, API service, response type, field, query parameter, atau perilaku backend.
- Jangan menyalin HTML/CSS/JS referensi mentah ke runtime production.
- Jangan menghapus fitur V2 yang sudah berfungsi demi visual.
- Komponen presentasional reusable boleh dibuat jika diperlukan oleh halaman V2 yang memang sudah ada, bukan untuk menyamarkan fitur/state yang belum tersedia.
Jika kebutuhan desain terhalang API, tandai blocked by API. Jangan membuat solusi palsu.

## 4. Keamanan
- Jangan membaca atau mencetak isi .env* secara penuh.
- Jangan menyimpan secret di kode frontend atau NEXT_PUBLIC_*.
- Jangan log token, cookie, password, authorization header, atau response sensitif.
- Jangan menyimpan session token di localStorage/sessionStorage.
- Ikuti mekanisme cookie, CSRF, auth, dan RBAC existing.
- Jangan menonaktifkan proteksi untuk melewati 401, 403, 429, CORS, atau CSRF.

## 5. Workflow
1. Audit git status, branch, file terkait, route, komponen, dan data flow.
2. Tulis rencana singkat dan daftar file yang akan disentuh.
3. Untuk tugas besar, buat gap analysis dan kerjakan per batch kecil.
4. Implementasikan perubahan minimal dalam scope.
5. Review git diff; pastikan tidak ada perubahan backend/database/config/deployment.
6. Jalankan lint/build/typecheck yang tersedia dan catat hasil aktual.
7. Perbarui docs/progress.md setiap sesi dan setiap batch berhasil/gagal/terblokir. Tambahkan catatan baru; jangan menghapus riwayat.
8. Laporkan file yang berubah, hasil verifikasi, blocker, dan langkah berikutnya.

## 6. Perlindungan perubahan
Jangan mengganti branch, reset, clean, rebase, menghapus file, menimpa perubahan pengguna, commit, push, membuka/merge PR, atau deploy tanpa instruksi eksplisit. Periksa Git status sebelum perubahan. Jika ada perubahan lokal berisiko tertimpa, berhenti dan laporkan.

## 7. Standar implementasi
Implementasikan referensi V1 ke pola Next.js App Router, TypeScript, dan Tailwind CSS v4 yang benar-benar digunakan V2. Reuse komponen existing sebelum membuat baru. Jaga semantic HTML, aksesibilitas, keyboard navigation, focus state, dan responsive behavior. Jangan menambah dependency tanpa alasan kuat. Hindari refactor besar di luar scope. Jangan mengklaim lint/build/test sukses jika belum dijalankan.
