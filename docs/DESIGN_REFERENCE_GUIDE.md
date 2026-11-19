# Panduan Referensi Desain — Prototype Desain HIMATKN V1

Dokumen ini merangkum isi aktual folder `Design/` pada root repository: README, HTML, `assets/style.css`, `assets/app.js`, dan `assets/img/`. Acuan desain aktif adalah Prototype Desain HIMATKN V1 di `Design/`; source code V2 tetap sumber kebenaran teknis (route, API, tipe, auth, arsitektur). Website V1 live (`kominfohimatkn-coder/Himatknuklir_website`) bukan acuan.

**Referensi deprecated** — jangan dipakai sebagai acuan apa pun: `HIMATKN_Public_Design_Reference/`, `HIMATKN_Admin_Panel_Design_Reference/`, `HIMATKN_Public_Figma_Reference` (termasuk screenshot seperti `programs-empty-state-desktop.png` dan `programs-empty-state-mobile.png`), serta token/font batch lama (palet cream/gold, Cormorant Garamond/Manrope, Space Grotesk/Playfair Display/Crimson Text/JetBrains Mono sebagai keputusan visual). Detail ada di Current Project State, `docs/progress.md`.

## Cara menggunakan Design/
1. Baca `Design/README.md` untuk daftar halaman dan cara membuka (server lokal, misalnya `python -m http.server 8000`).
2. Baca HTML yang relevan dengan route V2 yang memang sudah ada.
3. Periksa `assets/style.css` dan `assets/app.js` yang dirujuk HTML.
4. Implementasikan ulang di source Next.js/React V2. Jangan menjadikan HTML statis sebagai route produksi dan jangan menyalin HTML/CSS/JS mentah ke runtime.

## Daftar halaman prototype dan padanannya di V2

| File | Peran | Padanan di V2 |
|---|---|---|
| `index.html` | Beranda: hero, Tentang, Program Kerja, Publikasi, Kepengurusan, footer + peta | `/` (`frontend/app/(public)/page.tsx`) |
| `struktur.html` | Susunan kepengurusan: tab Per Divisi / Lihat Semua, dropdown divisi, bagan BPH | `/struktur` (`frontend/app/(public)/struktur/page.tsx`) |
| `kegiatan.html` | Daftar program kerja: search + filter status (Semua/Berjalan/Terencana/Selesai) | Belum ada; butuh keputusan route (g.5–g.6) |
| `publikasi.html` | Daftar publikasi + pagination | Belum ada; butuh keputusan route (g.5) |
| `artikel.html` | Referensi detail berita/program (`?type=berita\|proker&id=...`) | Belum ada; butuh keputusan route (g.5) |
| `404.html` | Halaman not found | `frontend/app/not-found.tsx` |
| `states.html` | Galeri state untuk inspeksi; **bukan** requirement route produksi | Tidak ada padanan; jangan dibuatkan halaman |
| `bank-soal.html` | **Sudah dihapus** dari prototype (commit `5e9aa6c`). Link `bank-soal.html` yang masih tersisa di file lain diabaikan | Tidak ada; Bank Soal dipenuhi via link eksternal Google Drive |

## Token visual terverifikasi dari `Design/assets/style.css`

| Token | Nilai | Catatan |
|---|---|---|
| `--green-950` | `#06261B` | Section gelap & footer |
| `--green-900` | `#0B2A1F` | Judul |
| `--green-800` | `#0F4D36` | Tombol utama, badge selesai |
| `--green-700` | `#1E5A43` | Label kecil, link |
| `--mint` | `#E3EEE8` | Section Tentang, badge berjalan |
| `--paper` | `#FBFDFC` | Latar utama |
| `--ink` | `#13201A` | Teks utama |
| `--muted` | `#5B6863` / `--muted-light: #8A9590` | Teks sekunder |
| `--line` | `#DCE4E0` / `--line-dark: #1C3D31` | Garis pemisah |
| `--on-dark-muted` | `#A7B8B0` | Teks di atas surface gelap |
| `--amber` | `#B07A18` | Badge terencana |
| `--serif` | `"Literata", Georgia, serif` | Judul. **Masih perkiraan** — README menyatakan font judul diperkirakan dari screenshot; ganti di `--serif` bila nama font final berbeda (keputusan g.1) |
| `--sans` | `"Inter", system-ui, sans-serif` | Body/UI |
| `--container` | `1130px` | Lebar konten |
| `--gutter` | `24px` | Padding sisi |
| `--header-h` | `72px` | Tinggi header |
| `--radius` | `4px` | Radius umum |

Catatan tambahan yang terverifikasi dari CSS:
- Header sticky, latar paper, border bawah; state `is-scrolled` saat scroll.
- Breakpoint utama `960px`: nav desktop disembunyikan, tombol menu mobile ditampilkan, menu mobile adalah panel fixed di bawah header dengan transisi dan penutupan via Escape/klik link.
- Halaman struktur: tree kepengurusan, kartu person, avatar bulat 100px.
- 404: kode besar berwarna mint di atas paper.
- Badge status: `berjalan` (mint + titik), `selesai` (hijau), `terencana` (amber); tinggi 26px, uppercase 11px.
- Daftar program: baris bergaris dengan kolom tanggal/judul+deskripsi/meta; hover baris berubah latar.
- Mikro-interaksi: tombol terangkat saat hover, `read-more` bergeser, gambar publikasi zoom halus, kartu person terangkat.

## Yang bukan spesifikasi produksi

Jangan dipindahkan ke V2 apa adanya:
- Teks **Lorem ipsum** dan seluruh objek `DATA` di `assets/app.js` (program, berita, divisi) adalah data contoh. Data produksi harus dari backend; jangan hardcode konten dari prototype (lihat aturan di `docs/AGENTS.md`).
- Panel State UI (`initPanel()`) dan parameter URL state (`?proker=`, `?news=`, `?struktur=`, `?soal=`, `?delay=`, `?map=`, `?menu=`, `?header=`, `?panel=`, `?q=`) adalah alat inspeksi, bukan perilaku aplikasi.
- `states.html` hanya galeri referensi.
- Logo SVG tiruan (README meminta diganti logo asli).
- Foto beresolusi rendah: `assets/img/pelantikan-2.jpg` (181×122); `pelantikan.jpg` dirujuk tetapi tidak ada di folder.
- `assets/img/hero.jpg` (4160×3120) dan `assets/img/favicon.png` (1080×1350) perlu keputusan pemilik (hak pakai, versi final, versi persegi untuk favicon) — lihat keputusan tertunda g.2–g.3.
- Link `bank-soal.html` yang tersisa di beberapa halaman: halaman sudah dihapus; abaikan.
- Filter kegiatan prototype hanya memetakan `berjalan`, `terencana`, `selesai`; status `cancelled` wajib dipetakan di V2 sesuai keputusan pemilik.
- Pagination publikasi adalah markup statis, bukan perilaku data nyata.

## Aturan konten

Konten mengikuti data dari backend. Informasi penting (nama pengurus, jumlah divisi, periode, stats hero, kontak, email, alamat, isi program, isi berita) tidak boleh di-hardcode dari prototype. Jika backend belum menyediakan data, tampilkan empty state yang jujur atau sembunyikan elemennya, lalu catat sebagai gap. Pengecualian: konstanta link Bank Soal (keputusan pemilik; lihat `docs/AGENTS.md`).

## Screenshot Figma

Screenshot revisi pemilik (termasuk acuan hero mobile slide 15–18) **tidak tersedia di repository**. Sampai ditambahkan, prototype di `Design/` menjadi acuan utama. Lihat Current Project State untuk status keputusan.

## Memetakan prototype ke Next.js/Tailwind v4

- Terjemahkan komposisi ke komponen React dan utility Tailwind v4 yang benar-benar dipakai V2; jangan menyalin HTML/CSS/JS mentah ke runtime production.
- Definisikan token publik secara **di-scope** (misalnya di bawah `.public-site` atau alias publik khusus) agar token global admin tidak berubah. Token di `frontend/app/globals.css` dipakai admin juga; mengubah token global bisa mengubah tampilan admin.
- Turunkan nilai dari `assets/style.css`, bukan dari tebakan visual. Bila sebuah nilai tidak ada di CSS, jangan dikarang — catat sebagai pertanyaan.
- Pertahankan semantic HTML, aksesibilitas, keyboard navigation, focus state, dan responsive behavior sesuai `docs/AGENTS.md`.
- Halaman prototype tanpa route V2 (kegiatan, publikasi, artikel) tidak boleh dibuatkan route baru tanpa keputusan pemilik.

## Untuk detail keputusan dan workflow

Ikuti `docs/HIMATKN_V1_REDESIGN_GUIDE.md`, `docs/AGENTS.md`, dan Current Project State di `docs/progress.md`.
