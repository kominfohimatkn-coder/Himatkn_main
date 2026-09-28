from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.database.dependencies import (
    require_csrf,
    require_permission,
)
from app.models import Admin
from app.services.storage import (
    private_document_response,
    public_image_response,
    save_image,
)

router = APIRouter(
    prefix="/media",
    tags=["media"],
)


def _validate_key(filename: str, prefix: str) -> str:
    """
    Validate a public filename and convert it to a storage key.

    Example:
        filename = "abc.jpg"
        prefix = "images/"
        returns "images/abc.jpg"
    """
    if not filename:
        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan",
        )

    if "\x00" in filename or "\\" in filename:
        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan",
        )

    path = Path(filename)

    # Public media URLs must not contain nested paths.
    if path.is_absolute() or path.name != filename:
        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan",
        )

    if filename in {".", ".."} or ".." in path.parts:
        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan",
        )

    return f"{prefix}{filename}"


@router.get("/images/{filename:path}")
def public_image(filename: str):
    key = _validate_key(filename, "images/")
    response = public_image_response(key)

    if isinstance(response, Path):
        return FileResponse(
            response,
            media_type="image/jpeg",
            headers={
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        )

    return response


@router.post(
    "/images",
    status_code=201,
    dependencies=[Depends(require_csrf)],
)
async def upload_image(
    file: UploadFile = File(...),
    _: Admin = Depends(require_permission("media.manage")),
):
    key, original_size, compressed_size = await save_image(file)

    return {
        "storage_key": key,
        "original_size_bytes": original_size,
        "compressed_size_bytes": compressed_size,
    }

@router.get("/documents/{filename:path}")
def private_document(
    filename: str,
    _: Admin = Depends(require_permission("documents.view")),
):
    key = _validate_key(filename, "documents/")
    response = private_document_response(key)

    if isinstance(response, Path):
        return FileResponse(
            response,
            media_type="application/pdf",
            headers={
                "Cache-Control": "private, no-store",
            },
        )

    return response