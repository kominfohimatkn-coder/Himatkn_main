# Site Settings

`site_settings` menyimpan teks dan tautan yang dapat diubah admin tanpa deploy.
Daftar key resmi ada di `app/services/site_settings.py` (`SETTINGS_REGISTRY`).
Modul itu adalah satu-satunya sumber kebenaran: key di luar registry tidak
dibaca oleh endpoint publik dan dilaporkan sebagai `unknown_keys` di endpoint
admin.

Batch ini **tidak mengubah skema**. Tabel `site_settings` yang sudah ada
(`setting_key`, `setting_value`, `value_type`, `updated_by`) tetap dipakai.

## Registry

45 key, semuanya publik. Nilai default adalah teks netral; data organisasi asli
tidak disimpan di kode.

### brand

| Key | Tipe | Default |
|---|---|---|
| `brand_name` | text | `HIMA TEKNOKIMIA NUKLIR` |
| `brand_subtitle` | text | `POLITEKNIK TEKNOLOGI NUKLIR` |
| `footer_copyright` | text | `""` |
| `footer_institution` | text | `""` |

### links

| Key | Tipe | Host diizinkan | Default |
|---|---|---|---|
| `bank_soal_url` | url | `drive.google.com` | `""` |
| `instagram_url` | url | `instagram.com`, `www.instagram.com` | `""` |
| `instagram_label` | text | — | `""` |

### contact (data)

| Key | Tipe | Host / batas | Default |
|---|---|---|---|
| `contact_email` | email | maks. 254 | `""` |
| `secretariat_address` | multiline | maks. 500 | `""` |
| `maps_url` | url | `maps.app.goo.gl`, `www.google.com`, `google.com`, `maps.google.com` | `""` |
| `maps_embed_url` | url | `www.google.com`, path wajib diawali `/maps/embed` | `""` |

### hero

| Key | Tipe | Default |
|---|---|---|
| `hero_eyebrow` | text | `Himpunan Mahasiswa` |
| `hero_title` | text | `Teknokimia Nuklir` |
| `hero_emphasis` | text | `Bersama` |
| `hero_description` | text (maks. 1000) | `Wadah mahasiswa Teknokimia Nuklir untuk belajar, berkarya, dan berkontribusi.` |
| `hero_primary_label` | text | `Lihat Program Kerja` |
| `hero_secondary_label` | text | `Kenali Kami` |

### about

| Key | Tipe | Default |
|---|---|---|
| `about_eyebrow` | text | `""` |
| `about_title` | text | `Ruang Tumbuh Mahasiswa` |
| `about_description` | text (maks. 1000) | `Himpunan mahasiswa yang menjadi ruang belajar, berkarya, dan berkolaborasi.` |
| `about_item_{1,2,3}_tag` | text | `Komunitas`, `Karya`, `Kolaborasi` |
| `about_item_{1,2,3}_title` | text | sama dengan tag |
| `about_item_{1,2,3}_description` | text (maks. 1000) | deskripsi netral per poin |

### program, news, structure, contact (copy)

| Key | Tipe | Default |
|---|---|---|
| `program_eyebrow` | text | `Program` |
| `program_title` | text | `Program Kerja` |
| `program_empty_text` | text | `Belum ada program kerja.` |
| `news_eyebrow` | text | `Publikasi` |
| `news_title` | text | `Kabar Terbaru` |
| `news_empty_text` | text | `Belum ada publikasi.` |
| `news_more_label` | text | `Lihat semua` |
| `structure_eyebrow` | text | `Organisasi` |
| `structure_title` | text | `Susunan Kepengurusan` |
| `structure_description` | text (maks. 1000) | `Kenali struktur dan anggota kepengurusan.` |
| `structure_note` | text (maks. 1000) | `""` |
| `structure_button_label` | text | `Selengkapnya` |
| `contact_eyebrow` | text | `Kontak` |
| `contact_title` | text | `Hubungi Kami` |
| `contact_description` | text (maks. 1000) | `Sampaikan pertanyaan atau kolaborasi melalui kanal resmi.` |
| `contact_button_label` | text | `Kirim Email` |

`hero_image` **belum** masuk registry. V1 menyimpan URL Vercel Blob eksternal,
sedangkan V2 memakai storage sendiri; ini backlog terpisah.

`period_label`, `structure_item_*`, dan `contact_back_label` tidak dimasukkan
karena berasal dari API organisasi atau bukan setting.

## Validasi

Berlaku untuk `PUT` dan `PATCH`.

- Key harus ada di registry. Key asing pada `PUT` menghasilkan 404 dengan detail
  `Setting tidak dikenal` (key mentah tidak dipantulkan).
- `value_type` ditentukan registry. `value_type` dari klien **diabaikan** dan
  tidak pernah disimpan; `PUT` tetap menerima field itu agar kompatibel.
- Semua nilai di-trim. Null byte dan karakter kontrol ditolak; newline hanya
  diizinkan untuk tipe `multiline` (CRLF dinormalisasi menjadi LF).
- Panjang maksimum: text 300, deskripsi 1000, URL 2048, email 254, alamat 500.
- `url`: kosong (`""`) diperbolehkan. Selain itu wajib `https`, tanpa userinfo,
  tanpa port khusus (hanya default/443), host harus cocok **exact** dengan
  `allowed_hosts`, dan `maps_embed_url` wajib berpath `/maps/embed...`.
  Short link `maps.app.goo.gl` ditolak untuk embed karena tidak bisa di-iframe.
- `email`: format sederhana, maksimum 254 karakter; `""` diperbolehkan.
- `text`: teks polos. Backend tidak melakukan sanitasi HTML; frontend wajib
  merender sebagai teks, bukan HTML.
- Pesan error berbahasa Indonesia dan tidak memuat detail internal.

## Endpoint

### `GET /api/v1/public/settings`

Publik, tanpa auth. Hanya key `public: true` (saat ini semua). Baris DB dengan
key di luar registry diabaikan; nilai DB menimpa default.

```json
{
  "settings": {
    "brand_name": "HIMA TEKNOKIMIA NUKLIR",
    "brand_subtitle": "POLITEKNIK TEKNOLOGI NUKLIR",
    "bank_soal_url": "https://drive.google.com/drive/folders/contoh",
    "instagram_url": "https://www.instagram.com/himatknuklir"
  }
}
```

Respons memakai `Cache-Control: public, max-age=60`. Rate limit memakai
konfigurasi baca yang sudah ada (`GENERAL_READ_LIMIT`,
`GENERAL_READ_WINDOW_SECONDS`) dengan bucket `read:public-settings:<ip>`.
`app/core/rate_limit.py` tidak diubah pada batch ini.

### `GET /api/v1/admin/settings`

Permission `settings.view`. Mengembalikan seluruh registry beserta metadata,
nilai efektif, dan key sampah di DB.

```json
{
  "items": [
    {
      "key": "bank_soal_url",
      "group": "links",
      "type": "url",
      "label": "URL Bank Soal",
      "value": "",
      "default": "",
      "max_length": 2048,
      "allowed_hosts": ["drive.google.com"],
      "updated_by": null,
      "updated_at": null
    }
  ],
  "unknown_keys": ["key-sampah"]
}
```

### `PUT /api/v1/admin/settings/{key}`

Permission `settings.manage` + CSRF. Upsert satu nilai, `value_type` dari
registry, `updated_by` diisi, dan `log_activity` mencatat key tanpa nilainya.

```json
{ "setting_value": "https://www.instagram.com/himatknuklir" }
```

### `PATCH /api/v1/admin/settings`

Permission `settings.manage` + CSRF. Simpan banyak nilai sekaligus.
**Atomik:** jika satu nilai gagal, tidak ada yang disimpan. Respons 422:

```json
{
  "detail": "Validasi gagal",
  "errors": {
    "contact_email": "Format email tidak valid."
  }
}
```

Sukses: `{"updated": ["brand_name", "news_title"], "settings": {...}}` dengan
satu entri `log_activity` berisi daftar key.

### `DELETE /api/v1/admin/settings/{key}`

Permission `settings.manage` + CSRF.

- Key registry: hapus baris sehingga nilai kembali ke default. Jika belum ada
  baris, respons tetap 200 (no-op, tanpa log).
- Key di luar registry tetapi ada di DB: hapus baris sampah (membersihkan
  `unknown_keys`).
- Tidak ada di registry maupun DB: 404 `Setting tidak ditemukan`.

## Mengisi setting

Contoh PowerShell (cookie sesi dan CSRF diperoleh lewat `/auth/csrf` dan
`/auth/login`; jangan menyimpan token di localStorage):

```powershell
$headers = @{
  "Origin" = "http://localhost:3000"
  "X-CSRF-Token" = $csrfToken
}

Invoke-RestMethod -Method Put `
  -Uri "http://localhost:8000/api/v1/admin/settings/instagram_url" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"setting_value":"https://www.instagram.com/himatknuklir"}'
```

Admin settings UI belum ada di frontend. Hardcode Bank Soal dan Instagram di
frontend tetap berlaku sampai batch frontend memakai endpoint ini.
