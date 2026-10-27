# Konteks Proyek HIMATKN — Frontend-Only Phase

## 1. Tujuan saat ini

Fokus kerja untuk fase sekarang adalah frontend HIMATKN: menyelaraskan UI public dan admin dengan design reference, memperbaiki responsivitas, membangun komponen yang bisa dipakai ulang, serta merapikan mapping API di sisi frontend.

**Backend dan database tidak termasuk scope perubahan.** Database yang dipakai adalah TiDB (MySQL-compatible), tetapi agent tidak boleh menjalankan query mutasi, mengubah schema, migration, seed, atau koneksi. Backend tetap source of truth untuk kontrak API dan aturan bisnis.

## 2. Stack yang diketahui

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS v4, ESLint.
- Ikon: `lucide-react` sudah tercantum pada `frontend/package.json`.
- Backend: FastAPI API-only.
- Database: TiDB Cloud / MySQL-compatible.
- Sistem pendukung backend yang ada dalam konteks proyek: cookie-based authentication + CSRF, RBAC, Redis rate limiting, dan object storage S3-compatible.

Daftar ini adalah konteks awal, bukan izin untuk mengubah komponen backend. Konfirmasi semua detail yang memengaruhi implementasi dari source lokal; jangan menebak konfigurasi environment.

## 3. API public yang dinyatakan oleh design reference

README `HIMATKN_Public_Design_Reference/` mendokumentasikan endpoint berikut:

| Kebutuhan | Endpoint yang dinyatakan |
|---|---|
| List publikasi/news | `GET /api/v1/public/news` |
| Detail publikasi berdasarkan slug | `GET /api/v1/public/news/{slug}` |
| Daftar program kerja | `GET /api/v1/public/programs` |
| Struktur/kepengurusan | `GET /api/v1/public/organization` |
| Visit tracking | `POST /api/v1/public/visits?page=...` |

Gunakan daftar ini sebagai petunjuk untuk audit. Sebelum implementasi, cocokkan dengan router/backend contract aktual dan API client lokal. Jangan menganggap path, field, pagination, envelope, atau parameter query di atas sudah pasti cocok bila source menunjukkan hal yang berbeda.

### Fitur yang tidak boleh diasumsikan tersedia sebagai endpoint public

Menurut README public reference:
- Tidak ada `GET /api/v1/public/programs/{slug}` untuk detail program kerja public.
- Tidak ada endpoint public gallery mandiri. Gallery dalam detail publikasi hanya berasal dari `news_images` yang dikembalikan oleh detail news.
- Tidak ada endpoint public untuk agenda, documents, site settings, admin management, atau notifications.

Jangan menambahkan route UI yang membutuhkan endpoint tersebut seolah-olah sudah tersedia. Jika desain menunjukkan suatu fitur yang belum didukung, pertahankan scope backend saat ini dan catat kebutuhan itu sebagai pertanyaan/blocked item.

Untuk endpoint admin, periksa router FastAPI dan API client yang benar-benar ada. Jangan menyusun path admin dari nama tabel/entity semata.

## 4. Data, kontrak dan adapter frontend

- Backend/API contract adalah sumber kebenaran; design reference hanya mendeskripsikan tampilan dan state.
- API adapter harus menangani perbedaan format data yang benar-benar ditemukan, bukan menebak field.
- Tipe TypeScript sebaiknya mencerminkan response API aktual; pisahkan tipe payload API dari view model jika memang diperlukan normalisasi.
- Tempatkan pemanggilan API di service/client/domain adapter yang jelas. Jangan menambahkan request baru di setiap leaf component bila service yang cocok sudah ada.
- Bila ditemukan perbedaan antara kebutuhan UI dan contract, dokumentasikan endpoint, field/status yang diharapkan, perilaku aktual, dan dampak. Jangan memodifikasi FastAPI/TiDB untuk menutup perbedaan itu.
- Gunakan data contoh hanya untuk test/preview lokal yang jelas diberi label. Jangan hardcode data contoh sebagai data production.

## 5. Keamanan frontend

- Credential backend/TiDB, API secret, private key, token rahasia, dan password tidak boleh berada di bundle browser atau variabel `NEXT_PUBLIC_*`.
- Nilai `NEXT_PUBLIC_*` dianggap publik. URL API dapat publik jika memang perlu, namun secret tidak.
- Jangan menaruh token/session di localStorage atau sessionStorage. Jangan membuat UI membaca HttpOnly cookie.
- Ikuti mekanisme auth/cookie/CSRF yang sudah ada; jangan mengubahnya dari frontend menjadi mekanisme alternatif tanpa persetujuan.
- Jangan log authorization headers, cookies, token, password, raw body sensitif, atau response sensitif ke browser console/server log.
- Pesan error untuk pengguna harus aman. Detail debug tidak boleh membocorkan stack trace atau informasi sesi.
- Status `401`, `403`, `429`, koneksi offline, dan error API perlu ditangani sesuai state design ketika relevan. Jangan mengatasi status tersebut dengan menonaktifkan proteksi atau menghardcode credential.

## 6. Status audit awal repository (cek ulang sebelum coding)

Snapshot remote yang diperiksa pada 2026-10-27:

- `main` berada di `4a68c61eaec7c9d61494958eb0baccb5576bbdd0`, pesan commit `add lucide-react package and atomic design for future`.
- Production deployment yang terakhir diperiksa `READY` dan memakai SHA yang sama dengan `main` saat itu. Status deployment bisa berubah; jangan menganggapnya selalu aktual.
- Branch remote `refactor/stabilize-api-client` saat itu berada 8 commit di belakang `main`, 0 commit di depan.
- Script frontend yang diketahui: `dev`, `build`, `start`, `lint`.
- `FormDialog.tsx` dan `ConfirmDialog.tsx` sudah tersedia di admin/shared; Programs UI sudah menggunakan keduanya.
- Programs memiliki alur CRUD UI. Halaman admin News yang diperiksa masih berupa list/filter dan tidak mengaktifkan aksi create (`canCreate={false}`). Verifikasi source sebelum mengambil keputusan.
- `frontend/components/ui/Button.tsx`, `FormField.tsx`, `Input.tsx`, dan `Select.tsx` ditemukan kosong dalam audit remote saat itu. Verifikasi kondisi lokal; hindari import terhadap file placeholder yang belum diimplementasikan.

Jangan berasumsi tidak ada perubahan lokal yang belum commit. Selalu jalankan `git status --short` secara lokal sebelum perubahan.

## 7. Prioritas kerja yang disarankan

1. Audit lokal: route, shell/layout, API client/service, model response, shared UI, dan working tree.
2. Tutup risiko UI/API yang paling nyata dengan satu batch kecil, setelah rencana disetujui.
3. Buat/selaraskan design tokens dan primitive UI yang benar-benar dipakai ulang.
4. Terapkan komponen pada shell dan halaman representative terlebih dahulu; ukur regresi sebelum memperluas ke seluruh halaman.
5. Cocokkan halaman public dan admin terhadap design reference, termasuk mobile dan loading/empty/error states.
6. Jalankan lint/build yang tersedia, periksa diff dan `progress.md`.

Ini urutan awal, bukan mandat untuk mengerjakan semua fase dalam satu sesi. Prioritas dapat diubah berdasarkan hasil audit lokal dan keputusan pengguna.
