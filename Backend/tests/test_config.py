import pytest
from pydantic import ValidationError

from app.core.config import Settings


def production_settings(**overrides) -> Settings:
    values = {
        "app_env": "production",
        "database_url": "mysql+pymysql://user:password@localhost/db",
        "jwt_secret_key": "abcdefghijklmnopqrstuvwxyz012345",
        "cookie_secure": True,
        "cookie_samesite": "lax",
        "cors_origins": ["https://example.com"],
        "rate_limit_backend": "redis",
        "rate_limit_fail_closed": True,
        "redis_url": "redis://localhost:6379/0",
        "storage_backend": "s3",
        "s3_bucket": "bucket",
        "s3_access_key_id": "key",
        "s3_secret_access_key": "secret",
        "admin_default_password": "s3cure-random-password",
        "max_upload_bytes": 4_000_000,
    }
    values.update(overrides)
    return Settings(**values)


def test_production_requires_rate_limit_fail_closed():
    settings = production_settings(rate_limit_fail_closed=False)

    try:
        settings.validate_runtime()
    except RuntimeError as exc:
        assert "RATE_LIMIT_FAIL_CLOSED=true" in str(exc)
    else:
        raise AssertionError(
            "Production harus menolak RATE_LIMIT_FAIL_CLOSED=false"
        )


def test_production_accepts_valid_configuration():
    production_settings().validate_runtime()


@pytest.mark.parametrize(
    "password",
    [
        "admin123",
        "admin",
        "password",
        "changeme",
        "change_me",
        "12345678",
        "123456789012",
        "himatkn",
        "CHANGE_ME_random_value",
    ],
)
def test_production_rejects_weak_admin_password(password):
    settings = production_settings(admin_default_password=password)

    with pytest.raises(RuntimeError, match="ADMIN_DEFAULT_PASSWORD"):
        settings.validate_runtime()


def test_production_rejects_short_admin_password():
    settings = production_settings(admin_default_password="abcdefghijk")

    with pytest.raises(RuntimeError) as exc_info:
        settings.validate_runtime()

    assert "minimal 12 karakter" in str(exc_info.value)


def test_production_rejects_jwt_secret_with_placeholder():
    settings = production_settings(
        jwt_secret_key="CHANGE_ME_abcdefghijklmnopqrstuvwxyz",
    )

    with pytest.raises(RuntimeError, match="CHANGE_ME"):
        settings.validate_runtime()


def test_production_rejects_low_entropy_jwt_secret():
    settings = production_settings(jwt_secret_key="a" * 40)

    with pytest.raises(RuntimeError, match="unik"):
        settings.validate_runtime()


def test_app_env_rejects_unknown_value():
    with pytest.raises(ValidationError, match="APP_ENV"):
        production_settings(app_env="staging")


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("production", "production"),
        (" PROD ", "production"),
        ("dev", "development"),
        ("TEST", "test"),
    ],
)
def test_app_env_is_normalized(value, expected):
    settings = Settings(
        app_env=value,
        database_url="sqlite:///./test.sqlite3",
        jwt_secret_key="test-secret-" + "x" * 40,
        admin_default_password="not-used-outside-production",
    )

    assert settings.app_env == expected
