import io
from pathlib import Path
import pytest
from PIL import Image
from fastapi import HTTPException, UploadFile
from app.services.storage import save_image, local_file, _safe_local_path

BLOB_BASE_URL = "https://demo.public.blob.vercel-storage.com"


class FakeBlobClient:
    def __init__(self):
        self.puts = []
        self.deletes = []
        self.delete_error = None

    def put_blob(self, pathname, body, **kwargs):
        self.puts.append((pathname, body, kwargs))

    def delete_blob(self, url):
        self.deletes.append(url)
        if self.delete_error is not None:
            raise self.delete_error


def _png_upload() -> UploadFile:
    buf = io.BytesIO()
    Image.new("RGB", (100, 100), "white").save(buf, "PNG")
    buf.seek(0)
    return UploadFile(
        filename="photo.png",
        file=buf,
        headers={"content-type": "image/png"},
    )


def _use_vercel_blob(monkeypatch, client=None):
    import app.services.storage as storage

    monkeypatch.setattr(storage.settings, "storage_backend", "vercel_blob", raising=False)
    monkeypatch.setattr(storage.settings, "blob_public_base_url", BLOB_BASE_URL, raising=False)
    monkeypatch.setattr(storage.settings, "blob_read_write_token", "", raising=False)
    fake = client or FakeBlobClient()
    monkeypatch.setattr(storage, "_blob_client", lambda: fake)
    return storage, fake

@pytest.mark.asyncio
async def test_image_compression(monkeypatch, tmp_path):
    import app.services.storage as storage
    monkeypatch.setattr(storage.settings, 'storage_local_dir', str(tmp_path), raising=False)
    img = Image.new('RGB', (3000, 2000), 'white')
    raw_buf = io.BytesIO(); img.save(raw_buf, 'PNG'); raw_buf.seek(0)
    upload = UploadFile(filename='photo.png', file=raw_buf, headers={'content-type':'image/png'})
    key, raw_size, compressed_size = await save_image(upload)
    path = local_file(key)
    with Image.open(path) as out:
        assert out.format == 'JPEG'
        assert out.width <= 2400 and out.height <= 2400
    assert compressed_size > 0 and raw_size > 0

@pytest.mark.asyncio
async def test_non_image_rejected():
    upload = UploadFile(filename='bad.txt', file=io.BytesIO(b'not image'), headers={'content-type':'text/plain'})
    with pytest.raises(Exception):
        await save_image(upload)

def test_path_traversal_rejected(tmp_path):
    with pytest.raises(Exception):
        _safe_local_path(Path(tmp_path), '../outside.txt')

@pytest.mark.asyncio
async def test_oversize_image_rejected(monkeypatch):
    import app.services.storage as storage
    monkeypatch.setattr(storage.settings,'max_upload_bytes',10,raising=False)
    upload=UploadFile(filename='x.jpg',file=io.BytesIO(b'01234567890'),headers={'content-type':'image/jpeg'})
    with pytest.raises(Exception): await save_image(upload)


@pytest.mark.asyncio
async def test_s3_image_upload(monkeypatch, tmp_path):
    import app.services.storage as storage
    monkeypatch.setattr(storage.settings, 'storage_backend', 's3', raising=False)
    monkeypatch.setattr(storage.settings, 's3_bucket', 'himatkn-test', raising=False)
    monkeypatch.setattr(storage.settings, 's3_access_key_id', 'key', raising=False)
    monkeypatch.setattr(storage.settings, 's3_secret_access_key', 'secret', raising=False)
    monkeypatch.setattr(storage.settings, 's3_region', 'auto', raising=False)
    calls = {}
    class FakeS3:
        def put_object(self, **kwargs):
            calls.update(kwargs)
    monkeypatch.setattr(storage, '_s3_client', lambda: FakeS3())
    buf = io.BytesIO(); Image.new('RGB', (100, 100), 'white').save(buf, 'PNG'); buf.seek(0)
    upload = UploadFile(filename='photo.png', file=buf, headers={'content-type': 'image/png'})
    key, original_size, compressed_size = await storage.save_image(upload)
    assert key.startswith('images/') and key.endswith('.jpg')
    assert calls['Bucket'] == 'himatkn-test'
    assert calls['ContentType'] == 'image/jpeg'
    assert compressed_size > 0 and original_size > 0


def test_public_path_traversal_rejected(monkeypatch):
    import app.services.storage as storage
    with pytest.raises(Exception):
        storage._safe_local_path(Path('.'), 'images/../secret.txt')


@pytest.mark.asyncio
async def test_vercel_blob_image_upload(monkeypatch):
    storage, fake = _use_vercel_blob(monkeypatch)

    key, original_size, compressed_size = await storage.save_image(_png_upload())

    assert key.startswith("images/") and key.endswith(".jpg")
    assert len(fake.puts) == 1

    pathname, body, kwargs = fake.puts[0]
    assert pathname == key
    assert kwargs["access"] == "public"
    assert kwargs["add_random_suffix"] is False
    assert kwargs["content_type"] == "image/jpeg"
    assert kwargs["cache_control_max_age"] == 31_536_000
    assert body.startswith(b"\xff\xd8")
    assert compressed_size > 0 and original_size > 0


def test_vercel_blob_public_image_redirect(monkeypatch):
    storage, _ = _use_vercel_blob(monkeypatch)

    response = storage.public_image_response("images/abc123.jpg")

    assert response.status_code == 307
    assert response.headers["location"] == f"{BLOB_BASE_URL}/images/abc123.jpg"


def test_vercel_blob_public_image_requires_base_url(monkeypatch):
    storage, _ = _use_vercel_blob(monkeypatch)
    monkeypatch.setattr(storage.settings, "blob_public_base_url", "", raising=False)

    with pytest.raises(HTTPException) as exc_info:
        storage.public_image_response("images/abc123.jpg")

    assert exc_info.value.status_code == 503


@pytest.mark.parametrize(
    "key",
    [
        "images/../secret.jpg",
        "images/Photo.JPG",
        "images/photo.jpg.php",
        "images/photo",
    ],
)
def test_vercel_blob_public_image_rejects_invalid_key(monkeypatch, key):
    storage, fake = _use_vercel_blob(monkeypatch)

    with pytest.raises(HTTPException) as exc_info:
        storage.public_image_response(key)

    assert exc_info.value.status_code == 400
    assert fake.puts == [] and fake.deletes == []


def test_vercel_blob_delete_uses_public_url(monkeypatch):
    storage, fake = _use_vercel_blob(monkeypatch)

    storage.delete_file("images/abc123.jpg")

    assert fake.deletes == [f"{BLOB_BASE_URL}/images/abc123.jpg"]


def test_vercel_blob_delete_missing_blob_is_ignored(monkeypatch):
    storage, fake = _use_vercel_blob(monkeypatch)
    fake.delete_error = FileNotFoundError("already gone")

    storage.delete_file("images/abc123.jpg")

    assert fake.deletes == [f"{BLOB_BASE_URL}/images/abc123.jpg"]


def test_vercel_blob_delete_error_returns_502(monkeypatch):
    storage, fake = _use_vercel_blob(monkeypatch)
    fake.delete_error = RuntimeError("sdk failure")

    with pytest.raises(HTTPException) as exc_info:
        storage.delete_file("images/abc123.jpg")

    assert exc_info.value.status_code == 502


@pytest.mark.asyncio
async def test_vercel_blob_document_upload_is_unsupported(monkeypatch):
    storage, fake = _use_vercel_blob(monkeypatch)
    upload = UploadFile(
        filename="document.pdf",
        file=io.BytesIO(b"%PDF-1.4\n%test\n"),
        headers={"content-type": "application/pdf"},
    )

    with pytest.raises(HTTPException) as exc_info:
        await storage.save_document(upload)

    assert exc_info.value.status_code == 503
    assert "Dokumen belum didukung" in exc_info.value.detail
    assert fake.puts == []


def test_vercel_blob_private_document_is_unsupported(monkeypatch):
    storage, _ = _use_vercel_blob(monkeypatch)

    with pytest.raises(HTTPException) as exc_info:
        storage.private_document_response("documents/abc123.pdf")

    assert exc_info.value.status_code == 503
    assert "Dokumen belum didukung" in exc_info.value.detail
