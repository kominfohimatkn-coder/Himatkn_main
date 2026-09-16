from __future__ import annotations

from sqlalchemy import select
from fastapi.testclient import TestClient

from app.main import app
from app.models import Document
from app.database.connection import SessionLocal
from app.routers import documents as documents_router
from app.services import storage


def _login(client) -> str:
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


def _pdf_bytes() -> bytes:
    return b"%PDF-1.4\n%test document\n"


def test_document_upload_lifecycle(client, tmp_path, monkeypatch):
    monkeypatch.setattr(
        storage.settings,
        "storage_local_dir",
        str(tmp_path),
        raising=False,
    )

    csrf = _login(client)
    response = client.post(
        "/api/v1/admin/documents",
        data={
            "title": "Dokumen Regression",
            "category": "Umum",
        },
        files={
            "file": (
                "document.pdf",
                _pdf_bytes(),
                "application/pdf",
            )
        },
        headers={
            "X-CSRF-Token": csrf,
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Dokumen Regression"
    assert body["storage_key"].startswith("documents/")
    assert body["size_bytes"] > 0

    listing = client.get(
        "/api/v1/admin/documents",
        headers={"Origin": "http://localhost:3000"},
    )
    assert listing.status_code == 200
    item = next(
        x for x in listing.json()["items"] if x["id"] == body["id"]
    )
    assert item["original_filename"] == "document.pdf"
    assert item["mime_type"] == "application/pdf"
    assert item["category"] == "Umum"


def test_document_upload_requires_csrf(client):
    _login(client)

    response = client.post(
        "/api/v1/admin/documents",
        data={"title": "Tanpa CSRF"},
        files={
            "file": (
                "document.pdf",
                _pdf_bytes(),
                "application/pdf",
            )
        },
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 403


def test_document_upload_rejects_invalid_file(client):
    csrf = _login(client)

    response = client.post(
        "/api/v1/admin/documents",
        data={"title": "File Invalid"},
        files={
            "file": (
                "document.txt",
                b"not a real pdf",
                "text/plain",
            )
        },
        headers={
            "X-CSRF-Token": csrf,
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code in {400, 415, 422}


def test_document_upload_rolls_back_and_deletes_file_on_db_failure(
    client,
    monkeypatch,
    tmp_path,
):
    csrf = _login(client)

    stored = {}
    deleted = []

    async def fake_save_document(upload):
        storage_dir = tmp_path / "documents"
        storage_dir.mkdir(parents=True, exist_ok=True)
        key = "documents/test-orphan.pdf"
        path = storage_dir / "test-orphan.pdf"
        path.write_bytes(await upload.read())
        stored["key"] = key
        stored["path"] = path
        return key, path.stat().st_size

    def fake_delete_file(key):
        deleted.append(key)
        path = stored.get("path")
        if path and path.exists():
            path.unlink()

    monkeypatch.setattr(
        documents_router,
        "save_document",
        fake_save_document,
    )
    monkeypatch.setattr(
        documents_router,
        "delete_file",
        fake_delete_file,
    )

    from sqlalchemy.orm import Session

    original_commit = Session.commit

    def failing_commit(self):
        raise RuntimeError("simulated database failure")

    monkeypatch.setattr(Session, "commit", failing_commit)

    test_client = TestClient(app, raise_server_exceptions=False)
    test_client.cookies.update(client.cookies)

    response = test_client.post(
        "/api/v1/admin/documents",
        data={"title": "Orphan Test"},
        files={
            "file": (
                "orphan.pdf",
                _pdf_bytes(),
                "application/pdf",
            )
        },
        headers={
            "X-CSRF-Token": csrf,
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 500
    assert stored["key"] in deleted
    assert not stored["path"].exists()

    monkeypatch.setattr(Session, "commit", original_commit)

    with SessionLocal() as db:
        exists = db.scalar(
            select(Document.id).where(
                Document.title == "Orphan Test"
            )
        )
        assert exists is None
