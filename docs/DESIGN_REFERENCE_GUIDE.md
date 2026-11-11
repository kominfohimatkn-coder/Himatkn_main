# Panduan Referensi Desain HIMATKN

Arah desain yang berlaku ditetapkan dalam docs/HIMATKN_V1_REDESIGN_GUIDE.md. Referensi visual dan aset V1 ditempatkan di Design/ pada root repository. Periksa struktur aktual hasil ekstraksi ZIP.

**Referensi desain lama HIMATKN_Public_Design_Reference dan HIMATKN_Admin_Panel_Design_Reference sudah tidak berlaku.** Jangan mengambil token warna, typography, layout, komponen, state, atau aturan visual dari kedua folder tersebut. Jika file lama masih ada, abaikan untuk keputusan desain dan jangan mencampurnya dengan V1.

## Cara menggunakan Design/
1. Baca README yang tersedia di folder hasil ekstraksi.
2. Baca HTML yang relevan dengan route V2 yang memang sudah ada.
3. Periksa CSS/JS dan aset yang dirujuk HTML.
4. Gunakan screenshot revisi pemilik proyek sebagai acuan terbaru jika berbeda dengan HTML ZIP.
5. Implementasikan ulang di source Next.js/React V2; jangan menjadikan HTML statis sebagai route produksi.

Referensi ZIP yang diketahui:
- index.html: homepage.
- struktur.html: struktur kepengurusan.
- kegiatan.html: daftar kegiatan/program kerja.
- publikasi.html: daftar publikasi.
- artikel.html: referensi tampilan detail artikel.
- bank-soal.html: referensi bank soal.
- 404.html: not found.
- states.html: galeri state untuk inspeksi, bukan requirement route produksi.
- assets/style.css, assets/app.js, assets/img/: style, interaksi, dan aset.

Konten HTML dapat berupa placeholder/lorem ipsum dan aset dapat berupa contoh. Jangan gunakan sebagai data produksi tanpa verifikasi.

## Ketentuan implementasi
- HIMATKN V1 di Design/ adalah acuan visual utama; source V2 adalah acuan teknis.
- Ikuti perbedaan desktop/mobile pada screenshot.
- Hero mobile harus mengikuti screenshot Figma yang sudah diberikan, bukan hasil mengecilkan desktop.
- Halaman struktur memiliki susunan desktop dan mobile tersendiri.
- Empat koreksi pemilik proyek: search publikasi, area kartu program kerja dapat diklik jika route detail tersedia, hero mobile sesuai screenshot, custom dropdown struktur.
- API layer belum selesai. Jangan membuat page/route, data mock, endpoint, field, atau state produksi yang belum didukung source/API V2.
- Jangan membuat file TSX baru hanya untuk memperlihatkan halaman/state yang belum ada.
- Jika kebutuhan desain terhalang API, catat sebagai blocker.

Untuk detail keputusan dan workflow, ikuti docs/HIMATKN_V1_REDESIGN_GUIDE.md.
