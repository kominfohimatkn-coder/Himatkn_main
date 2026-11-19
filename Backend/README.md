# HIMATKN Backend Fixed

Backend FastAPI modular untuk HIMATKN dengan satu arsitektur canonical: `app/core`, `app/database`, `app/models`, `app/schemas`, `app/repositories`, `app/services`, `app/routers`, `app/middleware`, dan `app/utils`.

## Database

Target utama adalah MySQL/TiDB database `himatkn_v2`.
Model memetakan 22 tabel domain canonical.
Tabel `alembic_version` adalah metadata Alembic dan bukan tabel domain aplikasi.
Tabel legacy pada dump (`admin`, `berita`, `program_kerja`, `struktur`, `notifikasi`, `site_config`) tidak digunakan.
`auth_sessions.admin_id` pada canonical schema mengarah ke `admins.id`.

## Menjalankan lokal

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# isi DATABASE_URL dan JWT_SECRET_KEY
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

Swagger: `http://localhost:8000/docs`.

## Vercel

`api/index.py` mengekspor `app` FastAPI. Pada production serverless, gunakan Redis untuk rate limiting dan object storage untuk file. Jangan menggunakan local filesystem sebagai storage permanen. Set secret melalui Vercel Environment Variables.

## Penyimpanan

`STORAGE_BACKEND` mendukung tiga nilai:

| Nilai | Keterangan | Environment |
| --- | --- | --- |
| `local` | Filesystem lokal. Hanya untuk development/test; ditolak di production. | `STORAGE_LOCAL_DIR` |
| `s3` | S3-compatible object storage (termasuk Cloudflare R2). | `S3_ENDPOINT_URL`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` |
| `vercel_blob` | Vercel Blob (public store). | `BLOB_READ_WRITE_TOKEN`, `BLOB_PUBLIC_BASE_URL` |

Database hanya menyimpan **storage key** (contoh `images/<hex>.jpg`), bukan URL
penuh. Semua gambar publik disajikan lewat
`GET /api/v1/media/images/{key}`, yang membalas redirect `307` ke URL publik
penyedia aktif. Dengan begitu, URL publik tidak ikut tersimpan di data domain
dan berpindah penyedia cukup mengubah environment.

Catatan `vercel_blob`:

- `BLOB_READ_WRITE_TOKEN` ditambahkan otomatis oleh Vercel saat Blob store
  disambungkan ke project (Project > Storage > Blob).
- `BLOB_PUBLIC_BASE_URL` adalah base URL publik store, tanpa path dan tanpa
  slash di akhir, contoh
  `https://<store-id>.public.blob.vercel-storage.com`. Ambil dari URL blob
  pertama yang diunggah atau dari dashboard store, lalu pakai bagian sebelum
  pathname.
- Upload gambar memakai akses public, pathname = storage key, tanpa random
  suffix, dan `cache_control_max_age` satu tahun untuk `images/`.
- Modul Dokumen ditunda: upload dan penyajian dokumen privat pada
  `vercel_blob` membalas `503`; dokumen tidak pernah diunggah sebagai blob
  publik.

Pindah dari Vercel Blob ke R2 nanti: salin objek dengan pathname yang sama
(`images/...`) ke bucket R2, lalu set `STORAGE_BACKEND=s3` dan variabel `S3_*`.
Storage key di database tidak berubah, sehingga tidak perlu migration atau
menulis ulang data.

## API

Semua route memiliki root `/api/v1`:

- `/api/v1/auth`
- `/api/v1/admin`
- `/api/v1/public`
- `/api/v1/media`
- `/api/v1/health`

Route utama yang tersedia:

`GET /api/v1/health`

`GET /api/v1/auth/csrf` · `POST /api/v1/auth/login` · `GET /api/v1/auth/me` · `POST /api/v1/auth/change-password` · `POST /api/v1/auth/logout`

`GET/POST /api/v1/admin/admins` · `GET /api/v1/admin/admins/roles` · `PUT/DELETE /api/v1/admin/admins/{admin_id}`

`GET /api/v1/admin/dashboard`

`GET/POST /api/v1/admin/organization/periods` · `GET /api/v1/admin/organization/divisions` · `GET /api/v1/admin/organization/positions` · `GET/POST/PUT/DELETE /api/v1/admin/organization/members`

`GET /api/v1/admin/news` · `POST /api/v1/admin/news` · `GET /api/v1/admin/news/{identifier}` · `PUT/DELETE /api/v1/admin/news/{news_id}` · `GET/POST /api/v1/admin/news/tags`

`GET/POST/PUT/DELETE /api/v1/admin/programs`

`GET/POST/PUT/DELETE /api/v1/admin/agendas`

`GET/POST /api/v1/admin/documents`

`GET /api/v1/admin/settings` · `PUT/DELETE /api/v1/admin/settings/{key}` · `PATCH /api/v1/admin/settings`

`GET/POST /api/v1/admin/notifications` · `POST /api/v1/admin/notifications/{notification_id}/read`

`GET /api/v1/admin/activity-logs` · `GET /api/v1/admin/visitor-logs`

`GET/POST /api/v1/media/images` · `GET /api/v1/media/images/{filename:path}` · `GET /api/v1/media/documents/{filename:path}`

`GET /api/v1/public/news` · `GET /api/v1/public/news/{slug}` · `GET /api/v1/public/programs` · `GET /api/v1/public/programs/{slug}` · `GET /api/v1/public/organization` · `GET /api/v1/public/settings` · `POST /api/v1/public/visits`

## Public Content API

Kontrak `GET /public/news`, `GET /public/programs`, dan
`GET /public/organization` (filter, `total`, `excerpt`, `tags`, `sort_order`,
normalisasi `photo_url`) beserta contoh respons ada di
[`docs/PUBLIC_API.md`](docs/PUBLIC_API.md).

## Site Settings

Nilai teks dan tautan publik dikelola lewat registry di
`app/services/site_settings.py`. Detail registry, validasi, endpoint, dan contoh
pemakaian ada di [`docs/SITE_SETTINGS.md`](docs/SITE_SETTINGS.md).

## Seed

`python -m app.seed` bersifat idempoten: role dan permission yang belum ada
akan dibuat, permission baru diberikan ke `superadmin`, dan admin default hanya
dibuat bila tabel `admins` masih kosong. Jalankan sekali setelah deploy untuk
menambahkan permission yang belum ada di DB (misalnya `media.manage`).

## Security

Authentication menggunakan JWT HttpOnly cookie + server-side session record. Mutation pada endpoint authenticated membutuhkan CSRF token. RBAC ditegakkan di backend. Login throttling menggunakan bucket per-IP, per-IP+username, dan per-akun lintas IP (`login-account-global`, default 20 percobaan / 900 detik, berlaku juga untuk username yang tidak ada agar keberadaan akun tidak bocor). Ganti kata sandi dibatasi per akun (`change-password`, default 5 percobaan / 900 detik) dan dicek **sebelum** verifikasi kata sandi lama. Production wajib Redis. Error 500 tidak mengekspos detail internal. Upload image memakai Pillow dan disimpan dengan random storage key; dokumen tidak punya route publik.

**Sumber IP klien.** `CLIENT_IP_SOURCE` menentukan satu sumber IP untuk rate limit dan audit log (`app/utils/ip.py`): `direct` memakai `request.client.host` (default lokal), `trusted_proxy` memakai `TRUSTED_PROXY_IPS` lalu membaca `X-Forwarded-For` **dari kanan** dan mengambil hop pertama yang bukan proxy tepercaya, dan `vercel` membaca `x-vercel-forwarded-for` (elemen pertama), lalu `x-real-ip`, lalu `request.client.host`. Nilai lain ditolak saat startup. Bila `APP_ENV=production` dan environment variable `VERCEL` ada, `CLIENT_IP_SOURCE` wajib `vercel` karena `request.client.host` di Vercel bukan IP pengunjung. Koneksi MySQL/TiDB memakai `connect_timeout`, `read_timeout`, dan `write_timeout` (default 10/30/30 detik); SQLite tidak memakainya.

**Audit login.** `auth.login.success`, `auth.login.failure` (username yang dicoba, maksimal 100 karakter, CR/LF dibuang; `admin_id` terisi bila akun ada), `auth.login.rate_limited`, dan `auth.logout` ditulis ke `activity_logs` tanpa kata sandi atau token. Log pada jalur gagal di-commit sebelum respons error dikirim.

`POST /api/v1/auth/change-password` (login + CSRF, tanpa permission tambahan) memverifikasi kata sandi lama, menyimpan hash baru (12–128 karakter), menulis audit `admin.password_change` tanpa menyimpan kata sandi, dan mencabut semua sesi lain milik admin yang sama. Sesi yang dipakai untuk request tersebut **dipertahankan** (cookie sesi dan CSRF tidak dihapus atau diganti) dengan mengecualikan `jti` token saat ini. Respons `200 {"ok": true, "sessions_revoked": n}`. Selain grup tulis `auth` bawaan middleware, endpoint ini memakai bucket `change-password:{admin_id}` yang dicek sebelum verifikasi kata sandi lama.

## Testing

```bash
python -m compileall app
pytest -q
alembic check
```

Testing lokal di project ini juga memeriksa model/schema 21 tabel, route registration, authentication, CSRF, permission, login rate limiting hingga HTTP 429, pagination bounds, public endpoints, document upload, image compression, invalid upload, dan path traversal. Integration ke MySQL/TiDB production harus dijalankan di environment yang memiliki credential database tersebut.

Untuk DB existing, verifikasi schema terlebih dahulu kemudian gunakan
`alembic stamp 3af2a5dfdd21` hanya apabila database tersebut memang sudah
merepresentasikan schema hingga revision tersebut.

Untuk database kosong gunakan `alembic upgrade head`.
Jangan memakai `Base.metadata.create_all()` saat startup production.
