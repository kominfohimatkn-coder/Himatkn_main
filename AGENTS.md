# HIMATKN — Instruksi Kerja OpenCode

Dokumen ini adalah aturan kerja wajib untuk setiap agent yang bekerja di repository HIMATKN.

## 1. Sumber konteks wajib dibaca

Pada awal setiap tugas:
1. Baca `progress.md` untuk mengetahui kondisi kerja terakhir, pekerjaan yang belum selesai, serta blocker.
2. Baca `docs/HIMATKN_FRONTEND_CONTEXT.md` sebelum mengubah frontend/API layer.
3. Baca `docs/DESIGN_REFERENCE_GUIDE.md` dan README dari design reference yang relevan sebelum mengubah UI.
4. Baca `docs/FRONTEND_ARCHITECTURE.md` sebelum membuat atau memindahkan komponen.
5. Periksa implementasi aktual dan Git status terlebih dahulu. Dokumen dan progress adalah konteks, bukan pengganti verifikasi source code terbaru.

Jika salah satu file belum ada di working tree, jangan mengarang isinya. Laporkan kondisi dan buat perubahan minimum yang diperlukan setelah meminta/menyampaikan rencana sesuai konteks tugas.

## 2. Batas scope: frontend-only

**Untuk fase saat ini, hanya frontend yang boleh diubah.**

Dilarang tanpa persetujuan eksplisit:
- Mengubah backend FastAPI, router, schema, model, service, middleware, auth, RBAC, CORS, CSRF, cookie policy, Redis/rate limiting, atau upload/storage backend.
- Mengubah database TiDB, SQL, migration/Alembic, seed, struktur tabel, data produksi, atau koneksi database.
- Mengubah konfigurasi deployment, environment Vercel, secret, DNS, domain, atau melakukan deployment.
- Menghapus atau menulis ulang file besar-besaran hanya demi merapikan struktur.
- Membuat endpoint atau mengasumsikan kontrak API yang belum diverifikasi dari source backend/OpenAPI atau implementasi API yang ada.

Tujuan tahap ini adalah: memperbaiki UI/UX dan responsivitas, membangun komponen berulang yang konsisten, dan menyesuaikan adapter/API layer di frontend dengan kontrak API yang benar-benar tersedia. Jika kontrak backend tidak sesuai dengan kebutuhan desain, dokumentasikan mismatch sebagai blocker; jangan mengubah backend atau membuat workaround yang melemahkan keamanan.

## 3. Keamanan kredensial dan data

- Jangan pernah menaruh API secret, password, private key, token rahasia, kredensial TiDB, atau credential provider di kode frontend, bundle browser, fixture, dokumentasi yang akan dipublikasikan, URL, atau log.
- Variabel `NEXT_PUBLIC_*` adalah nilai publik. Jangan pernah menyimpan secret di dalamnya. API base URL boleh menjadi nilai publik jika memang dibutuhkan; token/secret tidak.
- Jangan membaca atau mencetak `.env*` secara penuh. Jangan pernah menyalin nilainya ke output, screenshot, `progress.md`, commit, issue, atau console.
- Jangan menambahkan `console.log` untuk token, cookie, password, authorization header, request/response body yang berisi data sensitif, atau detail sesi. Hapus debug log yang sensitif jika ditemukan dalam scope tugas dan laporkan penghapusannya.
- Jangan menyimpan credential/session token ke `localStorage` atau `sessionStorage` sebagai jalan pintas.
- Untuk auth berbasis cookie, ikuti pola yang sudah ada. Jangan membuat frontend membaca HttpOnly cookie atau mengubah mekanisme cookie, CSRF, RBAC, dan session backend.
- Jangan menurunkan validasi atau menonaktifkan proteksi agar request berhasil. Jangan hardcode secret untuk melewati CORS, CSRF, 401, 403, atau 429.
- Sanitasi error dan logging. UI boleh menampilkan pesan yang membantu pengguna, tetapi jangan membeberkan stack trace, raw response sensitif, atau detail internal.
- Jika menemukan secret yang mungkin sudah terekspos, jangan menyalinnya lagi ke output. Catat file/lokasi secara aman dan eskalasi kepada pengguna; rotasi secret adalah tindakan manual/pemilik sistem.

## 4. Alur kerja agent

Untuk tugas yang memengaruhi kode:
1. Mulai dengan audit singkat: file terkait, implementasi existing, status Git, dependensi, dan risiko.
2. Tulis rencana singkat dan daftar file yang diperkirakan disentuh. Untuk task besar, kerjakan satu batch kecil pada satu waktu.
3. Implementasikan perubahan terkecil yang memenuhi tujuan. Hindari refactor di luar scope.
4. Periksa diff agar tidak ada perubahan backend/database/configuration yang tidak diminta.
5. Jalankan pemeriksaan relevan yang tersedia di `frontend/package.json` (minimal lint/build untuk perubahan besar jika lingkungan mendukung). Jangan mengklaim tes sukses bila belum dijalankan.
6. **Perbarui `progress.md` setiap sesi dan setiap kali batch pekerjaan selesai, gagal, atau terblokir.** Catat file yang berubah, pemeriksaan yang dijalankan, hasil aktual, dan langkah berikutnya.
7. Sebelum berhenti, rangkum apa yang berubah, apa yang belum, hasil test, serta blocker. Pastikan `progress.md` sudah diperbarui.

Jangan menghapus catatan sesi lama di `progress.md`; tambahkan catatan baru agar riwayat keputusan tetap tersedia.

## 5. Persetujuan dan perlindungan kerja lokal

- Jangan mengganti branch, menjalankan reset/clean/rebase, menghapus file, menimpa perubahan pengguna, membuat commit, push, membuka/merge PR, atau deploy tanpa instruksi eksplisit.
- Sebelum perubahan, periksa `git status --short` dan branch aktif. Jangan menganggap working tree bersih.
- Pertahankan perubahan lokal pengguna yang sudah ada. Jangan “membersihkan” file yang tidak dikenal.
- Jika working tree kotor atau ada file yang berpotensi tertimpa, berhenti dan laporkan sebelum tindakan berisiko.
- Tidak perlu mengulang pertanyaan yang jawabannya sudah ada di `progress.md` atau konteks repository.

## 6. Standar desain dan implementasi

- Gunakan design reference yang ada di root repository sebagai acuan visual primer. Referensi merupakan HTML/CSS/JS statis untuk dipetakan ke Next.js, bukan source runtime untuk langsung ditautkan di production.
- Pertahankan identitas visual: hijau gelap, cream/off-white, aksen gold, heading serif editorial, sans-serif untuk UI, garis tipis, whitespace yang cukup, dan radius kecil. Hindari neon, gaya “AI slop”, ikon brand berbasis huruf, dan elemen yang terlalu membulat.
- Mobile-first. Uji layout pada layar sempit, keyboard, empty/loading/error states, serta interaksi dialog/navigation.
- Gunakan `lucide-react` jika ikon dibutuhkan dan sudah sesuai pola proyek. Jangan membuat variasi ikon atau kontrol yang berbeda-beda tanpa alasan.
- Utamakan aksesibilitas: label form, focus state yang jelas, semantic HTML, kontras, keyboard navigation, dialog yang dapat ditutup dengan aman, dan target sentuh yang memadai.
- Pecah desain menjadi komponen atomik bila ada tanggung jawab yang jelas atau penggunaan berulang. Jangan membuat komponen untuk setiap `div` dan jangan membuat abstraksi generik sebelum kebutuhan reuse nyata.
- Sebelum menambahkan komponen, cari dan gunakan kembali komponen yang sudah ada. File placeholder kosong tidak boleh dianggap siap dipakai.
- Data dari HTML design reference adalah fixture visual. Jangan jadikan data tersebut data produksi atau hardcode dump database di UI.

## 7. API layer frontend

- Verifikasi kontrak API dan pola request yang sekarang ada sebelum mengubahnya.
- Hindari `fetch` tersebar di komponen UI. Gunakan/reuse service atau adapter per domain yang konsisten dengan repository.
- Pisahkan tipe response API, normalisasi data, pengelolaan loading/error, dan rendering UI.
- Tangani status yang relevan secara eksplisit: loading, empty, error umum, unauthorized/forbidden, rate limit (`429`), dan offline bila sesuai.
- Jangan menambahkan endpoint publik baru hanya karena desain memiliki halaman/menu. Fitur yang tidak didukung API saat ini harus tetap tidak aktif atau ditampilkan secara jujur sampai kontraknya dikonfirmasi.
- Jangan mengubah backend ketika response tidak cocok. Catat endpoint, payload/status yang diharapkan, perilaku aktual, dan dampak frontend sebagai blocker.

## 8. Definisi selesai

Sebuah batch belum selesai sampai:
- tujuan batch tercapai dan perilaku existing penting tidak rusak;
- tidak ada perubahan backend/database/deployment di luar scope;
- tidak ada kredensial yang ditambahkan ke kode, console, atau bundle publik;
- pemeriksaan yang relevan dijalankan atau alasan kegagalannya dicatat;
- `progress.md` diperbarui dengan hasil aktual;
- agent memberi ringkasan perubahan dan blocker tanpa klaim yang tidak terverifikasi.
