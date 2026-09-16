import io
from pathlib import Path
import pytest
from PIL import Image
from fastapi import UploadFile
from app.services.storage import save_image, local_file, _safe_local_path

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
