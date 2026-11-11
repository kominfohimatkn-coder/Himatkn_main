# Prompt pertama OpenCode — Audit Redesign HIMATKN V1

Gunakan setelah ZIP V1 diekstrak ke folder Design/ pada root repository.

Baca dan patuhi AGENTS.md, frontend/AGENTS.md jika ada, dan docs/AGENTS.md. Baca docs/progress.md, docs/HIMATKN_FRONTEND_CONTEXT.md, docs/HIMATKN_V1_REDESIGN_GUIDE.md, docs/DESIGN_REFERENCE_GUIDE.md, docs/FRONTEND_ARCHITECTURE.md, serta README dan file relevan dalam Design/.

**Desain lama HIMATKN_Public_Design_Reference dan HIMATKN_Admin_Panel_Design_Reference sudah tidak berlaku. Jangan gunakan atau gabungkan desain tersebut.** Gunakan hanya HIMATKN V1 di Design/ dan screenshot revisi pemilik proyek.

## Sesi ini hanya audit dan gap analysis
Jangan mengubah kode aplikasi, backend/database/configuration, memasang dependency, melakukan operasi Git mutatif, commit, push, merge, atau deploy. Perubahan yang diperbolehkan hanya menambahkan catatan audit ke docs/progress.md setelah pemeriksaan selesai.

Mulai dengan memeriksa git status --short --branch dan branch aktif. Pertahankan seluruh perubahan lokal. Jangan membaca/mencetak nilai .env* atau secret. Petakan struktur aktual Design/; jangan menebak path hasil ekstraksi.

Audit:
1. Route/page dan layout frontend V2 yang benar-benar ada.
2. Komponen yang digunakan tiap route, komponen reusable, duplikasi, dan placeholder.
3. API client/service/hooks/types dan data flow yang benar-benar digunakan.
4. Loading/error/empty state yang sudah ada.
5. Gap visual route V2 terhadap referensi V1.
6. Responsive behavior desktop/mobile, khususnya hero homepage dan halaman struktur.
7. Empat koreksi: search publikasi, area klik kartu program kerja, hero mobile, custom dropdown struktur.
8. Script lint/build/typecheck yang benar-benar tersedia.

## Batasan API
API layer frontend belum selesai:
- Jangan membuat page/route TSX baru untuk meniru file HTML atau state yang belum ada.
- Jangan membuat TSX baru untuk dummy data/state.
- Jangan membuat mock data atau lorem ipsum seolah-olah data produksi.
- Jangan mengarang endpoint, response field, type, service, atau query parameter.
- Jangan mengubah backend/database/auth/RBAC.
- Fitur yang membutuhkan API belum tersedia harus ditandai blocked by API.

Laporan harus memuat:
- Current state: route, komponen, API/data flow yang ditemukan beserta path file.
- Design gap: gap spesifik per route yang sudah ada dan referensi V1 terkait.
- API blockers: fitur yang belum didukung dan bukti source.
- Prioritas maksimal tiga batch awal, scope, file yang mungkin disentuh, risiko, dan verifikasi.
- Risiko/pertanyaan yang benar-benar membutuhkan keputusan pemilik proyek.

Jangan implementasikan perubahan kode dalam sesi audit. Setelah laporan selesai, tambahkan ringkasan audit ke docs/progress.md tanpa menghapus riwayat lama. Sebutkan pemeriksaan dan hasil aktual. Jangan mengklaim hal yang belum diverifikasi.
