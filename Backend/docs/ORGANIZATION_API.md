# Organization API

Dokumentasi endpoint admin organisasi (periode, divisi, posisi, anggota) beserta
alur pergantian periode. Kontrak publik struktur organisasi ada di
`Backend/docs/PUBLIC_API.md` (`GET /api/v1/public/organization`).

## Dasar

- Base path: `/api/v1/admin/organization`
- Semua endpoint admin memerlukan sesi login (cookie JWT HttpOnly).
- Endpoint baca memerlukan `organization.view`; endpoint tulis memerlukan
  `organization.manage`. Pengecualian: `GET /periods` dan `GET /divisions`
  juga dapat dibaca dengan `programs.view` karena form program kerja
  membutuhkan daftar periode dan divisi.
- Semua endpoint tulis memerlukan CSRF (`X-CSRF-Token` harus sama dengan cookie
  CSRF) dan menulis `activity_logs` dengan `ip_address` + `user_agent`.
- Pesan error berbahasa Indonesia. `422` dipakai untuk validasi body,
  `400` untuk referensi tidak valid, `404` untuk data yang tidak ditemukan, dan
  `409` untuk konflik data.
- Tidak ada endpoint tulis untuk posisi pada batch ini; daftar posisi hanya
  dapat dibaca.

| Method | Path | Permission | CSRF |
|---|---|---|---|
| GET | `/periods` | `organization.view` atau `programs.view` | — |
| POST | `/periods` | `organization.manage` | Ya |
| PUT | `/periods/{period_id}` | `organization.manage` | Ya |
| DELETE | `/periods/{period_id}` | `organization.manage` | Ya |
| POST | `/periods/{period_id}/activate` | `organization.manage` | Ya |
| POST | `/periods/{period_id}/divisions/copy` | `organization.manage` | Ya |
| GET | `/divisions` | `organization.view` atau `programs.view` | — |
| POST | `/divisions` | `organization.manage` | Ya |
| PUT | `/divisions/{division_id}` | `organization.manage` | Ya |
| DELETE | `/divisions/{division_id}` | `organization.manage` | Ya |
| GET | `/positions` | `organization.view` | — |
| GET | `/members` | `organization.view` | — |
| POST | `/members` | `organization.manage` | Ya |
| PUT | `/members/{member_id}` | `organization.manage` | Ya |
| DELETE | `/members/{member_id}` | `organization.manage` | Ya |

## Bentuk item

```json
// period
{
  "id": 7,
  "name": "2030/2031",
  "start_date": "2030-01-01",
  "end_date": "2030-12-31",
  "is_active": true
}

// division
{
  "id": 12,
  "period_id": 7,
  "name": "Media dan Komunikasi",
  "description": "Publikasi dan dokumentasi",
  "sort_order": 2
}

// position
{
  "id": 4,
  "name": "Ketua Umum",
  "description": null,
  "sort_order": 0
}

// member (admin)
{
  "id": 31,
  "period_id": 7,
  "division_id": 12,
  "position_id": 4,
  "name": "Nama Anggota",
  "photo_url": "images/0123456789abcdef0123456789abcdef.jpg",
  "sort_order": 0
}
```

`photo_url` pada endpoint admin dikirim apa adanya (storage key atau URL
eksternal lama). Endpoint publik menormalkannya menjadi path media; lihat
`PUBLIC_API.md`.

## Periode

### `GET /api/v1/admin/organization/periods`

Mengembalikan `{"items": [period, ...]}` diurutkan `start_date` DESC lalu `id`
DESC. Dapat diakses dengan `organization.view` atau `programs.view` (form
program kerja memerlukan daftar periode).

### `POST /api/v1/admin/organization/periods`

Membuat periode baru (`201`). Body:

```json
{
  "name": "2030/2031",
  "start_date": "2030-01-01",
  "end_date": "2030-12-31",
  "is_active": false
}
```

- `name` 2–50 karakter, di-strip.
- `start_date`/`end_date` opsional; `end_date` sebelum `start_date` → `422`.
- Nama unik **case-insensitive**; duplikat → `409` `"Periode sudah ada"`.
- `is_active: true` menonaktifkan periode aktif lain dalam satu transaksi.
- Audit: `period.create`.
- Respons: item periode.

### `PUT /api/v1/admin/organization/periods/{period_id}`

Mengubah nama dan tanggal (`200`). Body:

```json
{
  "name": "2030/2031 Revisi",
  "start_date": "2030-02-01",
  "end_date": "2030-11-30"
}
```

- `404` `"Periode tidak ditemukan"` bila tidak ada.
- Nama unik case-insensitive, mengecualikan periode itu sendiri → `409`
  `"Periode sudah ada"`.
- `is_active` **tidak** dapat diubah lewat endpoint ini; field itu diabaikan.
- Tanggal terbalik → `422`.
- Audit: `period.update`.
- Respons: item periode.

### `DELETE /api/v1/admin/organization/periods/{period_id}`

- `404` bila periode tidak ada.
- `409` `"Periode aktif tidak bisa dihapus"` bila `is_active = true`.
- `409` bila masih memiliki divisi/anggota/program; pesan hanya menyebut bagian
  yang tidak nol, misalnya:
  `"Periode tidak bisa dihapus: masih ada 9 divisi, 57 anggota, 1 program kerja"`.
- Sukses `200 {"deleted": 7}`.
- Audit: `period.delete`.

### `POST /api/v1/admin/organization/periods/{period_id}/activate`

Mengaktifkan periode secara atomik dan idempoten. Tidak ada body.

```json
{
  "period": {
    "id": 7,
    "name": "2030/2031",
    "start_date": "2030-01-01",
    "end_date": "2030-12-31",
    "is_active": true
  },
  "warnings": []
}
```

- `404` `"Periode tidak ditemukan"`.
- Periode lain yang aktif dinonaktifkan dalam transaksi yang sama.
- Bila periode sudah aktif: tidak ada perubahan dan tidak ada audit baru, tetapi
  respons tetap `200` beserta `warnings`.
- `warnings` berisi `"Periode ini belum memiliki divisi"` dan/atau
  `"Periode ini belum memiliki anggota"` bila kosong. Warning tidak menggagalkan
  aktivasi.
- Audit hanya saat status berubah: `period.activate`.

## Divisi

### `GET /api/v1/admin/organization/divisions`

Query opsional `period_id`. Respons `{"items": [division, ...]}` diurutkan
`period_id`, `sort_order`, lalu `id`. Item selalu memuat `sort_order`. Dapat
diakses dengan `organization.view` atau `programs.view`.

### `POST /api/v1/admin/organization/divisions`

Membuat divisi (`201`). Body:

```json
{
  "period_id": 7,
  "name": "Media dan Komunikasi",
  "description": "Publikasi dan dokumentasi",
  "sort_order": 2
}
```

- Periode wajib ada → `400` `"Periode tidak ditemukan"`.
- Nama unik per periode, case-insensitive → `409`
  `"Divisi dengan nama ini sudah ada di periode tersebut"`.
- Nama di-strip.
- Audit: `division.create`.
- Respons: item divisi.

### `PUT /api/v1/admin/organization/divisions/{division_id}`

Mengubah `name`, `description`, dan `sort_order` (`200`). Body **tanpa**
`period_id`; bila dikirim, field itu diabaikan dan periode tidak berubah.

```json
{
  "name": "Media dan Komunikasi",
  "description": "Deskripsi baru",
  "sort_order": 3
}
```

- `404` `"Divisi tidak ditemukan"`.
- Nama unik per periode, mengecualikan divisi itu sendiri → `409`.
- Audit: `division.update`.

### `DELETE /api/v1/admin/organization/divisions/{division_id}`

- `404` bila divisi tidak ada.
- `409` bila masih ada anggota dan/atau program kerja. FK program memakai
  `SET NULL`, jadi pengecekan program dilakukan di aplikasi agar program tidak
  diam-diam kehilangan divisi. Contoh pesan:
  - `"Divisi tidak bisa dihapus: masih ada 3 anggota"`
  - `"Divisi tidak bisa dihapus: masih dipakai 1 program kerja"`
  - `"Divisi tidak bisa dihapus: masih ada 3 anggota dan masih dipakai 1 program kerja"`
- Sukses `200 {"deleted": 12}`.
- Audit: `division.delete`.

### `POST /api/v1/admin/organization/periods/{period_id}/divisions/copy`

Menyalin seluruh divisi dari periode sumber ke periode tujuan (`200`). Body:

```json
{ "source_period_id": 6 }
```

- `404` `"Periode tujuan tidak ditemukan"` / `"Periode sumber tidak ditemukan"`.
- `400` `"Periode sumber dan tujuan tidak boleh sama"` bila sumber = tujuan.
- Menyalin `name`, `description`, dan `sort_order`; urutan sumber
  `sort_order` lalu `id`.
- **Anggota tidak disalin.**
- Nama yang sudah ada di target (case-insensitive) dilewati dan dikembalikan di
  `skipped` memakai nama sumber apa adanya.
- Atomik: satu commit untuk semua divisi baru; tepat satu audit
  `division.copy` berisi sumber, target, jumlah disalin, dan jumlah dilewati.
- Respons:

```json
{
  "created": [
    {
      "id": 21,
      "period_id": 7,
      "name": "Badan Pengurus Harian",
      "description": "BPH",
      "sort_order": 0
    },
    {
      "id": 22,
      "period_id": 7,
      "name": "Media dan Komunikasi",
      "description": "Publikasi dan dokumentasi",
      "sort_order": 2
    }
  ],
  "skipped": ["Kaderisasi"]
}
```

## Posisi

### `GET /api/v1/admin/organization/positions`

Respons `{"items": [position, ...]}` diurutkan `sort_order`, `name`, lalu `id`.
Tidak ada endpoint create/update/delete posisi pada batch ini.

## Anggota

### `GET /api/v1/admin/organization/members`

Query opsional `period_id`. Respons `{"items": [member, ...]}` diurutkan
`sort_order`, `name`, lalu `id`.

### `POST /api/v1/admin/organization/members`

Membuat anggota (`201`). Body:

```json
{
  "period_id": 7,
  "division_id": 12,
  "position_id": 4,
  "name": "Nama Anggota",
  "photo_url": "images/0123456789abcdef0123456789abcdef.jpg",
  "sort_order": 0
}
```

- `division_id` boleh `null`.
- Validasi referensi (`400`):
  - `"Periode tidak ditemukan"`
  - `"Posisi tidak ditemukan"`
  - `"Divisi tidak ditemukan"`
  - `"Divisi tidak sesuai dengan periode yang dipilih"`
- Audit: `member.create`.

### `PUT /api/v1/admin/organization/members/{member_id}`

Mengganti seluruh field anggota (`200`) dengan body yang sama seperti create.
- `404` `"Anggota tidak ditemukan"`.
- Validasi referensi sama seperti create.
- Audit: `member.update`.

### `DELETE /api/v1/admin/organization/members/{member_id}`

- `404` bila anggota tidak ada.
- Sukses `204 No Content`.
- Audit: `member.delete`.

## Alur pergantian periode

Contoh langkah demi langkah dari periode lama (id `6`) ke periode baru (id `7`).
Semua request tulis memakai cookie sesi + `X-CSRF-Token`.

1. **Buat periode baru** (jangan langsung aktifkan):

   ```http
   POST /api/v1/admin/organization/periods
   {
     "name": "2030/2031",
     "start_date": "2030-01-01",
     "end_date": "2030-12-31",
     "is_active": false
   }
   ```

   Simpan `id` hasil respons (contoh `7`).

2. **Salin divisi** dari periode lama:

   ```http
   POST /api/v1/admin/organization/periods/7/divisions/copy
   { "source_period_id": 6 }
   ```

   Periksa `created` dan `skipped`. Anggota belum ikut tersalin.

3. **Sesuaikan divisi** baru (tambah/ubah/hapus) melalui
   `POST/PUT/DELETE /divisions`. Hapus divisi yang masih kosong; divisi yang
   sudah punya anggota/program akan ditolak `409`.

4. **Isi anggota** periode baru lewat `POST /members` dengan
   `period_id: 7`, `division_id` hasil langkah 2/3, dan `position_id` dari
   `GET /positions`.

5. **Verifikasi** dengan `GET /periods`, `GET /divisions?period_id=7`, dan
   `GET /members?period_id=7`.

6. **Aktifkan periode baru**:

   ```http
   POST /api/v1/admin/organization/periods/7/activate
   ```

   Respons memuat `warnings` bila divisi/anggota masih kosong. Setelah sukses,
   `GET /api/v1/public/organization` menampilkan periode ini dan periode lain
   menjadi nonaktif.

7. **Opsional**: hapus periode lama setelah tidak dipakai.
   `DELETE /periods/6` akan menolak `409` selama periode itu masih aktif atau
   masih memiliki divisi/anggota/program.

## Catatan implementasi

- Satu-periode-aktif dijaga oleh create (`is_active: true`) dan activate;
  tidak ada endpoint yang bisa mengaktifkan dua periode sekaligus.
- Uniqueness nama periode/divisi diperiksa di aplikasi memakai `lower()` agar
  konsisten antara SQLite (test) dan MySQL (`utf8mb4_unicode_ci`).
- Semua endpoint tulis memakai `_commit_or_conflict` sehingga pelanggaran
  constraint database dipetakan ke `409` dengan pesan generik.
- Semua audit memakai `ip_address` dan `user_agent` dari request; tidak ada
  audit yang menerima objek `request`.
