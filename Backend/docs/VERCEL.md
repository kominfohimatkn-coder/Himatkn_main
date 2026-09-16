# Vercel Deployment Notes

This backend is structured for Vercel Python Functions through `api/index.py`.

Production environment should use:

- `APP_ENV=production`
- a strong random `JWT_SECRET_KEY` (32+ characters)
- `COOKIE_SECURE=true`
- explicit `CORS_ORIGINS`
- `RATE_LIMIT_BACKEND=redis`
- a reachable `REDIS_URL`
- `STORAGE_BACKEND=s3` with valid S3-compatible credentials
- TiDB Cloud/MySQL-compatible `DATABASE_URL` with TLS as required by the provider

Do not store permanent uploads on the Vercel function filesystem.

Vercel Functions currently enforce a 4.5 MB request payload limit. The backend therefore defaults `MAX_UPLOAD_BYTES` to 4 MB to leave room for multipart overhead. For larger files, use a direct-to-object-storage upload flow rather than sending the full file through the FastAPI Function.
