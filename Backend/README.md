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

## API

Semua route memiliki root `/api/v1`:

- `/api/v1/auth`
- `/api/v1/admin`
- `/api/v1/public`
- `/api/v1/media`
- `/api/v1/health`

Route utama yang tersedia:

`GET /api/v1/health`

`GET /api/v1/auth/csrf` · `POST /api/v1/auth/login` · `GET /api/v1/auth/me` · `POST /api/v1/auth/logout`

`GET/POST /api/v1/admin/admins` · `GET /api/v1/admin/admins/roles` · `PUT/DELETE /api/v1/admin/admins/{admin_id}`

`GET /api/v1/admin/dashboard`

`GET/POST /api/v1/admin/organization/periods` · `GET /api/v1/admin/organization/divisions` · `GET /api/v1/admin/organization/positions` · `GET/POST/PUT/DELETE /api/v1/admin/organization/members`

`GET /api/v1/admin/news` · `POST /api/v1/admin/news` · `GET /api/v1/admin/news/{identifier}` · `PUT/DELETE /api/v1/admin/news/{news_id}` · `GET/POST /api/v1/admin/news/tags`

`GET/POST/PUT/DELETE /api/v1/admin/programs`

`GET/POST/PUT/DELETE /api/v1/admin/agendas`

`GET/POST /api/v1/admin/documents`

`GET /api/v1/admin/settings` · `PUT /api/v1/admin/settings/{key}`

`GET/POST /api/v1/admin/notifications` · `POST /api/v1/admin/notifications/{notification_id}/read`

`GET /api/v1/admin/activity-logs` · `GET /api/v1/admin/visitor-logs`

`GET/POST /api/v1/media/images` · `GET /api/v1/media/images/{filename:path}` · `GET /api/v1/media/documents/{filename:path}`

`GET /api/v1/public/news` · `GET /api/v1/public/news/{slug}` · `GET /api/v1/public/programs` · `GET /api/v1/public/organization` · `POST /api/v1/public/visits`

## Security

Authentication menggunakan JWT HttpOnly cookie + server-side session record. Mutation pada endpoint authenticated membutuhkan CSRF token. RBAC ditegakkan di backend. Login throttling menggunakan per-IP dan per-account bucket. Production wajib Redis. Error 500 tidak mengekspos detail internal. Upload image memakai Pillow dan disimpan dengan random storage key; dokumen tidak punya route publik.

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
