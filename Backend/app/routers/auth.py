from __future__ import annotations

from datetime import datetime, timezone
import jwt
from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_csrf_token,
    hash_password,
    verify_password,
)
from app.database.connection import get_db
from app.database.dependencies import current_admin, require_csrf
from app.models import Admin, AuthSession
from app.schemas.auth import AuthResponse, ChangePasswordIn, LoginRequest
from app.services.audit import log_activity
from app.services.auth import admin_payload, create_session, revoke_token
from app.utils.ip import get_client_ip


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.get("/csrf")
def csrf(response: Response) -> dict[str, str]:
    token = generate_csrf_token()

    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=86400,
        path="/",
    )

    return {"csrf_token": token}


@router.post(
    "/login",
    response_model=AuthResponse,
)
async def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    username = payload.username.strip()
    client_ip = limiter.client_ip(request)

    # Per-IP rate limit
    allowed, retry_after = await limiter.allow(
        f"login-ip:{client_ip}",
        settings.login_ip_limit,
        settings.login_ip_window_seconds,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak percobaan login. Silakan coba lagi nanti.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(settings.login_ip_limit),
            },
        )

    # Per-IP + username rate limit
    account_key = (
        f"login-account:{client_ip}:{username.casefold()[:100]}"
    )

    allowed, retry_after = await limiter.allow(
        account_key,
        settings.login_account_limit,
        settings.login_account_window_seconds,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak percobaan login untuk akun ini.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(settings.login_account_limit),
            },
        )

    admin = db.scalar(
        select(Admin).where(Admin.username == username)
    )

    # Keep password verification timing reasonably consistent
    # even when the username does not exist.
    if admin is None:
        hash_password(payload.password)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    if not admin.is_active:
        # Still perform password verification before returning.
        verify_password(
            payload.password,
            admin.password_hash,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    valid, needs_rehash = verify_password(
        payload.password,
        admin.password_hash,
    )

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    if needs_rehash:
        admin.password_hash = hash_password(payload.password)

    admin.last_login_at = datetime.now(
        timezone.utc
    ).replace(tzinfo=None)

    token, jti, expires_at = create_access_token(
        admin.id,
        admin.username,
    )

    create_session(
        db,
        admin.id,
        jti,
        token,
        expires_at,
    )

    db.commit()
    db.refresh(admin)

    # Authentication cookie
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )

    # CSRF cookie
    csrf_token = generate_csrf_token()

    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=86400,
        path="/",
    )

    return {
        "admin": admin_payload(
            db,
            admin,
        )
    }


@router.get(
    "/me",
    response_model=AuthResponse,
)
def me(
    admin: Admin = Depends(current_admin),
    db: Session = Depends(get_db),
) -> dict:
    return {
        "admin": admin_payload(
            db,
            admin,
        )
    }


@router.post(
    "/change-password",
    dependencies=[Depends(require_csrf)],
)
def change_password(
    payload: ChangePasswordIn,
    request: Request,
    token: str | None = Cookie(
        default=None,
        alias=settings.cookie_name,
    ),
    db: Session = Depends(get_db),
    admin: Admin = Depends(current_admin),
) -> dict:
    valid, _ = verify_password(
        payload.current_password,
        admin.password_hash,
    )

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi lama salah",
        )

    # current_admin already validated this token, so it is safe to decode.
    current_jti = str(decode_access_token(token)["jti"])

    admin.password_hash = hash_password(payload.new_password)

    other_sessions = (
        AuthSession.admin_id == admin.id,
        AuthSession.jti != current_jti,
        AuthSession.revoked_at.is_(None),
    )

    sessions_revoked = db.scalar(
        select(func.count())
        .select_from(AuthSession)
        .where(*other_sessions)
    ) or 0

    if sessions_revoked:
        db.execute(
            update(AuthSession)
            .where(*other_sessions)
            .values(
                revoked_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
        )

    log_activity(
        db=db,
        admin_id=admin.id,
        action="admin.password_change",
        entity_type="admin",
        entity_id=admin.id,
        description=f"Mengganti kata sandi akun {admin.username}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )

    try:
        db.commit()
    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Kata sandi belum berhasil diubah. "
                "Silakan coba lagi."
            ),
        ) from exc

    return {"ok": True, "sessions_revoked": sessions_revoked}



@router.post(
    "/logout",
    dependencies=[Depends(require_csrf)],
)
def logout(
    response: Response,
    token: str | None = Cookie(
        default=None,
        alias=settings.cookie_name,
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if token:
        try:
            payload = decode_access_token(token)
        except jwt.InvalidTokenError:
            payload = None

        if payload is not None:
            try:
                jti = str(payload["jti"])

                revoke_token(
                    db,
                    token,
                    jti,
                )

                db.commit()

            except Exception as exc:
                db.rollback()

                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=(
                        "Sesi belum berhasil diakhiri. "
                        "Silakan coba lagi."
                    ),
                ) from exc

    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
        secure=settings.cookie_secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )

    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        httponly=False,
        samesite=settings.cookie_samesite,
    )

    return {"message": "Logout berhasil"}
