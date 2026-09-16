from __future__ import annotations

import io
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services import storage
from app.services.storage import local_file


def _login(client: TestClient) -> str:
    response = client.get("/api/v1/auth/csrf")
    assert response.status_code == 200

    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200

    csrf = client.cookies.get("himatkn_csrf")
    assert csrf
    return csrf


def _image_bytes() -> bytes:
    buffer = io.BytesIO()
    image = Image.new("RGB", (100, 100), "white")
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _pdf_bytes() -> bytes:
    return b"%PDF-1.4\n%test document\n"


def test_public_image_missing_returns_404(client, monkeypatch, tmp_path):
    monkeypatch.setattr(
        storage.settings,
        "storage_backend",
        "local",
        raising=False,
    )
    monkeypatch.setattr(
        storage.settings,
        "storage_local_dir",
        str(tmp_path),
        raising=False,
    )

    response = client.get("/api/v1/media/images/not-found.jpg")

    assert response.status_code == 404


def test_public_image_path_traversal_is_rejected(client):
    response = client.get("/api/v1/media/images/../secret.jpg")

    assert response.status_code in {404, 400}


def test_private_document_requires_auth(client):
    response = client.get("/api/v1/media/documents/private-test.pdf")

    assert response.status_code == 401


def test_private_document_path_traversal_is_rejected(client):
    csrf = _login(client)

    response = client.get(
        "/api/v1/media/documents/../secret.pdf",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code in {404, 400}


def test_image_upload_without_auth_or_csrf_is_rejected(client):
    response = client.post(
        "/api/v1/media/images",
        files={
            "file": (
                "photo.png",
                _image_bytes(),
                "image/png",
            )
        },
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 403


def test_image_upload_requires_csrf(client):
    _login(client)

    response = client.post(
        "/api/v1/media/images",
        files={
            "file": (
                "photo.png",
                _image_bytes(),
                "image/png",
            )
        },
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 403


def test_image_upload_success(client, monkeypatch, tmp_path):
    monkeypatch.setattr(
        storage.settings,
        "storage_backend",
        "local",
        raising=False,
    )
    monkeypatch.setattr(
        storage.settings,
        "storage_local_dir",
        str(tmp_path),
        raising=False,
    )

    csrf = _login(client)

    response = client.post(
        "/api/v1/media/images",
        files={
            "file": (
                "photo.png",
                _image_bytes(),
                "image/png",
            )
        },
        headers={
            "X-CSRF-Token": csrf,
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 201

    body = response.json()

    assert body["storage_key"].startswith("images/")
    assert body["storage_key"].endswith(".jpg")
    assert body["original_size_bytes"] > 0
    assert body["compressed_size_bytes"] > 0

    stored_path = local_file(body["storage_key"])
    assert stored_path.is_file()


def test_private_document_with_auth(client, monkeypatch, tmp_path):
    monkeypatch.setattr(
        storage.settings,
        "storage_backend",
        "local",
        raising=False,
    )
    monkeypatch.setattr(
        storage.settings,
        "storage_local_dir",
        str(tmp_path),
        raising=False,
    )

    key = "documents/private-test.pdf"
    path = tmp_path / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_pdf_bytes())

    _login(client)

    response = client.get(
        f"/api/v1/media/documents/{Path(key).name}",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 200
    assert response.content == _pdf_bytes()
    assert response.headers["cache-control"] == "private, no-store"