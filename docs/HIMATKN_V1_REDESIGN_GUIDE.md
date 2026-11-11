# HIMATKN V1 — Panduan Redesign Frontend

## Keputusan desain
Untuk fase ini, HIMATKN V1 yang diberikan pemilik proyek adalah satu-satunya acuan visual. Referensi lama HIMATKN_Public_Design_Reference dan HIMATKN_Admin_Panel_Design_Reference tidak berlaku lagi dan tidak boleh digunakan untuk menentukan visual, token, layout, komponen, atau state.

Folder referensi V1 ditempatkan di Design/ pada root repository. Periksa struktur aktual setelah ZIP diekstrak; jangan mengasumsikan file berada langsung di Design/ atau di subfolder tertentu.

V2 tetap menjadi fondasi teknis: route, komponen, data flow, API client, tipe, auth, RBAC, dan arsitektur existing tidak diganti demi meniru HTML referensi.

## Hierarki sumber kebenaran
1. Source code frontend V2: menentukan route, komponen, API/data flow, tipe, perilaku, dan batasan implementasi yang benar-benar ada.
2. Referensi V1 di Design/ dan screenshot revisi pemilik proyek: menentukan visual, layout, responsivitas, dan interaksi yang dimaksud.
3. Dokumentasi arsitektur dan aturan repository: menentukan workflow dan batasan teknis.
4. Asumsi agent tidak boleh menggantikan informasi yang belum tersedia. Catat ambiguitas sebagai pertanyaan.

Screenshot revisi yang dikirim pemilik proyek lebih baru daripada HTML ZIP jika keduanya berbeda. Screenshot tersebut mencakup homepage desktop/mobile dan halaman struktur desktop/mobile.

## Referensi ZIP
- index.html: homepage, hero, tentang, program kerja, publikasi, ringkasan kepengurusan, footer/lokasi.
- struktur.html: susunan kepengurusan dan pemilihan tampilan/divisi.
- kegiatan.html: daftar kegiatan/program kerja dan filter.
- publikasi.html: daftar publikasi dan pagination.
- artikel.html: referensi tampilan artikel/detail.
- bank-soal.html: referensi tampilan bank soal.
- 404.html: referensi tampilan not found.
- states.html: galeri preview state, bukan daftar route produksi.
- assets/style.css dan assets/app.js: detail style dan interaksi.
- assets/img/: aset gambar.

Sebagian konten HTML adalah placeholder/lorem ipsum. Aset gambar dapat berupa contoh atau beresolusi rendah. Logo tiruan dan gambar contoh tidak otomatis menjadi aset produksi. Verifikasi sebelum digunakan.

## Arah visual
Gunakan tampilan yang terlihat pada screenshot V1, bukan token dari desain lama:
- Hijau sangat gelap pada footer/section kepengurusan, bidang terang off-white/putih, aksen hijau dan warna netral.
- Heading serif editorial, body/UI sans-serif sederhana.
- Garis pemisah tipis, ruang antarbagian terukur, radius tidak berlebihan.
- Homepage desktop: hero foto grup sebagai background lebar dengan overlay gelap, judul dan CTA di atas foto; section berikutnya menggunakan komposisi editorial.
- Homepage mobile: komposisi hero tersendiri, header ringkas, foto grup sebagai latar, overlay, judul bertingkat, tagline, dan CTA. Jangan sekadar mengecilkan layout desktop. Ikuti screenshot mobile dari pemilik proyek.
- Halaman struktur: desktop menggunakan susunan bertingkat/kolom; mobile menampilkan kartu secara vertikal. Pertahankan perbedaan ini.
- Hindari design system generik, neon, elemen serba pill, atau gaya yang tidak tampak pada referensi.

Jangan menebak font-family atau angka token persis dari screenshot. Ambil dari CSS V1 bila tersedia; jika tidak, pilih padanan terdekat dan dokumentasikan.

## Empat koreksi dari pemilik proyek
1. Search bar publikasi: implementasikan perilaku pencarian hanya jika data/API V2 mendukung. Jika belum, jangan mengarang integrasi atau mock filtering seolah pencarian server tersedia.
2. Kartu program kerja dapat diklik: lakukan jika tujuan detail yang sah sudah tersedia. Hindari nested link/button. Jangan membuat route/detail data baru jika belum didukung.
3. Hero mobile mengikuti screenshot Figma slide 15–18 yang sudah dikirim. Jangan hanya mengecilkan desktop; desktop jangan ikut berubah tanpa alasan.
4. Custom dropdown struktur: jangan tampil seperti select bawaan browser. Pertahankan keyboard interaction, focus, selected state, dan aksesibilitas.

## Batasan API dan halaman
API layer frontend belum selesai:
- Redesign hanya route dan komponen V2 yang benar-benar ada.
- Jangan membuat page/route TSX baru hanya agar semua HTML referensi punya padanan.
- Jangan membuat TSX baru untuk menampilkan state/data/fitur yang belum tersedia.
- Jangan membuat mock data, dummy records, lorem ipsum, atau hardcoded success state sebagai pengganti integrasi.
- Jangan mengarang endpoint, field response, tipe API, service, query parameter, atau perilaku backend.
- Jangan mengubah backend, database, migration, auth, RBAC, storage, rate limiter, atau deployment.
- Jangan refactor API layer dalam pekerjaan visual ini.
- Jangan menghapus perilaku existing demi kemiripan visual.

Jika desain membutuhkan data/endpoint yang belum tersedia, pertahankan alur existing, gunakan fallback jujur yang sudah sesuai pola aplikasi, dan catat sebagai blocked by API. States.html hanya referensi inspeksi, bukan izin membuat route/state produksi baru.

Komponen presentasional internal boleh dibuat jika diperlukan untuk reuse pada route yang sudah ada. Itu bukan izin membuat page, route, atau state palsu.

## Workflow
1. Periksa git status dan branch; pertahankan perubahan lokal.
2. Baca AGENTS.md, frontend/AGENTS.md jika ada, docs/progress.md, docs/HIMATKN_FRONTEND_CONTEXT.md, dan docs/FRONTEND_ARCHITECTURE.md.
3. Periksa Design/ dan README referensi.
4. Petakan route V2, komponen, API services, hooks, types, dan data flow aktual.
5. Bandingkan hanya halaman V2 yang ada dengan referensi V1.
6. Kelompokkan gap: visual-only, interaction-only, blocked by API, atau ambiguous.
7. Laporkan gap analysis dan batch perubahan sebelum implementasi besar.
8. Kerjakan batch kecil, hanya pada route/komponen existing.
9. Jalankan lint/build/typecheck yang benar-benar tersedia; periksa desktop/mobile, keyboard/focus, dan diff.
10. Perbarui docs/progress.md. Laporkan hasil aktual dan blocker.

Jangan melakukan commit, push, merge, deploy, reset, clean, atau operasi destruktif tanpa persetujuan eksplisit.
