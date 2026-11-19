# Public Content API

Kontrak endpoint publik untuk program kerja, publikasi, dan organisasi.
Semua endpoint di bawah ini **tanpa autentikasi**, memakai prefix
`/api/v1`, dan hanya mengembalikan data yang boleh tampil di website.

Batch ini tidak mengubah skema. Semua perubahan bersifat penambahan field atau
parameter, sehingga pemanggil lama tetap berjalan.

## Program kerja

### `GET /public/programs`

Query parameter:

| Parameter | Tipe | Default | Catatan |
|---|---|---|---|
| `offset` | int | `0` | `>= 0` |
| `limit` | int | `20` | `1..50` |
| `period_id` | int | periode aktif | Jika tidak dikirim, dipakai periode dengan `is_active = true` (yang paling baru bila ada lebih dari satu). |
| `status` | string | semua | Boleh diulang (`?status=planned&status=ongoing`) atau dipisah koma (`?status=planned,ongoing`). Nilai valid: `planned`, `ongoing`, `completed`, `cancelled`. Nilai lain → `422`. |
| `division_id` | int | semua | Filter divisi. |

Perilaku:

- Hanya program dari periode yang dipakai yang dikembalikan.
- `cancelled` tetap dikirim; label "Dibatalkan" adalah urusan frontend.
- Bila `period_id` tidak ditemukan atau tidak ada periode aktif, respons `200`
  dengan `items: []`, `total: 0`, dan `period: null`.
- Urutan: `start_date` DESC dengan NULL di akhir, lalu `created_at` DESC, lalu
  `id` DESC. Program tanpa tanggal mulai tampil paling akhir.
- `total` adalah jumlah setelah semua filter, bukan panjang halaman.
- Tidak ada N+1: divisi dan periode diambil lewat join.

Contoh:

```json
{
  "items": [
    {
      "id": 12,
      "name": "Sosialisasi Keselamatan Radiasi",
      "slug": "sosialisasi-keselamatan-radiasi",
      "description": "Kegiatan contoh.",
      "status": "ongoing",
      "start_date": "2026-06-01",
      "end_date": "2026-06-30",
      "division": { "id": 3, "name": "Divisi Humas" },
      "period": { "id": 2, "name": "2026/2027" }
    }
  ],
  "total": 1,
  "offset": 0,
  "limit": 20,
  "period": { "id": 2, "name": "2026/2027" }
}
```

`division` bernilai `null` bila program tidak punya divisi.

### `GET /public/programs/{slug}`

Field sama dengan item list, tanpa filter periode (detail boleh dari periode
mana pun). `404` dengan detail `Program kerja tidak ditemukan` bila slug tidak
ada.

## Publikasi

### `GET /public/news`

Query parameter:

| Parameter | Tipe | Default | Catatan |
|---|---|---|---|
| `offset` | int | `0` | |
| `limit` | int | `20` | `1..50` |
| `q` | string | — | Pencarian **judul** saja, case-insensitive, 2–100 karakter setelah trim. `%` dan `_` di-escape sehingga dicari sebagai karakter literal. `q` lebih pendek dari 2 karakter → `422`. |

Tambahan pada respons:

- `total`: jumlah publikasi `published` setelah filter `q`.
- Setiap item mendapat `excerpt`: teks polos dari `content`, tag HTML dibuang,
  spasi dirapikan, dipotong sekitar 160 karakter dan berhenti di batas kata
  (diakhiri `…`). `content` penuh tetap **tidak** dikirim di list.
- Setiap item mendapat `tags`: `[{ "id": 1, "name": "...", "slug": "..." }]`,
  diurutkan berdasarkan nama tag. Tag diambil dengan satu query batch untuk
  seluruh halaman.

Contoh item:

```json
{
  "id": 21,
  "title": "Penerimaan Anggota Baru 2026",
  "slug": "penerimaan-anggota-baru-2026",
  "featured_image": "/api/v1/media/images/2026/oprec.webp",
  "published_at": "2026-08-01T09:00:00",
  "tags": [{ "id": 4, "name": "Kaderisasi", "slug": "kaderisasi" }],
  "images": [],
  "excerpt": "Pendaftaran anggota baru dibuka untuk seluruh mahasiswa aktif…"
}
```

### `GET /public/news/{slug}`

Sama seperti sebelumnya (`content` penuh disertakan), ditambah `tags`. Detail
tidak menyertakan `excerpt` karena `content` sudah lengkap.

## Organisasi

### `GET /public/organization`

Bentuk respons tetap, dengan tambahan:

- `positions[].sort_order` dan `divisions[].sort_order`.
- `members[].photo_url` dinormalisasi agar konsisten dengan gambar berita:
  - storage key `images/...` → `/api/v1/media/images/...` (memakai helper yang
    sama dengan `featured_image` berita);
  - URL `https://...` dikembalikan apa adanya;
  - nilai lain (`http://`, path asing, string kosong) → `null`.

```json
{
  "period": { "id": 2, "name": "2026/2027" },
  "divisions": [
    { "id": 3, "name": "Divisi Humas", "description": null, "sort_order": 5 }
  ],
  "positions": [
    { "id": 7, "name": "Ketua", "sort_order": 1 }
  ],
  "members": [
    {
      "id": 40,
      "name": "Anggota Contoh",
      "division_id": 3,
      "position_id": 7,
      "photo_url": "/api/v1/media/images/2026/anggota.webp"
    }
  ]
}
```

## Status program di admin

`POST /admin/programs` dan `PUT /admin/programs/{program_id}` hanya menerima
`status` salah satu dari `planned`, `ongoing`, `completed`, `cancelled`
(default `planned`). Nilai lain ditolak `422` oleh validasi schema.

## Perintah production untuk pemilik

Batch ini tidak menjalankan seed ke database mana pun. Setelah deploy, jalankan
sekali di environment production agar permission yang belum ada (misalnya
`media.manage`) ditambahkan dan diberikan ke `superadmin`:

```bash
python -m app.seed
```

Seed bersifat idempoten: role/permission dicek per baris, `role_permissions` yang
sudah ada tidak diduplikasi, dan admin default hanya dibuat bila tabel `admins`
kosong. Tidak ada migrasi skema yang perlu dijalankan untuk batch ini.

Setelah itu, verifikasi di production:

```sql
SELECT name FROM permissions WHERE name = 'media.manage';
SELECT r.name, p.name
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE p.name = 'media.manage';
```
