from __future__ import annotations

import os
import re
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from fastapi.responses import RedirectResponse
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings

ALLOWED_IMAGE_MIME = {
    "image/jpeg": "jpg",
    "image/png": "jpg",
    "image/webp": "jpg",
}
ALLOWED_DOCUMENT_MIME = {"application/pdf": "pdf"}
_BLOB_IMAGE_CACHE_MAX_AGE = 31_536_000
_BLOB_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
_SAFE_KEY = re.compile(r"^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$")


def _safe_local_path(root: Path, key: str) -> Path:
    if not key or not _SAFE_KEY.fullmatch(key) or ".." in Path(key).parts:
        raise HTTPException(status_code=400, detail="Path file tidak valid")
    root = root.resolve()
    target = (root / key).resolve()
    if target != root and root not in target.parents:
        raise HTTPException(status_code=400, detail="Path file tidak valid")
    return target


def _s3_client():
    import boto3

    kwargs = {
        "aws_access_key_id": settings.s3_access_key_id,
        "aws_secret_access_key": settings.s3_secret_access_key,
        "region_name": settings.s3_region,
    }
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url
    return boto3.client("s3", **kwargs)


def _public_url(key: str) -> str | None:
    if not settings.s3_public_base_url:
        return None
    return f"{settings.s3_public_base_url.rstrip('/')}/{key}"


def _validate_s3_configuration() -> None:
    if not settings.s3_bucket or not settings.s3_access_key_id or not settings.s3_secret_access_key:
        raise HTTPException(status_code=503, detail="Object storage belum dikonfigurasi")


def _blob_client():
    from vercel.blob import sync as blob_sync

    return blob_sync


def _ensure_blob_token_env() -> None:
    """Expose the configured token to the SDK, which reads it from the env."""
    token = settings.blob_read_write_token.strip()
    if token and not os.environ.get("BLOB_READ_WRITE_TOKEN"):
        os.environ["BLOB_READ_WRITE_TOKEN"] = token


def _blob_public_base_url() -> str | None:
    base_url = settings.blob_public_base_url.strip().rstrip("/")
    return base_url or None


def _validate_blob_key(key: str) -> str:
    if not key or not _SAFE_KEY.fullmatch(key) or ".." in Path(key).parts:
        raise HTTPException(status_code=400, detail="Path file tidak valid")
    return key


def _validate_blob_image_key(key: str) -> str:
    _validate_blob_key(key)
    extension = key.rsplit(".", 1)[-1]
    if extension not in _BLOB_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Path file tidak valid")
    return key


def _save_blob(key: str, data: bytes, content_type: str) -> None:
    _validate_blob_key(key)
    _ensure_blob_token_env()
    try:
        _blob_client().put_blob(
            key,
            data,
            access="public",
            content_type=content_type,
            add_random_suffix=False,
            cache_control_max_age=(
                _BLOB_IMAGE_CACHE_MAX_AGE if key.startswith("images/") else None
            ),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Penyimpanan file tidak tersedia") from exc


def _save_local(key: str, data: bytes) -> None:
    target = _safe_local_path(Path(settings.storage_local_dir), key)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)


def _save_s3(key: str, data: bytes, content_type: str) -> None:
    _validate_s3_configuration()
    try:
        _s3_client().put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable" if key.startswith("images/") else "private, max-age=0, no-cache",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Penyimpanan file tidak tersedia") from exc


def _store(key: str, data: bytes, content_type: str) -> None:
    if settings.storage_backend == "local":
        _save_local(key, data)
        return
    if settings.storage_backend == "s3":
        _save_s3(key, data, content_type)
        return
    if settings.storage_backend == "vercel_blob":
        _save_blob(key, data, content_type)
        return
    raise HTTPException(status_code=503, detail="Backend penyimpanan tidak didukung")


def _image_to_jpeg(raw: bytes) -> bytes:
    try:
        with Image.open(BytesIO(raw)) as probe:
            probe.verify()
        with Image.open(BytesIO(raw)) as image:
            image = ImageOps.exif_transpose(image)
            if image.width < 1 or image.height < 1:
                raise HTTPException(status_code=400, detail="Dimensi gambar tidak valid")
            image.thumbnail(
                (settings.max_image_width, settings.max_image_height),
                Image.Resampling.LANCZOS,
            )
            if "A" in image.getbands():
                background = Image.new("RGB", image.size, "white")
                background.paste(image, mask=image.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")
            output = BytesIO()
            image.save(
                output,
                format="JPEG",
                quality=settings.image_jpeg_quality,
                optimize=True,
                progressive=True,
            )
            return output.getvalue()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid") from exc


async def save_image(upload: UploadFile) -> tuple[str, int, int]:
    raw = await upload.read(settings.max_upload_bytes + 1)
    original_size = len(raw)
    if original_size > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Ukuran gambar terlalu besar")

    mime = (upload.content_type or "").lower()
    if mime not in ALLOWED_IMAGE_MIME:
        raise HTTPException(status_code=400, detail="Format gambar tidak diizinkan")

    data = _image_to_jpeg(raw)
    key = f"images/{uuid4().hex}.jpg"
    _store(key, data, "image/jpeg")
    return key, original_size, len(data)


async def save_document(upload: UploadFile) -> tuple[str, int]:
    if settings.storage_backend == "vercel_blob":
        raise HTTPException(
            status_code=503,
            detail="Dokumen belum didukung pada penyimpanan ini",
        )

    raw = await upload.read(settings.max_upload_bytes + 1)
    size = len(raw)
    if size > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Ukuran dokumen terlalu besar")
    if (upload.content_type or "").lower() not in ALLOWED_DOCUMENT_MIME:
        raise HTTPException(status_code=400, detail="Dokumen harus berupa PDF")
    if not raw.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Dokumen PDF tidak valid")

    key = f"documents/{uuid4().hex}.pdf"
    _store(key, raw, "application/pdf")
    return key, size


def local_file(key: str) -> Path:
    if settings.storage_backend != "local":
        raise HTTPException(status_code=404, detail="File tidak tersedia melalui local storage")
    return _safe_local_path(Path(settings.storage_local_dir), key)


def public_image_response(key: str):
    if settings.storage_backend == "local":
        path = local_file(key)
        if not path.is_file():
            raise HTTPException(status_code=404, detail="File tidak ditemukan")
        return path
    if settings.storage_backend == "s3":
        url = _public_url(key)
        if url:
            return RedirectResponse(url, status_code=307)
        raise HTTPException(status_code=503, detail="URL public object storage belum dikonfigurasi")
    if settings.storage_backend == "vercel_blob":
        _validate_blob_image_key(key)
        base_url = _blob_public_base_url()
        if not base_url:
            raise HTTPException(
                status_code=503,
                detail="URL public object storage belum dikonfigurasi",
            )
        return RedirectResponse(f"{base_url}/{key}", status_code=307)
    raise HTTPException(status_code=503, detail="Backend penyimpanan tidak didukung")


def private_document_response(key: str):
    if settings.storage_backend == "local":
        path = local_file(key)
        if not path.is_file():
            raise HTTPException(status_code=404, detail="File tidak ditemukan")
        return path
    if settings.storage_backend == "s3":
        _validate_s3_configuration()
        try:
            url = _s3_client().generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.s3_bucket, "Key": key},
                ExpiresIn=300,
            )
        except Exception as exc:
            raise HTTPException(status_code=502, detail="URL dokumen tidak dapat dibuat") from exc
        return RedirectResponse(url, status_code=307)
    if settings.storage_backend == "vercel_blob":
        raise HTTPException(
            status_code=503,
            detail="Dokumen belum didukung pada penyimpanan ini",
        )
    raise HTTPException(status_code=503, detail="Backend penyimpanan tidak didukung")


def delete_file(key: str | None) -> None:
    if not key:
        return
    if settings.storage_backend == "local":
        path = local_file(key)
        if path.exists():
            path.unlink()
        return
    if settings.storage_backend == "s3":
        _validate_s3_configuration()
        try:
            _s3_client().delete_object(Bucket=settings.s3_bucket, Key=key)
        except Exception as exc:
            raise HTTPException(status_code=502, detail="File tidak dapat dihapus") from exc
        return
    if settings.storage_backend == "vercel_blob":
        _validate_blob_key(key)
        base_url = _blob_public_base_url()
        if not base_url:
            raise HTTPException(
                status_code=503,
                detail="URL public object storage belum dikonfigurasi",
            )
        _ensure_blob_token_env()
        try:
            _blob_client().delete_blob(f"{base_url}/{key}")
        except FileNotFoundError:
            return
        except Exception as exc:
            if getattr(exc, "status_code", None) == 404:
                return
            raise HTTPException(status_code=502, detail="File tidak dapat dihapus") from exc
