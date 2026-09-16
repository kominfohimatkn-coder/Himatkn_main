from __future__ import annotations
from fastapi import HTTPException, Request, status
from app.core.config import settings
from secrets import compare_digest

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
async def validate_csrf(request: Request) -> None:
    if request.method.upper() in SAFE_METHODS:
        return
    cookie = request.cookies.get(settings.csrf_cookie_name)
    header = request.headers.get("X-CSRF-Token")
    if not cookie or not header or not compare_digest(cookie, header):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token tidak valid")
