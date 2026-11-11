# Prompt pertama untuk OpenCode — Audit aman, tanpa implementasi

Gunakan prompt ini setelah `AGENTS.md`, `progress.md`, dan folder design reference sudah ada di root working tree HIMATKN.

---

Baca dan patuhi `AGENTS.md`. Baca `progress.md`, `docs/HIMATKN_FRONTEND_CONTEXT.md`, `docs/DESIGN_REFERENCE_GUIDE.md`, dan `docs/FRONTEND_ARCHITECTURE.md`. Baca README dari folder design reference public dan admin di root.

**Tugas sesi ini hanya audit dan rencana. Jangan mengubah kode aplikasi, jangan mengubah backend/database/configuration, jangan memasang dependency, jangan menjalankan mutasi Git, jangan mengganti branch, commit, push, atau deploy.** Kamu boleh memperbarui `progress.md` untuk mencatat hasil audit ini setelah semua pemeriksaan selesai.

Mulai dengan memeriksa `git status --short`, branch aktif, dan perubahan lokal yang ada. Jangan menimpa atau membersihkan perubahan pengguna. Jangan membaca/mencetak nilai `.env` atau secret.

Lakukan audit terarah terhadap:
1. Struktur route dan layout frontend yang nyata.
2. Public/admin shell, komponen UI yang sudah ada, komponen duplikat, serta file placeholder/kosong.
3. API client/service/adapter yang ada, base URL configuration, bentuk tipe response, handling auth/cookie/CSRF, dan penanganan error. Jangan output nilai rahasia.
4. Halaman public dan admin dibandingkan dengan HTML reference. Identifikasi gap desain dan perilaku mobile yang paling penting.
5. Script lint/build dan jenis pemeriksaan yang benar-benar tersedia.
6. Kesesuaian route/fitur terhadap endpoint yang diverifikasi. Jangan menyimpulkan dukungan backend hanya dari mockup.

Hasilkan laporan singkat dengan:
- **Current state**: apa yang benar-benar ada, dengan path file.
- **Risiko/bug prioritas**: severity, alasan, serta reproduksi atau bukti jika dapat diverifikasi.
- **Gap design**: rujukan file HTML, gap spesifik, halaman/state terdampak.
- **API mapping gap**: kontrak yang terverifikasi, mismatch, dan dampak. Jangan ubah backend.
- **Rencana batch**: maksimal 3 batch awal yang terpisah, setiap batch punya scope, daftar file yang kemungkinan disentuh, risiko dan verifikasi.
- **Blocker/konfirmasi**: hanya pertanyaan yang benar-benar menghambat keputusan.

Jangan implementasikan apa pun dalam sesi audit. Setelah laporan selesai, update `progress.md` dengan hasil yang benar-benar diperiksa, file yang berubah (seharusnya hanya `progress.md`), pemeriksaan yang dijalankan, blocker, dan rekomendasi langkah berikutnya. Jangan mengklaim fitur/test yang belum diuji.

---
