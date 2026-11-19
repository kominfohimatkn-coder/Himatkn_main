from __future__ import annotations

import html
import re
from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.rate_limit import limiter
from app.database.connection import get_db
from app.models import (
    Division,
    Member,
    News,
    NewsTag,
    Period,
    Position,
    Program,
    Tag,
    VisitorLog,
)
from app.schemas.content import PROGRAM_STATUSES
from app.services.site_settings import (
    media_image_path,
    resolve_public_settings,
)


router = APIRouter(
    prefix="/public",
    tags=["public"],
)

PUBLIC_LIMIT = 50
NEWS_EXCERPT_LENGTH = 160

_TAG_PATTERN = re.compile(r"<[^>]+>")
_WHITESPACE_PATTERN = re.compile(r"\s+")


def _image_url(storage_key: str | None) -> str | None:
    if not storage_key:
        return None

    return media_image_path(storage_key)


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


def _public_photo_url(value: str | None) -> str | None:
    """Normalize a member photo to the public media contract.

    Storage keys (``images/...``) become media paths, absolute ``https``
    URLs are kept, and anything else is hidden.
    """

    if not value:
        return None

    candidate = value.strip()

    if candidate.startswith("https://"):
        return candidate

    if candidate.startswith("images/"):
        return _image_url(candidate)

    return None


def _excerpt(content: str | None, limit: int = NEWS_EXCERPT_LENGTH) -> str:
    if not content:
        return ""

    text = _TAG_PATTERN.sub(" ", content)
    text = html.unescape(text)
    text = _WHITESPACE_PATTERN.sub(" ", text).strip()

    if len(text) <= limit:
        return text

    cut = text[:limit]
    boundary = cut.rfind(" ")

    if boundary > 0:
        cut = cut[:boundary]

    return cut.rstrip(" \t,.;:-") + "…"


def _tags_by_news(
    db: Session,
    news_ids: list[int],
) -> dict[int, list[dict]]:
    if not news_ids:
        return {}

    rows = db.execute(
        select(NewsTag.news_id, Tag.id, Tag.name, Tag.slug)
        .join(Tag, Tag.id == NewsTag.tag_id)
        .where(NewsTag.news_id.in_(news_ids))
        .order_by(Tag.name.asc(), Tag.id.asc())
    ).all()

    grouped: dict[int, list[dict]] = {}

    for row in rows:
        grouped.setdefault(row.news_id, []).append(
            {
                "id": row.id,
                "name": row.name,
                "slug": row.slug,
            }
        )

    return grouped


def news_item(
    news: News,
    *,
    include_content: bool = False,
    include_excerpt: bool = True,
    tags: list[dict] | None = None,
) -> dict:
    item = {
        "id": news.id,
        "title": news.title,
        "slug": news.slug,
        "featured_image": _image_url(news.featured_image),
        "published_at": news.published_at,
        "tags": tags or [],
        "images": [
            _image_item(image)
            for image in sorted(
                news.images,
                key=lambda image: (image.sort_order, image.id),
            )
        ],
    }

    if include_excerpt:
        item["excerpt"] = _excerpt(news.content)

    if include_content:
        item["content"] = news.content

    return item


def _escape_like(term: str) -> str:
    return (
        term.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


@router.get("/news")
def public_news(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=PUBLIC_LIMIT),
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    conditions = [News.status == "published"]

    if q is not None:
        term = q.strip()

        if len(term) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Kata kunci pencarian minimal 2 karakter",
            )

        conditions.append(
            News.title.ilike(
                f"%{_escape_like(term)}%",
                escape="\\",
            )
        )

    total = db.scalar(
        select(func.count()).select_from(News).where(*conditions)
    )

    statement = (
        select(News)
        .options(selectinload(News.images))
        .where(*conditions)
        .order_by(
            News.published_at.desc(),
            News.created_at.desc(),
            News.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    rows = db.scalars(statement).unique().all()
    tags = _tags_by_news(db, [row.id for row in rows])

    return {
        "items": [
            news_item(
                row,
                include_content=False,
                tags=tags.get(row.id, []),
            )
            for row in rows
        ],
        "total": total or 0,
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

    tags = _tags_by_news(db, [news.id])

    return news_item(
        news,
        include_content=True,
        include_excerpt=False,
        tags=tags.get(news.id, []),
    )


def _program_item(
    program: Program,
    division: Division | None,
    period: Period,
) -> dict:
    return {
        "id": program.id,
        "name": program.name,
        "slug": program.slug,
        "description": program.description,
        "status": program.status,
        "start_date": program.start_date,
        "end_date": program.end_date,
        "division": (
            {
                "id": division.id,
                "name": division.name,
            }
            if division is not None
            else None
        ),
        "period": {
            "id": period.id,
            "name": period.name,
        },
    }


def _parse_program_statuses(
    raw_values: list[str] | None,
) -> list[str]:
    if not raw_values:
        return []

    statuses: list[str] = []

    for raw_value in raw_values:
        for part in raw_value.split(","):
            value = part.strip().lower()

            if not value or value not in PROGRAM_STATUSES:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Status program tidak valid",
                )

            if value not in statuses:
                statuses.append(value)

    return statuses


def _active_period(db: Session) -> Period | None:
    return db.scalar(
        select(Period)
        .where(Period.is_active.is_(True))
        .order_by(Period.start_date.desc(), Period.id.desc())
    )


def _program_conditions(
    *,
    period_id: int,
    statuses: list[str],
    division_id: int | None,
) -> list:
    conditions = [Program.period_id == period_id]

    if statuses:
        conditions.append(Program.status.in_(statuses))

    if division_id is not None:
        conditions.append(Program.division_id == division_id)

    return conditions


@router.get("/programs")
def public_programs(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=PUBLIC_LIMIT),
    period_id: int | None = Query(default=None, ge=1),
    status_filter: list[str] | None = Query(
        default=None,
        alias="status",
    ),
    division_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
):
    statuses = _parse_program_statuses(status_filter)

    period = (
        db.get(Period, period_id)
        if period_id is not None
        else _active_period(db)
    )

    if period is None:
        return {
            "items": [],
            "total": 0,
            "offset": offset,
            "limit": limit,
            "period": None,
        }

    conditions = _program_conditions(
        period_id=period.id,
        statuses=statuses,
        division_id=division_id,
    )

    total = db.scalar(
        select(func.count()).select_from(Program).where(*conditions)
    )

    rows = db.execute(
        select(Program, Division, Period)
        .join(Period, Period.id == Program.period_id)
        .outerjoin(Division, Division.id == Program.division_id)
        .where(*conditions)
        .order_by(
            Program.start_date.is_(None),
            Program.start_date.desc(),
            Program.created_at.desc(),
            Program.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "items": [
            _program_item(program, division, row_period)
            for program, division, row_period in rows
        ],
        "total": total or 0,
        "offset": offset,
        "limit": limit,
        "period": {
            "id": period.id,
            "name": period.name,
        },
    }


@router.get("/programs/{slug}")
def public_program_detail(
    slug: str,
    db: Session = Depends(get_db),
):
    row = db.execute(
        select(Program, Division, Period)
        .join(Period, Period.id == Program.period_id)
        .outerjoin(Division, Division.id == Program.division_id)
        .where(Program.slug == slug)
    ).first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program kerja tidak ditemukan",
        )

    return _program_item(*row)


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
                "sort_order": division.sort_order,
            }
            for division in divisions
        ],
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "division_id": member.division_id,
                "position_id": member.position_id,
                "photo_url": _public_photo_url(member.photo_url),
            }
            for member in members
        ],
        "positions": [
            {
                "id": position.id,
                "name": position.name,
                "sort_order": position.sort_order,
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

    values = resolve_public_settings(db)
    values["hero_image"] = _image_url(values.get("hero_image")) or ""

    return {"settings": values}


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
