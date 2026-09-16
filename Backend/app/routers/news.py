from __future__ import annotations

from datetime import datetime, UTC
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.database.connection import get_db
from app.database.dependencies import require_csrf, require_permission
from app.models import Admin, News, NewsImage, Tag, NewsTag
from app.services.audit import log_activity
from app.services.storage import delete_file, save_image
from app.utils.slug import slugify

router = APIRouter(
    prefix="/admin/news",
    tags=["admin-news"],
)


# =========================================================
# Helpers
# =========================================================

VALID_STATUSES = {"draft", "published", "archived"}

def _image_url(storage_key: str | None) -> str | None:
    if not storage_key:
        return None

    if storage_key.startswith("images/"):
        return f"/api/v1/media/{storage_key}"

    return f"/api/v1/media/images/{storage_key}"

def _image_item(image: NewsImage) -> dict:
    return {
        "id": image.id,
        "news_id": image.news_id,
        "storage_key": image.storage_key,
        "url": _image_url(image.storage_key),
        "caption": image.caption,
        "sort_order": image.sort_order,
        "created_at": image.created_at,
    }


def _tags_for_news(
    db: Session,
    news_id: int,
) -> list[dict]:
    rows = db.execute(
        select(Tag.id, Tag.name, Tag.slug)
        .join(NewsTag, NewsTag.tag_id == Tag.id)
        .where(NewsTag.news_id == news_id)
        .order_by(Tag.name.asc(), Tag.id.asc())
    ).all()

    return [
        {
            "id": row.id,
            "name": row.name,
            "slug": row.slug,
        }
        for row in rows
    ]


def _item(
    news: News,
    *,
    tags: list[dict] | None = None,
) -> dict:
    return {
        "id": news.id,
        "author_id": news.author_id,
        "title": news.title,
        "slug": news.slug,
        "content": news.content,
        "featured_image": _image_url(news.featured_image),
        "status": news.status,
        "published_at": news.published_at,
        "created_at": news.created_at,
        "updated_at": news.updated_at,
        "tags": tags or [],
        "images": [
            _image_item(image)
            for image in sorted(
                news.images,
                key=lambda item: (item.sort_order, item.id),
            )
        ],
    }


def _get_news(
    db: Session,
    news_id: int,
    *,
    with_images: bool = True,
) -> News:
    statement = select(News).where(News.id == news_id)

    if with_images:
        statement = statement.options(selectinload(News.images))

    news = db.scalar(statement)

    if news is None:
        raise HTTPException(
            status_code=404,
            detail="Publikasi tidak ditemukan",
        )

    return news


def _validate_status(value: str) -> str:
    normalized = value.strip().lower()

    if normalized not in VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Status publikasi tidak valid",
        )

    return normalized


def _resolve_slug(
    db: Session,
    value: str,
    *,
    exclude_id: int | None = None,
) -> str:
    slug = slugify(value.strip())

    if not slug:
        raise HTTPException(
            status_code=422,
            detail="Slug publikasi tidak valid",
        )

    statement = select(News.id).where(News.slug == slug)

    if exclude_id is not None:
        statement = statement.where(News.id != exclude_id)

    if db.scalar(statement) is not None:
        raise HTTPException(
            status_code=409,
            detail="Slug sudah digunakan",
        )

    return slug


def _normalize_caption(value: str | None) -> str | None:
    if value is None:
        return None

    value = value.strip()
    return value or None


def _sync_tags(
    db: Session,
    news_id: int,
    tag_ids: list[int],
) -> None:
    requested_ids = sorted(set(tag_ids))

    if requested_ids:
        existing_tags = db.scalars(
            select(Tag.id).where(Tag.id.in_(requested_ids))
        ).all()

        if len(existing_tags) != len(requested_ids):
            raise HTTPException(
                status_code=422,
                detail="Salah satu tag tidak ditemukan",
            )

    db.query(NewsTag).filter(
        NewsTag.news_id == news_id
    ).delete(synchronize_session=False)

    for tag_id in requested_ids:
        db.add(
            NewsTag(
                news_id=news_id,
                tag_id=tag_id,
            )
        )


# =========================================================
# Tags
# =========================================================

@router.get("/tags/list")
def list_tags(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("news.view")),
):
    rows = db.scalars(
        select(Tag).order_by(Tag.name.asc(), Tag.id.asc())
    ).all()

    return {
        "items": [
            {
                "id": tag.id,
                "name": tag.name,
                "slug": tag.slug,
            }
            for tag in rows
        ]
    }


@router.post(
    "/tags",
    status_code=201,
    dependencies=[Depends(require_csrf)],
)
def create_tag(
    payload: dict,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("news.create")),
):
    name = str(payload.get("name", "")).strip()

    if not 2 <= len(name) <= 100:
        raise HTTPException(
            status_code=422,
            detail="Nama tag tidak valid",
        )

    slug = slugify(name)

    existing = db.scalar(
        select(Tag).where(
            (Tag.name == name)
            | (Tag.slug == slug)
        )
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Tag sudah digunakan",
        )

    item = Tag(
        name=name,
        slug=slug,
    )

    db.add(item)

    try:
        db.commit()
        db.refresh(item)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Tag sudah digunakan",
        ) from exc

    return {
        "id": item.id,
        "name": item.name,
        "slug": item.slug,
    }


# =========================================================
# News
# =========================================================

@router.get("")
def list_news(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("news.view")),
):
    statement = (
        select(News)
        .options(selectinload(News.images))
        .order_by(
            News.created_at.desc(),
            News.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    if status_filter is not None:
        statement = statement.where(
            News.status == _validate_status(status_filter)
        )

    rows = db.scalars(statement).unique().all()

    return {
        "items": [
            _item(
                row,
                tags=_tags_for_news(db, row.id),
            )
            for row in rows
        ],
        "offset": offset,
        "limit": limit,
    }


@router.post(
    "",
    status_code=201,
    dependencies=[Depends(require_csrf)],
)
def create_news(
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.create")),
):
    title = str(payload.get("title", "")).strip()
    content = str(payload.get("content", "")).strip()
    status_value = _validate_status(
        str(payload.get("status", "draft"))
    )

    if not 2 <= len(title) <= 255:
        raise HTTPException(
            status_code=422,
            detail="Judul publikasi tidak valid",
        )

    if not content:
        raise HTTPException(
            status_code=422,
            detail="Konten publikasi wajib diisi",
        )

    slug = _resolve_slug(
        db,
        str(payload.get("slug") or title),
    )

    tag_ids_raw = payload.get("tag_ids", [])
    if not isinstance(tag_ids_raw, list):
        raise HTTPException(
            status_code=422,
            detail="tag_ids harus berupa array",
        )

    try:
        tag_ids = [int(value) for value in tag_ids_raw]
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail="tag_ids tidak valid",
        ) from exc

    
    published_at = (
        datetime.now(UTC).replace(tzinfo=None)
        if status_value == "published"
        else None
    )

    item = News(
        author_id=admin.id,
        title=title,
        slug=slug,
        content=content,
        status=status_value,
        published_at=published_at,
    )

    db.add(item)

    try:
        db.flush()

        _sync_tags(
            db,
            item.id,
            tag_ids,
        )

        log_activity(
            db,
            admin.id,
            "news.create",
            "news",
            item.id,
            f"Membuat publikasi {item.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.commit()
        db.refresh(item)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Publikasi gagal disimpan karena data bertabrakan",
        ) from exc

    item = _get_news(
        db,
        item.id,
        with_images=True,
    )

    return _item(
        item,
        tags=_tags_for_news(db, item.id),
    )


@router.get("/{identifier}")
def detail(
    identifier: str,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("news.view")),
):
    statement = (
        select(News)
        .options(selectinload(News.images))
        .where(News.slug == identifier)
    )

    item = db.scalar(statement)

    if item is None and identifier.isdigit():
        item = db.scalar(
            select(News)
            .options(selectinload(News.images))
            .where(News.id == int(identifier))
        )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Publikasi tidak ditemukan",
        )

    return _item(
        item,
        tags=_tags_for_news(db, item.id),
    )


@router.put(
    "/{news_id}",
    dependencies=[Depends(require_csrf)],
)
def update_news(
    news_id: int,
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.update")),
):
    item = _get_news(
        db,
        news_id,
        with_images=True,
    )

    if "title" in payload:
        title = str(payload.get("title", "")).strip()

        if not 2 <= len(title) <= 255:
            raise HTTPException(
                status_code=422,
                detail="Judul publikasi tidak valid",
            )

        item.title = title

    if "content" in payload:
        content = str(payload.get("content", "")).strip()

        if not content:
            raise HTTPException(
                status_code=422,
                detail="Konten publikasi wajib diisi",
            )

        item.content = content

    if "slug" in payload:
        item.slug = _resolve_slug(
            db,
            str(payload.get("slug", "")),
            exclude_id=item.id,
        )

    if "status" in payload:
        item.status = _validate_status(
            str(payload.get("status", "draft"))
        )

        if (
            item.status == "published"
            and item.published_at is None
        ):
            item.published_at = datetime.now(UTC).replace(tzinfo=None)
        elif item.status != "published":
            item.published_at = None

    if "tag_ids" in payload:
        tag_ids_raw = payload.get("tag_ids")

        if not isinstance(tag_ids_raw, list):
            raise HTTPException(
                status_code=422,
                detail="tag_ids harus berupa array",
            )

        try:
            tag_ids = [int(value) for value in tag_ids_raw]
        except (TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=422,
                detail="tag_ids tidak valid",
            ) from exc

        _sync_tags(
            db,
            item.id,
            tag_ids,
        )

    try:
        log_activity(
            db,
            admin.id,
            "news.update",
            "news",
            item.id,
            f"Memperbarui publikasi {item.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.commit()
        db.refresh(item)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Publikasi gagal diperbarui karena data bertabrakan",
        ) from exc

    item = _get_news(
        db,
        item.id,
        with_images=True,
    )

    return _item(
        item,
        tags=_tags_for_news(db, item.id),
    )


@router.delete(
    "/{news_id}",
    status_code=204,
    dependencies=[Depends(require_csrf)],
)
def delete_news(
    news_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.delete")),
):
    item = _get_news(
        db,
        news_id,
        with_images=True,
    )

    featured_key = item.featured_image
    gallery_keys = [
        image.storage_key
        for image in item.images
        if image.storage_key
    ]

    try:
        log_activity(
            db,
            admin.id,
            "news.delete",
            "news",
            item.id,
            f"Menghapus publikasi {item.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.delete(item)
        db.commit()

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Publikasi tidak dapat dihapus",
        ) from exc

    delete_file(featured_key)

    for key in gallery_keys:
        delete_file(key)


# =========================================================
# News Gallery
# =========================================================

@router.post(
    "/{news_id}/images",
    status_code=201,
    dependencies=[Depends(require_csrf)],
)
async def add_news_image(
    news_id: int,
    request: Request,
    file: UploadFile = File(...),
    caption: str | None = Form(
        default=None,
        max_length=500,
    ),
    sort_order: int = Form(
        default=0,
        ge=0,
    ),
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.update")),
):
    news = _get_news(
        db,
        news_id,
        with_images=False,
    )

    storage_key: str | None = None

    try:
        storage_key, _, _ = await save_image(file)

        image = NewsImage(
            news_id=news.id,
            storage_key=storage_key,
            caption=_normalize_caption(caption),
            sort_order=sort_order,
        )

        db.add(image)
        db.flush()

        log_activity(
            db,
            admin.id,
            "news.image.create",
            "news_image",
            image.id,
            f"Menambahkan gambar pada publikasi {news.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.commit()
        db.refresh(image)

        return _image_item(image)

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


@router.put(
    "/{news_id}/images/{image_id}",
    dependencies=[Depends(require_csrf)],
)
def update_news_image(
    news_id: int,
    image_id: int,
    request: Request,
    caption: str | None = Form(
        default=None,
        max_length=500,
    ),
    sort_order: int | None = Form(
        default=None,
        ge=0,
    ),
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.update")),
):
    news = _get_news(
        db,
        news_id,
        with_images=False,
    )

    image = db.scalar(
        select(NewsImage).where(
            NewsImage.id == image_id,
            NewsImage.news_id == news.id,
        )
    )

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Gambar publikasi tidak ditemukan",
        )

    if caption is not None:
        image.caption = _normalize_caption(caption)

    if sort_order is not None:
        image.sort_order = sort_order

    try:
        log_activity(
            db,
            admin.id,
            "news.image.update",
            "news_image",
            image.id,
            f"Memperbarui gambar publikasi {news.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.commit()
        db.refresh(image)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Gambar publikasi gagal diperbarui",
        ) from exc

    return _image_item(image)


@router.delete(
    "/{news_id}/images/{image_id}",
    status_code=204,
    dependencies=[Depends(require_csrf)],
)
def delete_news_image(
    news_id: int,
    image_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("news.update")),
):
    news = _get_news(
        db,
        news_id,
        with_images=False,
    )

    image = db.scalar(
        select(NewsImage).where(
            NewsImage.id == image_id,
            NewsImage.news_id == news.id,
        )
    )

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Gambar publikasi tidak ditemukan",
        )

    storage_key = image.storage_key

    try:
        log_activity(
            db,
            admin.id,
            "news.image.delete",
            "news_image",
            image.id,
            f"Menghapus gambar publikasi {news.title}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )

        db.delete(image)
        db.commit()

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Gambar publikasi gagal dihapus",
        ) from exc

    delete_file(storage_key)