from app.core.config import Settings


def test_production_requires_rate_limit_fail_closed():
    settings = Settings(
        app_env="production",
        database_url="mysql+pymysql://user:password@localhost/db",
        jwt_secret_key="x" * 32,
        cookie_secure=True,
        cookie_samesite="lax",
        cors_origins=["https://example.com"],
        rate_limit_backend="redis",
        rate_limit_fail_closed=False,
        redis_url="redis://localhost:6379/0",
        storage_backend="s3",
        s3_bucket="bucket",
        s3_access_key_id="key",
        s3_secret_access_key="secret",
        admin_default_password="a-strong-password",
    )

    try:
        settings.validate_runtime()
    except RuntimeError as exc:
        assert "RATE_LIMIT_FAIL_CLOSED=true" in str(exc)
    else:
        raise AssertionError(
            "Production harus menolak RATE_LIMIT_FAIL_CLOSED=false"
        )