# Security notes

- Authentication: JWT in HttpOnly cookie; server-side `auth_sessions` is checked on every authenticated request.
- CSRF: state-changing authenticated requests require the CSRF cookie value in `X-CSRF-Token`; unsafe browser requests also pass the CORS Origin allowlist.
- Authorization: permissions are resolved from `admin_roles` → `roles` → `role_permissions` → `permissions` and enforced server-side.
- Rate limiting: login uses IP and IP+username buckets. General public reads and API writes also have configurable limits. Production requires Redis.
- Secrets: production secrets are environment-only. No real credential is included in this package.
- Uploads: images are validated with Pillow, resized, re-encoded, assigned random keys, and protected against path traversal. Documents are not public.
- Errors: unexpected server errors return a generic JSON message.
- Production edge protection: use HTTPS plus a CDN/WAF/reverse proxy. Application rate limiting is not a replacement for volumetric DDoS protection.
