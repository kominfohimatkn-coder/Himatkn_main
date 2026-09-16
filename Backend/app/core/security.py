from __future__ import annotations
from datetime import datetime, timedelta, timezone
import hashlib, secrets
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.core.config import settings

_password_hasher = PasswordHasher()
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return _password_hasher.hash(password)

def verify_password(password: str, password_hash: str) -> tuple[bool, bool]:
    try:
        valid = _password_hasher.verify(password_hash, password)
        return valid, _password_hasher.check_needs_rehash(password_hash)
    except (VerifyMismatchError, Exception):
        return False, False

def token_fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_access_token(admin_id: int, username: str) -> tuple[str, str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.jwt_expire_minutes)
    jti = secrets.token_urlsafe(32)
    payload = {"sub": str(admin_id), "jti": jti, "iat": now, "exp": expires_at, "iss": settings.jwt_issuer, "aud": settings.jwt_audience}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)
    return token, jti, expires_at

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM], issuer=settings.jwt_issuer, audience=settings.jwt_audience)

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)
