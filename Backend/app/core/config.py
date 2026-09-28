from __future__ import annotations

import json
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    app_name: str = "HIMATKN API"
    app_env: str = "development"
    debug: bool = False

    # Database / authentication secrets
    database_url: str
    jwt_secret_key: str

    jwt_issuer: str = "himatkn-api"
    jwt_audience: str = "himatkn-admin"
    jwt_expire_minutes: int = Field(30, ge=5, le=120)

    # Cookies
    cookie_name: str = "himatkn_access"
    csrf_cookie_name: str = "himatkn_csrf"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    # CORS
    cors_origins: list[str] = Field(default_factory=list)

    # Proxy
    trusted_proxy_ips: str = ""

    # Rate limiting
    rate_limit_backend: str = "memory"
    rate_limit_fail_closed: bool = True
    redis_url: str = ""

    login_ip_limit: int = 10
    login_ip_window_seconds: int = 60
    login_account_limit: int = 5
    login_account_window_seconds: int = 60

    general_read_limit: int = 120
    general_read_window_seconds: int = 60
    general_write_limit: int = 60
    general_write_window_seconds: int = 60

    global_read_limit: int = Field(360, ge=1)
    global_write_limit: int = Field(120, ge=1)

    general_read_limit: int = Field(120, ge=1)
    general_read_window_seconds: int = Field(60, ge=1)

    general_write_limit: int = Field(60, ge=1)
    general_write_window_seconds: int = Field(60, ge=1)

    # Request / upload limits
    max_request_body_bytes: int = 4_300_000
    max_upload_bytes: int = 4 * 1024 * 1024

    # Image processing
    max_image_width: int = 2400
    max_image_height: int = 2400
    image_jpeg_quality: int = Field(82, ge=60, le=95)

    # Storage
    storage_backend: str = "local"
    storage_local_dir: str = "storage/uploads"

    s3_endpoint_url: str = ""
    s3_bucket: str = ""
    s3_region: str = "auto"
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_public_base_url: str = ""

    # Bootstrap admin
    # Username and role are not secrets, but password is.
    admin_default_username: str = "admin"
    admin_default_password: str
    admin_default_role: str = "superadmin"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(
        cls,
        value: str | list[str],
    ) -> list[str]:
        if isinstance(value, list):
            return [
                str(origin).strip().rstrip("/")
                for origin in value
                if str(origin).strip()
            ]

        value = value.strip()

        if not value:
            return []

        if value.startswith("["):
            parsed = json.loads(value)

            if not isinstance(parsed, list):
                raise ValueError(
                    "CORS_ORIGINS harus berupa JSON array."
                )

            return [
                str(origin).strip().rstrip("/")
                for origin in parsed
                if str(origin).strip()
            ]

        return [
            origin.strip().rstrip("/")
            for origin in value.split(",")
            if origin.strip()
        ]

    @property
    def production(self) -> bool:
        return self.app_env.lower() in {"production", "prod"}

    @property
    def cors_origin_list(self) -> list[str]:
        return self.cors_origins

    @property
    def trusted_proxy_ip_list(self) -> list[str]:
        return [
            x.strip()
            for x in self.trusted_proxy_ips.split(",")
            if x.strip()
        ]

    def validate_runtime(self) -> None:
        if self.production:
            if len(self.jwt_secret_key) < 32:
                raise RuntimeError(
                    "JWT_SECRET_KEY minimal 32 karakter pada production."
                )

            if not self.cookie_secure:
                raise RuntimeError(
                    "COOKIE_SECURE=true wajib di production."
                )

            if (
                self.rate_limit_backend != "redis"
                or not self.redis_url
            ):
                raise RuntimeError(
                    "Production wajib memakai Redis untuk rate limiting."
                )

            if not self.rate_limit_fail_closed:
                raise RuntimeError(
                    "RATE_LIMIT_FAIL_CLOSED=true wajib di production."
                )

            if self.storage_backend == "local":
                raise RuntimeError(
                    "Production/serverless wajib memakai object storage."
                )

            if "*" in self.cors_origin_list:
                raise RuntimeError(
                    "CORS wildcard tidak diperbolehkan di production."
                )

            if not self.admin_default_password:
                raise RuntimeError(
                    "ADMIN_DEFAULT_PASSWORD wajib diisi di production."
                )

            if self.admin_default_password in {
                "CHANGE_ME",
                "password",
            }:
                raise RuntimeError(
                    "ADMIN_DEFAULT_PASSWORD harus diganti di production."
                )

            if (
                self.storage_backend == "s3"
                and not (
                    self.s3_bucket
                    and self.s3_access_key_id
                    and self.s3_secret_access_key
                )
            ):
                raise RuntimeError(
                    "Konfigurasi S3 belum lengkap."
                )

            if self.max_request_body_bytes > 4_500_000:
                raise RuntimeError(
                    "MAX_REQUEST_BODY_BYTES harus <= 4.5 MB "
                    "untuk Vercel Functions."
                )

            if self.max_upload_bytes > 4_000_000:
                raise RuntimeError(
                    "MAX_UPLOAD_BYTES harus <= 4 MB "
                    "pada deployment Vercel server-side upload."
                )

        if self.cookie_samesite not in {
            "lax",
            "strict",
            "none",
        }:
            raise RuntimeError(
                "COOKIE_SAMESITE harus lax, strict, atau none."
            )

        if self.cookie_samesite == "none" and not self.cookie_secure:
            raise RuntimeError(
                "COOKIE_SECURE=true wajib untuk SameSite=None."
            )

        if self.rate_limit_backend not in {
            "memory",
            "redis",
        }:
            raise RuntimeError(
                "RATE_LIMIT_BACKEND harus memory atau redis."
            )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_runtime()
    return settings


settings = get_settings()