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


def _base_settings(**overrides) -> Settings:
    values = {
        "app_env": "test",
        "database_url": "sqlite:///./test.sqlite3",
        "jwt_secret_key": "test-secret-" + "x" * 40,
        "admin_default_password": "not-used-outside-production",
    }
    values.update(overrides)
    return Settings(**values)


def test_client_ip_source_rejects_unknown_value():
    with pytest.raises(ValidationError, match="CLIENT_IP_SOURCE"):
        _base_settings(client_ip_source="cloudflare")


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("direct", "direct"),
        (" TRUSTED_PROXY ", "trusted_proxy"),
        ("Vercel", "vercel"),
    ],
)
def test_client_ip_source_is_normalized(value, expected):
    assert _base_settings(client_ip_source=value).client_ip_source == expected


def test_general_limit_defaults_are_preserved():
    settings = _base_settings()

    assert settings.general_read_limit == 120
    assert settings.general_read_window_seconds == 60
    assert settings.general_write_limit == 60
    assert settings.general_write_window_seconds == 60


def test_production_on_vercel_requires_vercel_source(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")

    with pytest.raises(RuntimeError, match="CLIENT_IP_SOURCE"):
        production_settings().validate_runtime()


def test_production_on_vercel_accepts_vercel_source(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")

    production_settings(client_ip_source="vercel").validate_runtime()


def test_production_off_vercel_accepts_direct_source(monkeypatch):
    monkeypatch.delenv("VERCEL", raising=False)

    production_settings(client_ip_source="direct").validate_runtime()


@pytest.mark.parametrize("backend", ["local", "s3", "vercel_blob"])
def test_storage_backend_accepts_known_values(backend):
    assert _base_settings(storage_backend=backend).storage_backend == backend


def test_storage_backend_rejects_unknown_value():
    with pytest.raises(ValidationError, match="STORAGE_BACKEND"):
        _base_settings(storage_backend="r2")


def _vercel_blob_settings(**overrides) -> Settings:
    values = {
        "storage_backend": "vercel_blob",
        "blob_read_write_token": "vercel_blob_rw_store_secret",
        "blob_public_base_url": "https://store.public.blob.vercel-storage.com",
    }
    values.update(overrides)
    return production_settings(**values)


def test_production_vercel_blob_accepts_valid_configuration():
    _vercel_blob_settings().validate_runtime()


def test_production_vercel_blob_requires_token():
    token = "vercel_blob_rw_store_secret"

    with pytest.raises(RuntimeError, match="BLOB_READ_WRITE_TOKEN") as exc_info:
        _vercel_blob_settings(blob_read_write_token="").validate_runtime()

    assert token not in str(exc_info.value)


def test_production_vercel_blob_requires_base_url():
    with pytest.raises(RuntimeError, match="BLOB_PUBLIC_BASE_URL"):
        _vercel_blob_settings(blob_public_base_url="").validate_runtime()


@pytest.mark.parametrize(
    "base_url",
    [
        "http://store.public.blob.vercel-storage.com",
        "https://store.example.com",
        "https://store.public.blob.vercel-storage.com/images",
        "https://store.public.blob.vercel-storage.com/",
        "https://public.blob.vercel-storage.com",
        "https://store.public.blob.vercel-storage.com?x=1",
    ],
)
def test_production_vercel_blob_rejects_invalid_base_url(base_url):
    with pytest.raises(RuntimeError, match="BLOB_PUBLIC_BASE_URL"):
        _vercel_blob_settings(blob_public_base_url=base_url).validate_runtime()
