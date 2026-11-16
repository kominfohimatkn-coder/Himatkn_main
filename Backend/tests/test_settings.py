from __future__ import annotations

import pytest
from sqlalchemy import delete, select

from app.database.connection import SessionLocal
from app.models import ActivityLog, SiteSetting
from app.services.site_settings import (
    PUBLIC_SETTING_KEYS,
    SETTINGS_REGISTRY,
)

ORIGIN = "http://localhost:3000"


def login(
    client,
    username: str = "admin",
    password: str = "admin-password-1234",
) -> str:
    client.get("/api/v1/auth/csrf")

    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": username,
            "password": password,
        },
        headers={"Origin": ORIGIN},
    )

    assert response.status_code == 200

    return client.cookies.get("himatkn_csrf")


def csrf_headers(token: str) -> dict[str, str]:
    return {
        "Origin": ORIGIN,
        "X-CSRF-Token": token,
    }


@pytest.fixture(autouse=True)
def clean_site_settings():
    def clear() -> None:
        with SessionLocal() as db:
            db.execute(delete(SiteSetting))
            db.execute(
                delete(ActivityLog).where(
                    ActivityLog.action.like("settings.%")
                )
            )
            db.commit()

    clear()

    yield

    clear()


@pytest.fixture
def admin_headers(client):
    return csrf_headers(login(client))


@pytest.fixture
def limited_headers(client):
    return csrf_headers(
        login(client, "limited", "limited-password-1234")
    )


def insert_setting(
    key: str,
    value: str | None,
    value_type: str = "text",
) -> None:
    with SessionLocal() as db:
        db.add(
            SiteSetting(
                setting_key=key,
                setting_value=value,
                value_type=value_type,
            )
        )
        db.commit()


def stored_setting(key: str) -> SiteSetting | None:
    with SessionLocal() as db:
        return db.scalar(
            select(SiteSetting).where(
                SiteSetting.setting_key == key
            )
        )


def activity_descriptions(action: str = "settings.update") -> list[str]:
    with SessionLocal() as db:
        rows = db.scalars(
            select(ActivityLog)
            .where(ActivityLog.action == action)
            .order_by(ActivityLog.id)
        ).all()

        return [row.description or "" for row in rows]


def test_public_settings_uses_defaults_with_cache_header(client):
    response = client.get("/api/v1/public/settings")

    assert response.status_code == 200
    assert response.headers["cache-control"] == "public, max-age=60"

    settings = response.json()["settings"]

    assert tuple(settings) == PUBLIC_SETTING_KEYS
    assert settings["brand_name"] == SETTINGS_REGISTRY["brand_name"].default
    assert settings["bank_soal_url"] == ""


def test_public_settings_uses_db_values_and_ignores_unknown_keys(
    client,
):
    insert_setting("brand_name", "Contoh Brand")
    insert_setting("junk_key", "nilai-sampah")

    response = client.get("/api/v1/public/settings")

    assert response.status_code == 200

    settings = response.json()["settings"]

    assert settings["brand_name"] == "Contoh Brand"
    assert "junk_key" not in settings
    assert "nilai-sampah" not in response.text
    assert len(settings) == len(PUBLIC_SETTING_KEYS)


def test_public_settings_empty_value_overrides_default_and_null_falls_back(
    client,
):
    insert_setting("brand_name", "")
    insert_setting("brand_subtitle", None)

    settings = client.get("/api/v1/public/settings").json()["settings"]

    assert settings["brand_name"] == ""
    assert (
        settings["brand_subtitle"]
        == SETTINGS_REGISTRY["brand_subtitle"].default
    )


def test_admin_settings_requires_login(client):
    response = client.get("/api/v1/admin/settings")

    assert response.status_code == 401


def test_admin_settings_requires_permission(
    client,
    limited_headers,
):
    response = client.get("/api/v1/admin/settings")

    assert response.status_code == 403


def test_admin_settings_returns_metadata_and_unknown_keys(
    client,
    admin_headers,
):
    insert_setting("junk_key", "nilai-sampah")

    response = client.get("/api/v1/admin/settings")

    assert response.status_code == 200

    body = response.json()

    assert len(body["items"]) == len(SETTINGS_REGISTRY)
    assert body["unknown_keys"] == ["junk_key"]

    items = {item["key"]: item for item in body["items"]}
    brand = items["brand_name"]

    assert brand["group"] == "brand"
    assert brand["type"] == "text"
    assert brand["label"]
    assert brand["default"] == SETTINGS_REGISTRY["brand_name"].default
    assert brand["max_length"] == 300
    assert brand["value"] == SETTINGS_REGISTRY["brand_name"].default
    assert brand["updated_by"] is None
    assert brand["updated_at"] is None
    assert items["bank_soal_url"]["allowed_hosts"] == [
        "drive.google.com"
    ]


def test_put_unknown_key_is_404_without_echoing_key(
    client,
    admin_headers,
):
    response = client.put(
        "/api/v1/admin/settings/key-sampah-rahasia",
        json={"setting_value": "x"},
        headers=admin_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Setting tidak dikenal"
    assert "key-sampah-rahasia" not in response.text
    assert stored_setting("key-sampah-rahasia") is None


def test_put_requires_csrf_and_permission(
    client,
    admin_headers,
):
    login(client)

    without_csrf = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Tanpa CSRF"},
        headers={"Origin": ORIGIN},
    )

    assert without_csrf.status_code == 403

    limited_token = login(
        client,
        "limited",
        "limited-password-1234",
    )

    without_permission = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Tanpa Izin"},
        headers=csrf_headers(limited_token),
    )

    assert without_permission.status_code == 403


@pytest.mark.parametrize(
    ("key", "value"),
    [
        ("bank_soal_url", "http://drive.google.com/folder"),
        ("bank_soal_url", "javascript:alert(1)"),
        ("bank_soal_url", "https://evil.example/folder"),
        ("bank_soal_url", "https://drive.google.com.evil.example/x"),
        ("bank_soal_url", "https://drive.google.com@evil.example/x"),
        ("bank_soal_url", "https://user:pass@drive.google.com/x"),
        ("bank_soal_url", "https://drive.google.com:8443/x"),
        ("maps_embed_url", "https://maps.app.goo.gl/abc123"),
        ("maps_embed_url", "https://www.google.com/maps?q=abc"),
        ("maps_embed_url", "https://google.com/maps/embed?pb=x"),
    ],
)
def test_put_rejects_invalid_urls(
    client,
    admin_headers,
    key,
    value,
):
    response = client.put(
        f"/api/v1/admin/settings/{key}",
        json={"setting_value": value},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert stored_setting(key) is None


def test_put_accepts_valid_values_and_trims(
    client,
    admin_headers,
):
    instagram = client.put(
        "/api/v1/admin/settings/instagram_url",
        json={
            "setting_value": "  https://www.instagram.com/himatknuklir  "
        },
        headers=admin_headers,
    )

    assert instagram.status_code == 200
    assert (
        instagram.json()["value"]
        == "https://www.instagram.com/himatknuklir"
    )

    embed = client.put(
        "/api/v1/admin/settings/maps_embed_url",
        json={
            "setting_value": (
                "https://www.google.com/maps/embed?pb=contoh"
            )
        },
        headers=admin_headers,
    )

    assert embed.status_code == 200

    email = client.put(
        "/api/v1/admin/settings/contact_email",
        json={"setting_value": "admin@example.com"},
        headers=admin_headers,
    )

    assert email.status_code == 200


def test_put_accepts_empty_value(client, admin_headers):
    response = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": ""},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["value"] == ""

    settings = client.get("/api/v1/public/settings").json()["settings"]

    assert settings["brand_name"] == ""


def test_put_rejects_long_value_and_control_characters(
    client,
    admin_headers,
):
    too_long = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "x" * 301},
        headers=admin_headers,
    )

    assert too_long.status_code == 422

    control = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Brand\x00Sampah"},
        headers=admin_headers,
    )

    assert control.status_code == 422

    newline = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Brand\nBaru"},
        headers=admin_headers,
    )

    assert newline.status_code == 422


def test_put_multiline_accepts_newlines(client, admin_headers):
    response = client.put(
        "/api/v1/admin/settings/secretariat_address",
        json={"setting_value": "Baris pertama\r\nBaris kedua"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["value"] == "Baris pertama\nBaris kedua"


def test_put_ignores_client_value_type(client, admin_headers):
    response = client.put(
        "/api/v1/admin/settings/brand_name",
        json={
            "setting_value": "Brand Baru",
            "value_type": "number",
        },
        headers=admin_headers,
    )

    assert response.status_code == 200

    row = stored_setting("brand_name")

    assert row is not None
    assert row.value_type == "text"


def test_put_logs_activity_without_value(client, admin_headers):
    response = client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Nilai Sangat Rahasia"},
        headers=admin_headers,
    )

    assert response.status_code == 200

    descriptions = activity_descriptions("settings.update")

    assert len(descriptions) == 1
    assert "brand_name" in descriptions[0]
    assert "Nilai Sangat Rahasia" not in descriptions[0]


def test_patch_is_atomic(client, admin_headers):
    response = client.patch(
        "/api/v1/admin/settings",
        json={
            "values": {
                "brand_name": "Brand Baru",
                "contact_email": "bukan-email",
            }
        },
        headers=admin_headers,
    )

    assert response.status_code == 422

    body = response.json()

    assert body["errors"]["contact_email"]
    assert "brand_name" not in body["errors"]
    assert stored_setting("brand_name") is None
    assert activity_descriptions("settings.update") == []


def test_patch_saves_multiple_values_with_one_log(
    client,
    admin_headers,
):
    response = client.patch(
        "/api/v1/admin/settings",
        json={
            "values": {
                "brand_name": "Patch Brand",
                "news_title": "Patch Publikasi",
            }
        },
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert set(response.json()["updated"]) == {
        "brand_name",
        "news_title",
    }

    settings = client.get("/api/v1/public/settings").json()["settings"]

    assert settings["brand_name"] == "Patch Brand"
    assert settings["news_title"] == "Patch Publikasi"

    descriptions = activity_descriptions("settings.update")

    assert len(descriptions) == 1
    assert "brand_name" in descriptions[0]
    assert "news_title" in descriptions[0]
    assert "Patch Brand" not in descriptions[0]


def test_patch_rejects_unknown_keys_and_empty_payload(
    client,
    admin_headers,
):
    unknown = client.patch(
        "/api/v1/admin/settings",
        json={"values": {"tidak_ada": "x"}},
        headers=admin_headers,
    )

    assert unknown.status_code == 422
    assert unknown.json()["errors"]["tidak_ada"] == "Setting tidak dikenal"

    empty = client.patch(
        "/api/v1/admin/settings",
        json={"values": {}},
        headers=admin_headers,
    )

    assert empty.status_code == 422


def test_delete_registry_key_restores_default(
    client,
    admin_headers,
):
    client.put(
        "/api/v1/admin/settings/brand_name",
        json={"setting_value": "Sementara"},
        headers=admin_headers,
    )

    response = client.delete(
        "/api/v1/admin/settings/brand_name",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["value"] == SETTINGS_REGISTRY["brand_name"].default
    assert stored_setting("brand_name") is None

    settings = client.get("/api/v1/public/settings").json()["settings"]

    assert settings["brand_name"] == SETTINGS_REGISTRY["brand_name"].default


def test_delete_unknown_db_key_cleans_row(client, admin_headers):
    insert_setting("junk_key", "nilai-sampah")

    response = client.delete(
        "/api/v1/admin/settings/junk_key",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert stored_setting("junk_key") is None

    body = client.get("/api/v1/admin/settings").json()

    assert body["unknown_keys"] == []


def test_delete_registry_key_without_row_is_noop(client, admin_headers):
    response = client.delete(
        "/api/v1/admin/settings/brand_name",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["value"] == SETTINGS_REGISTRY["brand_name"].default


def test_delete_missing_key_is_404(client, admin_headers):
    response = client.delete(
        "/api/v1/admin/settings/tidak_ada",
        headers=admin_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Setting tidak ditemukan"
