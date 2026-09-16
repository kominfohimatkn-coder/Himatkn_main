from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.dependencies import require_csrf, require_permission
from app.models import Admin, Document
from app.services.audit import log_activity
from app.services.storage import delete_file, save_document


router = APIRouter(
    prefix="/admin/documents",
    tags=["admin"],
)

MAX_LIST_LIMIT = 100


def _item(document: Document) -> dict:
    return {
        "id": document.id,
        "title": document.title,
        "category": document.category,
        "original_filename": document.original_filename,
        "mime_type": document.mime_type,
        "size_bytes": document.size_bytes,
        "created_at": document.created_at,
    }


@router.get("")
def list_documents(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=MAX_LIST_LIMIT),
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("documents.view")),
):
    rows = db.scalars(
        select(Document)
        .order_by(Document.created_at.desc(), Document.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "items": [_item(row) for row in rows],
        "offset": offset,
        "limit": limit,
    }


@router.post(
    "",
    status_code=201,
    dependencies=[Depends(require_csrf)],
)
async def create_document(
    request: Request,
    title: str = Form(..., max_length=255),
    category: str | None = Form(default=None, max_length=255),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("documents.manage")),
):
    normalized_title = title.strip()
    if len(normalized_title) < 2:
        raise HTTPException(
            status_code=422,
            detail="Judul dokumen tidak valid",
        )

    normalized_category = category.strip() if category else None
    normalized_category = normalized_category or None

    storage_key: str | None = None

    try:
        storage_key, size = await save_document(file)

        document = Document(
            uploaded_by=admin.id,
            title=normalized_title,
            category=normalized_category,
            storage_key=storage_key,
            original_filename=file.filename or "document.pdf",
            mime_type=file.content_type or "application/pdf",
            size_bytes=size,
        )

        db.add(document)
        db.flush()

        log_activity(
            db,
            admin.id,
            "document.create",
            "document",
            document.id,
            f"Mengunggah dokumen {document.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.commit()
        db.refresh(document)

        return {
            "id": document.id,
            "title": document.title,
            "storage_key": document.storage_key,
            "size_bytes": document.size_bytes,
        }

    except IntegrityError as exc:
        db.rollback()
        if storage_key:
            delete_file(storage_key)
        raise HTTPException(
            status_code=409,
            detail="Dokumen gagal disimpan karena data bertabrakan",
        ) from exc

    except HTTPException:
        db.rollback()
        if storage_key:
            delete_file(storage_key)
        raise

    except Exception:
        db.rollback()
        if storage_key:
            delete_file(storage_key)
        raise
