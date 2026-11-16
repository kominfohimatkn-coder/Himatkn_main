from __future__ import annotations

from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.rate_limit import limiter
from app.database.connection import get_db
from app.models import (
    Division,
    Member,
    News,
    Period,
    Position,
    Program,
    VisitorLog,
)
from app.services.site_settings import resolve_public_settings


router = APIRouter(
    prefix="/public",
    tags=["public"],
)

PUBLIC_LIMIT = 50


def _image_url(storage_key: str | None) -> str | None:
    if not storage_key:
        return None

    if storage_key.startswith("images/"):
        return f"/api/v1/media/{storage_key}"

    return f"/api/v1/media/images/{storage_key}"


def _image_item(image) -> dict:
    return {
        "id": image.id,
        "news_id": image.news_id,
        "storage_key": image.storage_key,
        "url": _image_url(image.storage_key),
        "caption": image.caption,
        "sort_order": image.sort_order,
        "created_at": image.created_at,
    }


def news_item(news: News, *, include_content: bool = False) -> dict:
    item = {
        "id": news.id,
        "title": news.title,
        "slug": news.slug,
        "featured_image": _image_url(news.featured_image),
        "published_at": news.published_at,
        "images": [
            _image_item(image)
            for image in sorted(
                news.images,
                key=lambda image: (image.sort_order, image.id),
            )
        ],
    }

    if include_content:
        item["content"] = news.content

    return item


@router.get("/news")
def public_news(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=PUBLIC_LIMIT),
    db: Session = Depends(get_db),
):
    statement = (
        select(News)
        .options(selectinload(News.images))
        .where(News.status == "published")
        .order_by(
            News.published_at.desc(),
            News.created_at.desc(),
            News.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    rows = db.scalars(statement).unique().all()

    return {
        "items": [news_item(row, include_content=False) for row in rows],
        "offset": offset,
        "limit": limit,
    }


@router.get("/news/{slug}")
def public_news_detail(
    slug: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(News)
        .options(selectinload(News.images))
        .where(
            News.slug == slug,
            News.status == "published",
        )
    )

    news = db.scalar(statement)

    if news is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publikasi tidak ditemukan",
        )

    return news_item(news, include_content=True)


@router.get("/programs")
def public_programs(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=PUBLIC_LIMIT),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(Program)
        .order_by(
            Program.created_at.desc(),
            Program.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "items": [
            {
                "id": row.id,
                "name": row.name,
                "slug": row.slug,
                "description": row.description,
                "status": row.status,
                "start_date": row.start_date,
                "end_date": row.end_date,
            }
            for row in rows
        ],
        "offset": offset,
        "limit": limit,
    }


@router.get("/organization")
def public_org(
    db: Session = Depends(get_db),
):
    period = db.scalar(
        select(Period)
        .where(Period.is_active.is_(True))
        .order_by(Period.start_date.desc(), Period.id.desc())
    )

    if not period:
        return {
            "period": None,
            "divisions": [],
            "members": [],
            "positions": [],
        }

    divisions = db.scalars(
        select(Division)
        .where(Division.period_id == period.id)
        .order_by(
            Division.sort_order,
            Division.name,
            Division.id,
        )
    ).all()

    members = db.scalars(
        select(Member)
        .where(Member.period_id == period.id)
        .order_by(
            Member.sort_order,
            Member.name,
            Member.id,
        )
    ).all()

    positions = db.scalars(
        select(Position).order_by(
            Position.sort_order,
            Position.name,
            Position.id,
        )
    ).all()

    return {
        "period": {
            "id": period.id,
            "name": period.name,
        },
        "divisions": [
            {
                "id": division.id,
                "name": division.name,
                "description": division.description,
            }
            for division in divisions
        ],
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "division_id": member.division_id,
                "position_id": member.position_id,
                "photo_url": member.photo_url,
            }
            for member in members
        ],
        "positions": [
            {
                "id": position.id,
                "name": position.name,
            }
            for position in positions
        ],
    }


@router.get("/settings")
async def public_settings(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    client_ip = limiter.client_ip(request)

    allowed, retry_after = await limiter.allow(
        f"read:public-settings:{client_ip}",
        settings.general_read_limit,
        settings.general_read_window_seconds,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak permintaan.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(settings.general_read_limit),
            },
        )

    response.headers["Cache-Control"] = "public, max-age=60"

    return {"settings": resolve_public_settings(db)}


@router.post("/visits", status_code=status.HTTP_201_CREATED)
async def visit(
    request: Request,
    page: str = Query(min_length=1, max_length=500),
    db: Session = Depends(get_db),
):
    client_ip = limiter.client_ip(request)

    allowed, retry_after = await limiter.allow(
        f"public-visit:{client_ip}",
        settings.general_write_limit,
        settings.general_write_window_seconds,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak permintaan.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(settings.general_write_limit),
            },
        )

    user_agent = request.headers.get("user-agent", "")
    visitor_hash = sha256(
        f"{client_ip}:{user_agent}".encode("utf-8")
    ).hexdigest()

    db.add(
        VisitorLog(
            page=page.strip(),
            visitor_hash=visitor_hash,
            user_agent=user_agent[:500],
        )
    )
    db.commit()

    return {"status": "ok"}
