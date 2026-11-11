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
| `bank-soal.html` | Bank soal: pencarian + filter semester (halaman baru, ada di navigasi) |
| `404.html` | Halaman tidak ditemukan |
| `states.html` | Galeri semua state dalam versi desktop + mobile |

## State
Panel **State UI** ada di pojok kanan bawah. State juga bisa diatur lewat URL:

| Parameter | Nilai | Berlaku di |
|---|---|---|
| `proker` | filled, empty, loading, error | beranda, kegiatan |
| `news` | filled, empty, loading, error | beranda, publikasi |
| `struktur` | filled, empty, loading, error | beranda, struktur |
| `soal` | filled, empty, loading, error | bank soal |
| `map` | error | semua halaman (footer) |
| `menu` | open | semua halaman (mobile) |
| `header` | scrolled | semua halaman |
| `view`, `div` | `view=semua`, `div=reaksi` | struktur |
| `filter` | berjalan, terencana, selesai | kegiatan |
| `q` | kata kunci | bank soal (contoh hasil kosong: `?q=termodinamika`) |
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
- [ ] **Bank soal**: daftar mata kuliah dan file di `DATA.soal` masih **contoh**. Tautan unduhannya juga belum ada.
- [ ] Hapus `initPanel()` di `app.js` sebelum dirilis.
