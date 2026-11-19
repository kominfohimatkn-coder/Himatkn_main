from __future__ import annotations

from secrets import compare_digest

from fastapi import (
    Cookie,
    Depends,
    Header,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.database.connection import get_db
from app.models import Admin
from app.services.auth import (
    get_session_admin,
    permissions_for_admin,
)


async def current_admin(
    token: str | None = Cookie(
        default=None,
        alias=settings.cookie_name,
    ),
    db: Session = Depends(get_db),
) -> Admin:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Belum login",
        )

    try:
        payload = decode_access_token(token)

        admin_id = int(payload["sub"])
        jti = str(payload["jti"])

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi tidak valid",
        ) from exc

    admin = get_session_admin(
        db,
        token,
        admin_id,
        jti,
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi tidak valid",
        )

    return admin


def require_permission(permission: str):
    def dependency(
        admin: Admin = Depends(current_admin),
        db: Session = Depends(get_db),
    ) -> Admin:
        if permission not in permissions_for_admin(
            db,
            admin.id,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin untuk modul ini",
            )

        return admin

    return dependency


def require_any_permission(*permissions: str):
    def dependency(
        admin: Admin = Depends(current_admin),
        db: Session = Depends(get_db),
    ) -> Admin:
        granted = permissions_for_admin(
            db,
            admin.id,
        )

        if not any(permission in granted for permission in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin untuk modul ini",
            )

        return admin

    return dependency


async def require_csrf(
    csrf_cookie: str | None = Cookie(
        default=None,
        alias=settings.csrf_cookie_name,
    ),
    csrf_header: str | None = Header(
        default=None,
        alias="X-CSRF-Token",
    ),
) -> None:
    if (
        not csrf_cookie
        or not csrf_header
        or not compare_digest(csrf_cookie, csrf_header)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token tidak valid",
        )