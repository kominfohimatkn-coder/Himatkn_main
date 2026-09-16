from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.core.config import settings
from app.core.security import ALGORITHM, decode_access_token


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