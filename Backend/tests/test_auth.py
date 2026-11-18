from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import settings
from app.core.security import (
    ALGORITHM,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.database.connection import SessionLocal
from app.main import app
from app.models import ActivityLog, Admin


def test_login_me_logout(client):
    csrf = client.get("/api/v1/auth/csrf")
    assert csrf.status_code == 200

    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={
            "Origin": "http://localhost:3000",
        },
    )
    assert response.status_code == 200

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["admin"]["username"] == "admin"

    csrf_token = client.cookies.get("himatkn_csrf")

    logout = client.post(
        "/api/v1/auth/logout",
        headers={
            "X-CSRF-Token": csrf_token,
            "Origin": "http://localhost:3000",
        },
    )
    assert logout.status_code == 200

    assert client.get("/api/v1/auth/me").status_code == 401
    assert response.status_code == 200
    assert response.json()["admin"]["is_superadmin"] is True

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["admin"]["username"] == "admin"
    assert me.json()["admin"]["is_superadmin"] is True


def test_bad_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "wrong-password",
        },
        headers={
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 401


def test_csrf_required(client):
    login = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={
            "Origin": "http://localhost:3000",
        },
    )
    assert login.status_code == 200

    response = client.put(
        "/api/v1/admin/settings/example",
        json={
            "setting_value": "x",
            "value_type": "string",
        },
        headers={
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 403


def test_login_rate_limit_returns_429(client):
    from app.core.rate_limit import limiter

    limiter._events.clear()

    for _ in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin",
                "password": "wrong-password",
            },
            headers={
                "Origin": "http://localhost:3000",
            },
        )

        assert response.status_code == 401

    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "wrong-password",
        },
        headers={
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 429
    assert "detail" in response.json()
    assert response.headers.get("Retry-After")


def test_origin_protection(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={
            "Origin": "https://evil.example",
        },
    )

    assert response.status_code == 403


def _build_jwt_payload() -> dict:
    now = datetime.now(timezone.utc)

    return {
        "sub": "1",
        "jti": "security-test-jti",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=5),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }


def test_jwt_missing_required_claims_are_rejected():
    required_claims = {
        "sub",
        "jti",
        "iat",
        "nbf",
        "exp",
        "iss",
        "aud",
    }

    base_payload = _build_jwt_payload()

    for missing_claim in required_claims:
        payload = {
            key: value
            for key, value in base_payload.items()
            if key != missing_claim
        }

        token = jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=ALGORITHM,
        )

        with pytest.raises(jwt.InvalidTokenError):
            decode_access_token(token)


def test_jwt_future_nbf_is_rejected():
    now = datetime.now(timezone.utc)

    payload = _build_jwt_payload()
    payload["iat"] = now
    payload["nbf"] = now + timedelta(minutes=5)

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=ALGORITHM,
    )

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(token)


# ---------------------------------------------------------------------------
# B3c: POST /auth/change-password
# ---------------------------------------------------------------------------

B3C_OLD_PASSWORD = "b3c-old-password-1234"
B3C_NEW_PASSWORD = "b3c-new-password-5678"
ORIGIN_HEADERS = {"Origin": "http://localhost:3000"}


def _create_b3c_admin(username: str) -> int:
    with SessionLocal() as db:
        row = Admin(
            username=username,
            password_hash=hash_password(B3C_OLD_PASSWORD),
            is_active=True,
        )
        db.add(row)
        db.commit()
        return row.id


def _b3c_login(client, username: str, password: str) -> dict:
    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
        headers=ORIGIN_HEADERS,
    )
    assert response.status_code == 200

    return {
        "X-CSRF-Token": client.cookies.get("himatkn_csrf"),
        **ORIGIN_HEADERS,
    }


def _change_password(client, headers, current_password, new_password):
    return client.post(
        "/api/v1/auth/change-password",
        json={
            "current_password": current_password,
            "new_password": new_password,
        },
        headers=headers,
    )


def test_change_password_success_allows_new_password(client):
    username = "B3C-SUCCESS"
    _create_b3c_admin(username)
    headers = _b3c_login(client, username, B3C_OLD_PASSWORD)

    response = _change_password(
        client,
        headers,
        B3C_OLD_PASSWORD,
        B3C_NEW_PASSWORD,
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True, "sessions_revoked": 0}
    assert client.get("/api/v1/auth/me").status_code == 200

    old_login = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": B3C_OLD_PASSWORD},
        headers=ORIGIN_HEADERS,
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": B3C_NEW_PASSWORD},
        headers=ORIGIN_HEADERS,
    )
    assert new_login.status_code == 200


def test_change_password_wrong_current_returns_400(client):
    username = "B3C-WRONG-CURRENT"
    _create_b3c_admin(username)
    headers = _b3c_login(client, username, B3C_OLD_PASSWORD)

    response = _change_password(
        client,
        headers,
        "wrong-current-password",
        B3C_NEW_PASSWORD,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Kata sandi lama salah"


def test_change_password_short_new_password_returns_422(client):
    username = "B3C-SHORT"
    _create_b3c_admin(username)
    headers = _b3c_login(client, username, B3C_OLD_PASSWORD)

    response = _change_password(
        client,
        headers,
        B3C_OLD_PASSWORD,
        "pendek-11ch",
    )

    assert response.status_code == 422


def test_change_password_same_as_old_returns_422(client):
    username = "B3C-SAME"
    _create_b3c_admin(username)
    headers = _b3c_login(client, username, B3C_OLD_PASSWORD)

    response = _change_password(
        client,
        headers,
        B3C_OLD_PASSWORD,
        B3C_OLD_PASSWORD,
    )

    assert response.status_code == 422


def test_change_password_requires_csrf(client):
    username = "B3C-NO-CSRF"
    _create_b3c_admin(username)
    _b3c_login(client, username, B3C_OLD_PASSWORD)

    response = _change_password(
        client,
        ORIGIN_HEADERS,
        B3C_OLD_PASSWORD,
        B3C_NEW_PASSWORD,
    )

    assert response.status_code == 403


def test_change_password_requires_login(client):
    client.get("/api/v1/auth/csrf")

    response = client.post(
        "/api/v1/auth/change-password",
        json={
            "current_password": B3C_OLD_PASSWORD,
            "new_password": B3C_NEW_PASSWORD,
        },
        headers={
            "X-CSRF-Token": client.cookies.get("himatkn_csrf"),
            **ORIGIN_HEADERS,
        },
    )

    assert response.status_code == 401


def test_change_password_revokes_other_sessions_only(client):
    username = "B3C-TWO-CLIENTS"
    admin_id = _create_b3c_admin(username)

    client_a = client
    headers_a = _b3c_login(client_a, username, B3C_OLD_PASSWORD)

    client_b = TestClient(app)

    try:
        _b3c_login(client_b, username, B3C_OLD_PASSWORD)

        response = _change_password(
            client_a,
            headers_a,
            B3C_OLD_PASSWORD,
            B3C_NEW_PASSWORD,
        )

        assert response.status_code == 200
        assert response.json() == {"ok": True, "sessions_revoked": 1}

        assert client_a.get("/api/v1/auth/me").status_code == 200
        assert client_b.get("/api/v1/auth/me").status_code == 401

        with SessionLocal() as db:
            admin_row = db.get(Admin, admin_id)
            assert verify_password(
                B3C_NEW_PASSWORD,
                admin_row.password_hash,
            )[0]

            log = db.scalar(
                select(ActivityLog).where(
                    ActivityLog.action == "admin.password_change",
                    ActivityLog.entity_id == admin_id,
                )
            )
            assert log is not None
            assert B3C_OLD_PASSWORD not in (log.description or "")
            assert B3C_NEW_PASSWORD not in (log.description or "")
    finally:
        client_b.close()