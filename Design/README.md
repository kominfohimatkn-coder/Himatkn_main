# HIMATKN: versi HTML desain lama + state

Versi HTML statis dari desain `old_desktop`, `old_mobile`, dan halaman Struktur (`old structure desktop/mobile`), lengkap dengan halaman dan state tambahan dalam gaya visual yang sama.

## Cara membuka
Buka `index.html` di browser. Supaya peta Google Maps dan font termuat, lebih baik jalankan server lokal:

```
python -m http.server 8000
```
lalu buka http://localhost:8000. Untuk melihat semua state sekaligus, buka **`states.html`**.

## Halaman
| File | Isi |
|---|---|
| `index.html` | Beranda: hero, Tentang, Program Kerja, Publikasi, Kepengurusan, footer + peta |
| `struktur.html` | Susunan kepengurusan: tab Per Divisi / Lihat Semua, dropdown divisi, bagan BPH |
| `kegiatan.html` | Semua program kerja dengan filter status (Semua/Berjalan/Terencana/Selesai) |
| `publikasi.html` | Daftar publikasi + pagination |
| `artikel.html` | Detail berita/program kerja (`?type=berita\|proker&id=...`) |
| `dokumen.html` | Dokumen resmi (4 kartu PDF dengan tombol Lihat dan Unduh). Bersama Bank Soal (tautan Google Drive) ada di dropdown **Informasi** pada header |
| `404.html` | Halaman tidak ditemukan |
| `states.html` | Galeri semua state dalam versi desktop + mobile |

## Pembaruan terakhir
- **Hero mobile** mengikuti slide 15 prototipe: overlay hijau gelap, teks putih di tengah, dua tombol berdampingan.
- **Animasi**: fade-in saat halaman dibuka, hero masuk bertahap (foto zoom-out halus), reveal saat scroll, konten muncul bergiliran setelah loading, garis bawah navigasi, menu mobile bertahap, hover tombol/kartu/foto, transisi antarhalaman. Semua animasi dimatikan otomatis untuk pengguna dengan pengaturan *reduce motion*.
- **Loading seluruh web**: progress bar tipis di atas halaman (saat halaman dibuka dan saat pindah halaman), skeleton di setiap bagian yang memuat data, shimmer pada foto sampai selesai dimuat, dan jeda jaringan simulasi 650 ms supaya loading terlihat (`?delay=0` untuk mematikan). `?loading=all` membuat seluruh halaman tertahan di keadaan memuat.
- **Search bar** di halaman Program Kerja dan Publikasi (pencarian langsung saat mengetik, kata yang cocok di-highlight, jumlah hasil, tombol hapus, dan state tanpa hasil). Di halaman detail program kerja dan detail berita ada search bar ringkas yang mencari ke daftar terkait. URL ikut menyimpan kata kunci (`?q=`).

## State
Panel **State UI** ada di pojok kanan bawah. State juga bisa diatur lewat URL:

| Parameter | Nilai | Berlaku di |
|---|---|---|
| `proker` | filled, empty, loading, error | beranda, kegiatan |
| `news` | filled, empty, loading, error | beranda, publikasi |
| `struktur` | filled, empty, loading, error | beranda, struktur |
| `dokumen` | filled, empty, loading, error | dokumen |
| `map` | error | semua halaman (footer) |
| `menu` | open | semua halaman (mobile) |
| `info` | open | semua halaman (dropdown Informasi di header desktop) |
| `header` | scrolled | semua halaman |
| `view`, `div` | `view=semua`, `div=reaksi` | struktur |
| `filter` | berjalan, terencana, selesai | kegiatan |
| `q` | kata kunci | kegiatan, publikasi (contoh: `kegiatan.html?q=podcast`) |
| `loading` | all | seluruh bagian halaman dalam keadaan memuat |
| `delay` | angka ms | lama simulasi loading (default 650, 0 = tanpa jeda) |
| `panel` | off | sembunyikan panel state |

Ada juga state yang muncul dari interaksi: hover/focus, filter yang tidak punya hasil, pencarian tanpa hasil, divisi tanpa data pengurus, artikel tidak ditemukan, dan peta yang gagal dimuat dalam 9 detik.

## Perbaikan kecil dari desain asli
Gaya visualnya dipertahankan. Hanya bug yang kemarin ditemukan yang diperbaiki:
- Judul program kerja diseragamkan ke Title Case (sebelumnya ada yang KAPITAL semua).
- Grid kepengurusan desktop berisi 7 divisi. Sel kosong di baris terakhir diisi kartu tautan "Lihat seluruh pengurus".
- Paragraf Tentang dan teks Komunitas di mobile tampil utuh, tidak terpotong.
- Publikasi di beranda menampilkan dua berita berbeda (di desain, berita yang sama muncul dua kali).

## Yang perlu dilengkapi
- [ ] **Font judul**: diperkirakan *Literata* dari screenshot. Kalau di Figma memakai font lain, ganti `--serif` di `assets/style.css` dan link Google Fonts di tiap file HTML.
- [ ] **Logo**: `brand__logo` masih SVG tiruan sederhana. Ganti dengan file logo asli.
- [ ] **Foto**: taruh `hero.jpg` dan `pelantikan.jpg` di `assets/img/`. `pelantikan-2.jpg` diambil dari screenshot, jadi resolusinya rendah.
- [ ] **Data pengurus divisi selain BPH** di `assets/app.js` (`DATA.divisions[].members`). Format: `{ role: "Kepala Divisi", name: "..." }`. Foto opsional lewat `photo: "assets/img/nama.jpg"`.
- [ ] **Isi program kerja dan berita**: masih lorem ipsum seperti di desain.
- [ ] **Dokumen**: judul, keterangan, ukuran, dan file di `DATA.dokumen` masih **contoh**. Ganti dengan 4 dokumen asli.
- [ ] Sebelum dirilis, hapus `initPanel()` dan set `DELAY` ke 0 di `app.js`. Jeda loading hanya simulasi; di produksi, skeleton cukup tampil selama fetch API berjalan.
