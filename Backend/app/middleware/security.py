from __future__ import annotations
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.rate_limit import enforce_request_limit

def install_security_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def security(request: Request, call_next):
        try:
            length = int(request.headers.get("content-length", "0"))
        except ValueError:
            return JSONResponse(status_code=400, content={"detail":"Content-Length tidak valid"})
        if length > settings.max_request_body_bytes:
            return JSONResponse(status_code=413, content={"detail":"Ukuran request terlalu besar"})
        origin = request.headers.get("origin")
        if request.method.upper() in {"POST","PUT","PATCH","DELETE"} and origin and origin.rstrip("/") not in settings.cors_origin_list:
            return JSONResponse(status_code=403, content={"detail":"Origin tidak diizinkan"})
        try:
            await enforce_request_limit(request)
        except Exception as exc:
            if getattr(exc, "status_code", None) == 429:
                headers = getattr(exc, "headers", None) or {}
                return JSONResponse(status_code=429, content={"detail": str(exc.detail)}, headers=headers)
            raise
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
        response.headers.setdefault("Cache-Control", "no-store" if request.url.path.startswith("/api/v1/") else "public, max-age=60")
        if not request.url.path in {"/docs","/redoc","/openapi.json"}:
            response.headers.setdefault("Content-Security-Policy", "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        if settings.production:
            response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        return response
