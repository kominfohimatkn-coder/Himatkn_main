# Admin Accounts & Permissions API

Dokumen ini menjelaskan model izin per akun administrator, katalog izin,
guard superadmin, dan alur pengelolaan akun. Semua endpoint berada di bawah
`/api/v1`.

## 1. Model izin

Izin **tidak lagi ditentukan oleh role**. Superadmin mencentang izin langsung
pada setiap akun non-superadmin. Model data:

- `admins` — akun administrator.
- `admin_permissions` — izin langsung per akun (`admin_id`, `permission_id`).
- `roles` — hanya berisi role `superadmin`.
- `admin_roles` — hanya menghubungkan akun superadmin dengan role
  `superadmin`.
- `permissions` — daftar nama izin yang dikenal sistem.

Aturan utama:

1. **Superadmin** adalah role khusus dan otomatis memiliki seluruh izin,
   termasuk `admins.view`, `admins.manage`, dan `roles.manage`.
2. Role `admin` dan `editor` sudah dihapus. Akun lama yang memakai role
   tersebut dimigrasikan ke izin langsung oleh migrasi
   `20261118_0002_admin_permissions`.
3. Izin `admins.view`, `admins.manage`, dan `roles.manage` adalah
   **superadmin-only** dan tidak dapat diberikan ke akun non-superadmin.
4. `dashboard.view` selalu diberikan ke semua akun, termasuk akun tanpa izin
   lain.
5. Hanya superadmin yang dapat mencapai endpoint pengelolaan akun. Izin
   `admins.manage` yang disisipkan manual ke `admin_permissions` tetap
   diabaikan saat resolusi izin (defense in depth).

### Resolusi izin

Izin efektif akun dihitung setiap request:

```text
izin role (superadmin) ∪ izin langsung (tanpa SUPERADMIN_ONLY) ∪ ALWAYS_GRANTED
```

Hasil gabungan kemudian menerapkan aturan implikasi. Dengan demikian:

- Perubahan `permissions` langsung berlaku pada request berikutnya tanpa
  login ulang.
- Baris `admin_permissions` yang berisi izin superadmin-only dibuang sebelum
  penggabungan; izin dari role superadmin tidak dibuang.

## 2. Katalog izin

`GET /admin/admins/permissions` mengembalikan katalog untuk form centang
frontend:

```json
{
  "items": [
    {
      "key": "news",
      "label": "Publikasi",
      "available": true,
      "permissions": [
        {"name": "news.view", "label": "Melihat publikasi", "implies": []},
        {
          "name": "news.create",
          "label": "Membuat publikasi",
          "implies": ["news.view"]
        }
      ]
    }
  ],
  "superadmin_only": ["admins.manage", "admins.view", "roles.manage"],
  "always_granted": ["dashboard.view"]
}
```

Modul yang fiturnya belum tersedia tetap dikirim dengan `available: false`
agar frontend dapat menampilkan centang nonaktif:

| Key | Label | Available |
|---|---|---|
| `dashboard` | Dashboard | `true` |
| `news` | Publikasi | `true` |
| `programs` | Program kerja | `true` |
| `organization` | Organisasi | `true` |
| `settings` | Pengaturan situs | `true` |
| `media` | Upload gambar | `true` |
| `activity_logs` | Log aktivitas | `true` |
| `visitor_logs` | Statistik pengunjung | `true` |
| `agendas` | Agenda | `false` |
| `documents` | Dokumen | `false` |
| `notifications` | Notifikasi | `false` |

Izin superadmin-only **tidak** muncul di `items`; frontend cukup menampilkan
centang `is_superadmin`.

### Aturan implikasi

Mengirim izin turunan otomatis menambahkan izin yang dibutuhkan:

| Izin dikirim | Implikasi |
|---|---|
| `news.create`, `news.update`, `news.delete` | `news.view` |
| `programs.manage` | `programs.view` |
| `organization.manage` | `organization.view`, `media.manage` |
| `settings.manage` | `settings.view`, `media.manage` |
| `agendas.manage` | `agendas.view` |
| `documents.manage` | `documents.view` |
| `notifications.manage` | `notifications.view` |

Semua akun selalu mendapat `dashboard.view`.

Contoh: mengirim `["news.create"]` menghasilkan izin efektif
`news.create`, `news.view`, dan `dashboard.view`.

### Akses lintas modul

Akun dengan `programs.view` juga dapat membaca daftar periode dan divisi
organisasi melalui `GET /admin/organization/periods` dan
`GET /admin/organization/divisions`. Izin `programs.view` hanya membuka dua
endpoint baca tersebut; endpoint organisasi lain (posisi, anggota) dan semua
mutasi tetap memerlukan `organization.view`/`organization.manage`.

## 3. Endpoint

Semua endpoint memerlukan sesi login. Endpoint tulis juga memerlukan header
CSRF `X-CSRF-Token` yang nilainya sama dengan cookie CSRF.

| Method | Path | Izin | CSRF |
|---|---|---|---|
| `GET` | `/admin/admins` | `admins.view` | Tidak |
| `GET` | `/admin/admins/permissions` | `admins.view` | Tidak |
| `POST` | `/admin/admins` | `admins.manage` | Ya |
| `PUT` | `/admin/admins/{id}` | `admins.manage` | Ya |
| `DELETE` | `/admin/admins/{id}` | `admins.manage` | Ya |

Endpoint lama `GET /admin/admins/roles` **dihapus** karena role selain
`superadmin` sudah tidak ada dan tidak ada pemakai di frontend.

### `GET /admin/admins`

Mengembalikan seluruh akun. Field `permissions` berisi izin efektif (sudah
menerapkan implikasi), sedangkan `roles` hanya berisi `["superadmin"]` untuk
akun superadmin dan `[]` untuk akun lain.

```json
{
  "items": [
    {
      "id": 1,
      "username": "admin",
      "is_active": true,
      "is_superadmin": true,
      "roles": ["superadmin"],
      "permissions": ["activity_logs.view", "admins.manage", "..."],
      "last_login_at": "2026-11-18T08:00:00"
    }
  ]
}
```

### `POST /admin/admins`

Membuat akun baru. Field `role` sudah dihapus.

Body:

```json
{
  "username": "editor-berita",
  "password": "kata-sandi-kuat-123",
  "is_superadmin": false,
  "permissions": ["news.create"]
}
```

- `username` 3–50 karakter, unik (case-insensitive).
- `password` 12–128 karakter.
- `permissions` opsional; bila tidak dikirim, akun hanya mendapat
  `dashboard.view`.
- Bila `is_superadmin=true`, `permissions` harus kosong/tidak dikirim.
  Mengisinya menghasilkan `422`.

Respons `201`:

```json
{
  "id": 12,
  "username": "editor-berita",
  "is_active": true,
  "is_superadmin": false,
  "roles": [],
  "permissions": ["dashboard.view", "news.create", "news.view"],
  "last_login_at": null
}
```

Membuat superadmin ketiga (dihitung semua akun superadmin, aktif maupun
nonaktif) menghasilkan `409`:

```json
{"detail": "Jumlah superadmin maksimal 2 akun"}
```

### `PUT /admin/admins/{id}`

Semua field opsional. Hanya field yang dikirim yang diubah.

```json
{
  "username": "editor-berita-baru",
  "password": "kata-sandi-baru-123",
  "is_active": true,
  "is_superadmin": false,
  "permissions": ["news.create", "news.update"]
}
```

- `permissions` **mengganti seluruh** izin langsung akun. Kirim `[]` untuk
  menyisakan `dashboard.view` saja. Bila field tidak dikirim, izin tidak
  berubah.
- Promosi `is_superadmin=true` menambahkan role `superadmin` dan menghapus
  izin langsung. `permissions` harus kosong.
- Demosi `is_superadmin=false` menghapus role `superadmin`. Izin langsung
  diambil dari `permissions` yang dikirim; bila tidak dikirim, akun hanya
  mendapat `dashboard.view`.
- Reset password akun lain dilakukan lewat field `password`. Superadmin
  **tidak** boleh mengubah password akun sendiri lewat endpoint ini.

Akun tidak boleh mengubah field berikut pada **akun sendiri** lewat endpoint
ini; semuanya menghasilkan `400`:

| Field | Pesan |
|---|---|
| `password` | `Gunakan menu ganti kata sandi` |
| `permissions` | `Anda tidak dapat mengubah izin akun sendiri` |
| `is_superadmin` | `Anda tidak dapat mengubah status superadmin akun sendiri` |
| `is_active` | `Anda tidak dapat menonaktifkan akun sendiri` / `Anda tidak dapat mengubah status aktif akun sendiri` |

### `DELETE /admin/admins/{id}`

Menghapus akun. Akun sendiri tidak dapat dihapus (`400`). Menghapus
superadmin aktif terakhir menghasilkan `409`.

## 4. Guard superadmin

1. **Maksimal 2 superadmin.** Dihitung dari seluruh akun ber-role
   `superadmin`, termasuk yang nonaktif. Membuat atau mempromosikan superadmin
   ketika jumlahnya sudah 2 → `409`.
2. **Minimal 1 superadmin aktif.** Menonaktifkan, menghapus, atau mendemosi
   superadmin aktif terakhir → `409`:

   ```json
   {
     "detail": "Operasi ditolak: harus tersisa minimal satu superadmin aktif"
   }
   ```

3. **Hanya superadmin.** Endpoint memakai `admins.manage`, yang secara efektif
   hanya dimiliki superadmin. Izin superadmin-only yang disisipkan manual ke
   `admin_permissions` tidak berlaku.
4. **Akun sendiri.** Perubahan password, izin, status superadmin, dan status
   aktif pada akun sendiri ditolak `400` (lihat tabel di atas).

## 5. Sesi dan reset password

| Perubahan | Sesi target dicabut? |
|---|---|
| Reset password oleh superadmin | Ya |
| Menonaktifkan akun | Ya |
| Promosi/demosi superadmin | Ya |
| Mengubah `permissions` | **Tidak** |

Alasan: izin dibaca ulang dari database pada setiap request, sehingga
perubahan izin langsung berlaku tanpa memaksa login ulang. Password, status
aktif, dan status superadmin mengubah identitas/akses akun sehingga sesi lama
harus dicabut.

### Alur reset password

1. Superadmin mengirim `PUT /admin/admins/{id}` dengan field `password`
   (12–128 karakter) dan header CSRF.
2. Backend menyimpan hash baru, mencabut seluruh sesi akun target, dan menulis
   audit `admin.password_reset` tanpa menyimpan kata sandi.
3. Akun target login kembali dengan kata sandi baru.

Superadmin yang ingin mengganti password sendiri memakai
`POST /auth/change-password` (memverifikasi password lama, mencabut sesi lain,
dan mempertahankan sesi saat ini).

## 6. Audit log

Aksi yang ditulis, tanpa menyimpan kata sandi:

| Aksi | Kapan |
|---|---|
| `admin.create` | Akun baru dibuat |
| `admin.update` | Username dan/atau status aktif diubah |
| `admin.permissions_update` | Izin langsung berubah; deskripsi menyebut izin yang ditambah/dihapus |
| `admin.password_reset` | Superadmin mereset password akun lain |
| `admin.superadmin_grant` | Akun dipromosikan menjadi superadmin |
| `admin.superadmin_revoke` | Status superadmin dicabut |
| `admin.delete` | Akun dihapus |

`ip_address` diambil dari `get_client_ip(request)` dan `user_agent` dibatasi
500 karakter.

## 7. Ringkasan error

| Status | Penyebab |
|---|---|
| `400` | Perubahan field terlarang pada akun sendiri |
| `403` | Tidak memiliki `admins.manage` (atau `admins.view` untuk baca) |
| `404` | Akun target tidak ditemukan |
| `409` | Username duplikat, superadmin lebih dari 2, atau superadmin aktif terakhir |
| `422` | Nama izin tidak dikenal, izin superadmin-only, atau superadmin dengan izin langsung |

## 8. Catatan untuk frontend (API-F2)

- Bangun form centang dari `GET /admin/admins/permissions`, bukan daftar
  hardcoded.
- Saat pengguna mencentang izin, centang otomatis semua nama di `implies`.
- Tampilkan modul `available: false` sebagai nonaktif.
- Jangan tampilkan `superadmin_only` sebagai centang; gunakan sakelar
  `is_superadmin`.
- Kirim `permissions` sebagai daftar lengkap saat menyimpan (bukan diff),
  karena backend mengganti seluruh izin langsung.
- Setelah menyimpan izin, tidak perlu memaksa pengguna login ulang.
