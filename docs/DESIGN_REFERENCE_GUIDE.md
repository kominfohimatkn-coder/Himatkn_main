# Panduan Design Reference HIMATKN

## 1. Lokasi referensi

Ekstrak `design_references.zip` di root repository sehingga struktur awalnya menjadi:

```text
Himatkn_main/
├── HIMATKN_Public_Design_Reference/
├── HIMATKN_Admin_Panel_Design_Reference/
├── frontend/
├── backend/                  # jangan diubah pada fase ini
├── AGENTS.md
├── progress.md
└── docs/
```

Struktur repository lokal mungkin berbeda; pertahankan struktur nyata yang ada dan jangan memindahkan source hanya agar sama dengan ilustrasi ini.

Baca:
- `HIMATKN_Public_Design_Reference/README.md`
- `HIMATKN_Admin_Panel_Design_Reference/README.md`
- `HIMATKN_Public_Design_Reference/BACKEND_ALIGNMENT.txt`
- file HTML yang paling relevan dengan halaman/state yang sedang dikerjakan
- CSS dan JS pada `assets/` untuk memahami detail visual dan interaksi

HTML/CSS/JS referensi adalah **acuan statis**, bukan runtime website. Implementasikan ulang sebagai komponen Next.js/React yang sesuai dengan project. Jangan menjadikan file HTML statis sebagai pengganti route production.

## 2. Bahasa visual public

Public reference mendefinisikan gaya editorial yang tenang:
- Hijau gelap sebagai warna utama.
- Cream/off-white sebagai bidang terang.
- Gold sebagai aksen dan penekanan.
- Heading serif editorial dan UI sans-serif.
- Garis/border tipis, ruang kosong yang cukup, kontras yang terjaga.
- Radius kecil; jangan mengubah desain menjadi UI yang serba pill/terlalu membulat.
- Responsif, dengan navigation dan layout yang tetap masuk akal di layar kecil.

Token warna yang tercantum pada `HIMATKN_Public_Design_Reference/assets/site.css` saat diperiksa:

| Token | Nilai |
|---|---|
| `--green-950` | `#091c15` |
| `--green-900` | `#0d281f` |
| `--green-850` | `#123126` |
| `--cream` | `#f1eee4` |
| `--cream-2` | `#e7e3d6` |
| `--paper` | `#f7f4ea` |
| `--gold` | `#cda247` |
| `--gold-soft` | `#e0c67f` |
| `--ink` | `#173127` |
| `--muted` | `#6d746e` |
| `--danger` | `#9d4d45` |
| `--warning` | `#9b742f` |
| `--success` | `#4d795d` |

Tipografi yang tercantum pada public CSS: `Cormorant Garamond`/Georgia untuk serif dan `Manrope`/Arial untuk sans-serif. Periksa cara font dimuat di project; jangan menambahkan external font dependency tanpa memeriksa kebijakan dan fallback yang tersedia.

## 3. Bahasa visual admin

Admin reference memakai bahasa visual yang sekeluarga dengan public site, tetapi memiliki token/typography sendiri pada CSS reference:

| Token/tujuan | Nilai referensi |
|---|---|
| Green | `#112a21` |
| Green secondary | `#17392d` |
| Cream | `#f3efe6` |
| Paper | `#faf8f2` |
| Gold | `#cd9e48` |
| Ink | `#112a21` |
| Muted | `#68736d` |
| Danger | `#a94b45` |

Admin CSS menggunakan `Playfair Display`/Georgia untuk heading dan `Inter`/Arial untuk UI. **Jangan memaksakan public/admin memakai nilai identik jika itu bertentangan dengan reference.** Jika tokens akan disatukan untuk mengurangi duplikasi, pertahankan hasil visual yang ditunjukkan reference dan gunakan keputusan yang konsisten.

Admin perlu konsisten pada:
- sidebar dan topbar antarhalaman;
- active/hover/focus/disabled states;
- page heading, breadcrumbs, action button, card/panel, form, table dan pagination;
- dialog konfirmasi, loading/empty/error states;
- drawer/navigation mobile yang tidak menutupi interaksi tanpa cara menutup yang jelas.

## 4. States wajib dipertimbangkan

Sebelum halaman dianggap selesai, cocokkan state relevan dari reference, bukan hanya happy path.

Public reference mencakup:
- global `404`;
- resource-level publikasi tidak ditemukan/unpublished;
- `403`;
- maintenance `503`;
- empty publikasi, empty program kerja, struktur tanpa periode aktif, dan divisi tanpa anggota;
- loading, API error, `429`, serta offline;
- detail publikasi dengan featured image null dan galeri kosong, maupun galeri yang terisi.

Admin reference mencakup:
- login;
- `403` dan `404`;
- loading, empty, serta error states;
- halaman/section admin seperti dashboard, programs, publications, members, organization, media, documents, agenda, administrators, notifications, activity log dan settings sebagai acuan tampilan.

Keberadaan mockup admin **tidak membuktikan** bahwa endpoint/fungsi backend-nya dapat ditambahkan atau diubah pada fase ini. Untuk setiap modul, periksa dukungan nyata di source sebelum mengaktifkan aksi.

## 5. Data dan konten reference

- Data di HTML adalah placeholder/fixture desain.
- Jangan menyalin fixture atau dump database ke produksi.
- Untuk struktur organisasi, README public mengarahkan agar Next.js memakai `GET /api/v1/public/organization`, dengan penyaringan/relasi divisi dan jabatan berdasarkan field response yang sebenarnya.
- Jangan menciptakan halaman detail program kerja public karena README menyatakan endpoint detail tersebut belum tersedia.
- Galeri detail publikasi berasal dari `news_images` yang ada di response detail news, bukan endpoint gallery baru.

## 6. Checklist per halaman

- [ ] Layout dan hierarchy cocok dengan file HTML acuan.
- [ ] Token warna/typography sesuai scope public/admin.
- [ ] Mobile layout benar; tidak ada overflow/overlap yang tidak sengaja.
- [ ] Loading, empty, error dan status khusus ditangani sesuai kebutuhan.
- [ ] Data berasal dari API yang telah diverifikasi, bukan fixture production.
- [ ] Interaksi keyboard/focus dan label aksesibel.
- [ ] Tidak ada kredensial atau data sensitif pada bundle/log.
- [ ] Tidak menduplikasi shared components atau API client.
