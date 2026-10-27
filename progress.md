# HIMATKN — Progress Tracker

> Wajib dibaca pada awal setiap sesi dan diperbarui oleh agent pada akhir setiap sesi/batch. Jangan hapus riwayat lama; tambahkan entri baru.

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

## Template catatan sesi berikutnya

Salin bagian ini dan isi dengan fakta aktual setiap selesai satu batch. Jangan mengklaim check/test berhasil jika tidak dijalankan.

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
- **Langkah berikutnya:**
  - 
