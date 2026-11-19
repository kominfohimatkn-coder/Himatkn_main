from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base, SessionLocal
from app.models import (
    Division,
    Member,
    News,
    NewsTag,
    Period,
    Permission,
    Position,
    Program,
    Role,
    RolePermission,
    Tag,
)
from app.services.site_settings import SETTINGS_REGISTRY

ORIGIN = "http://localhost:3000"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _period(
    name: str,
    *,
    start: date | None = None,
    end: date | None = None,
    active: bool = False,
) -> int:
    with SessionLocal() as db:
        period = Period(
            name=name,
            start_date=start,
            end_date=end,
            is_active=active,
        )
        db.add(period)
        db.commit()
        return period.id


def _division(period_id: int, name: str, sort_order: int = 0) -> int:
    with SessionLocal() as db:
        division = Division(
            period_id=period_id,
            name=name,
            sort_order=sort_order,
        )
        db.add(division)
        db.commit()
        return division.id


def _program(
    period_id: int,
    slug: str,
    *,
    name: str | None = None,
    status: str = "planned",
    division_id: int | None = None,
    start_date: date | None = None,
) -> int:
    with SessionLocal() as db:
        program = Program(
            period_id=period_id,
            division_id=division_id,
            name=name or slug,
            slug=slug,
            status=status,
            start_date=start_date,
        )
        db.add(program)
        db.commit()
        return program.id


def _news(
    slug: str,
    *,
    title: str | None = None,
    content: str = "Konten contoh.",
    status: str = "published",
    published_at: date | None = None,
) -> int:
    with SessionLocal() as db:
        news = News(
            title=title or slug,
            slug=slug,
            content=content,
            status=status,
            published_at=(
                datetime(
                    published_at.year,
                    published_at.month,
                    published_at.day,
                    9,
                    0,
                )
                if published_at
                else None
            ),
        )
        db.add(news)
        db.commit()
        return news.id


def _tag(name: str, slug: str) -> int:
    with SessionLocal() as db:
        tag = Tag(name=name, slug=slug)
        db.add(tag)
        db.commit()
        return tag.id


def _attach_tag(news_id: int, tag_id: int) -> None:
    with SessionLocal() as db:
        db.add(NewsTag(news_id=news_id, tag_id=tag_id))
        db.commit()


def login(client) -> dict[str, str]:
    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={"Origin": ORIGIN},
    )
    assert response.status_code == 200

    return {
        "Origin": ORIGIN,
        "X-CSRF-Token": client.cookies.get("himatkn_csrf"),
    }


# ---------------------------------------------------------------------------
# GET /public/programs
# ---------------------------------------------------------------------------


def test_program_list_filters_period_status_division_and_total(client):
    period_a = _period("TEST-PUB-PROG-A", start=date(2026, 1, 1), active=False)
    period_b = _period("TEST-PUB-PROG-B", start=date(2027, 1, 1), active=False)

    division_a = _division(period_a, "TEST-PUB-DIV-A")
    division_b = _division(period_b, "TEST-PUB-DIV-B")

    _program(
        period_a,
        "test-pub-prog-planned",
        name="Program Planned",
        status="planned",
        division_id=division_a,
        start_date=date(2026, 5, 1),
    )
    _program(
        period_a,
        "test-pub-prog-ongoing",
        name="Program Ongoing",
        status="ongoing",
        start_date=date(2026, 6, 1),
    )
    _program(
        period_a,
        "test-pub-prog-cancelled",
        name="Program Cancelled",
        status="cancelled",
        division_id=division_a,
        start_date=None,
    )
    _program(
        period_a,
        "test-pub-prog-completed",
        name="Program Completed",
        status="completed",
        division_id=division_a,
        start_date=date(2026, 4, 1),
    )
    _program(
        period_b,
        "test-pub-prog-other-period",
        name="Program Periode Lain",
        status="planned",
        division_id=division_b,
        start_date=date(2027, 7, 1),
    )

    response = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_a},
    )

    assert response.status_code == 200

    body = response.json()

    assert body["total"] == 4
    assert body["period"] == {
        "id": period_a,
        "name": "TEST-PUB-PROG-A",
    }
    assert [item["slug"] for item in body["items"]] == [
        "test-pub-prog-ongoing",
        "test-pub-prog-planned",
        "test-pub-prog-completed",
        "test-pub-prog-cancelled",
    ]

    planned = body["items"][1]

    assert planned["division"] == {
        "id": division_a,
        "name": "TEST-PUB-DIV-A",
    }
    assert planned["period"] == body["period"]
    assert body["items"][0]["division"] is None
    assert body["items"][3]["status"] == "cancelled"

    by_status = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_a, "status": "planned"},
    ).json()

    assert [item["slug"] for item in by_status["items"]] == [
        "test-pub-prog-planned"
    ]
    assert by_status["total"] == 1

    repeated = client.get(
        "/api/v1/public/programs",
        params=[
            ("period_id", period_a),
            ("status", "planned"),
            ("status", "cancelled"),
        ],
    ).json()

    assert {item["status"] for item in repeated["items"]} == {
        "planned",
        "cancelled",
    }
    assert repeated["total"] == 2

    comma = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_a, "status": "planned,cancelled"},
    ).json()

    assert comma["total"] == 2

    by_division = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_a, "division_id": division_a},
    ).json()

    assert {item["slug"] for item in by_division["items"]} == {
        "test-pub-prog-planned",
        "test-pub-prog-completed",
        "test-pub-prog-cancelled",
    }
    assert by_division["total"] == 3

    paged = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_a, "offset": 0, "limit": 1},
    ).json()

    assert paged["total"] == 4
    assert len(paged["items"]) == 1

    other = client.get(
        "/api/v1/public/programs",
        params={"period_id": period_b},
    ).json()

    assert [item["slug"] for item in other["items"]] == [
        "test-pub-prog-other-period"
    ]


def test_program_list_rejects_invalid_status(client):
    response = client.get(
        "/api/v1/public/programs",
        params={"status": "done"},
    )

    assert response.status_code == 422

    unknown = client.get(
        "/api/v1/public/programs",
        params={"status": "planned,unknown"},
    )

    assert unknown.status_code == 422


def test_program_list_defaults_to_active_period(client):
    period_id = _period(
        "TEST-PUB-PROG-ACTIVE",
        start=date(2097, 1, 1),
        active=True,
    )
    _program(
        period_id,
        "test-pub-prog-active-default",
        status="ongoing",
        start_date=date(2097, 2, 1),
    )

    response = client.get("/api/v1/public/programs")

    assert response.status_code == 200

    body = response.json()

    assert body["period"] == {
        "id": period_id,
        "name": "TEST-PUB-PROG-ACTIVE",
    }
    assert body["total"] == 1
    assert body["items"][0]["slug"] == "test-pub-prog-active-default"


def test_program_list_without_active_period_returns_empty(client):
    with SessionLocal() as db:
        previous = {
            period.id: period.is_active
            for period in db.scalars(select(Period)).all()
        }

        for period in db.scalars(select(Period)).all():
            period.is_active = False

        db.commit()

    try:
        response = client.get("/api/v1/public/programs")

        assert response.status_code == 200
        assert response.json() == {
            "items": [],
            "total": 0,
            "offset": 0,
            "limit": 20,
            "period": None,
        }
    finally:
        with SessionLocal() as db:
            for period in db.scalars(select(Period)).all():
                period.is_active = previous.get(period.id, False)

            db.commit()


def test_program_detail_and_404(client):
    period_id = _period("TEST-PUB-PROG-DETAIL", start=date(2026, 3, 1))
    division_id = _division(period_id, "TEST-PUB-DIV-DETAIL")

    _program(
        period_id,
        "test-pub-prog-detail",
        name="Program Detail",
        status="completed",
        division_id=division_id,
        start_date=date(2026, 3, 2),
    )

    response = client.get(
        "/api/v1/public/programs/test-pub-prog-detail"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["slug"] == "test-pub-prog-detail"
    assert body["status"] == "completed"
    assert body["division"] == {
        "id": division_id,
        "name": "TEST-PUB-DIV-DETAIL",
    }
    assert body["period"]["id"] == period_id

    missing = client.get("/api/v1/public/programs/tidak-ada-program")

    assert missing.status_code == 404
    assert missing.json()["detail"] == "Program kerja tidak ditemukan"


# ---------------------------------------------------------------------------
# Admin program status validation
# ---------------------------------------------------------------------------


def test_admin_program_status_validates_create_and_update(client):
    headers = login(client)
    period_id = _period("TEST-PUB-PROG-ADMIN", start=date(2026, 8, 1))

    invalid = client.post(
        "/api/v1/admin/programs",
        json={
            "period_id": period_id,
            "name": "Status Invalid",
            "slug": "test-pub-prog-admin-invalid",
            "status": "done",
        },
        headers=headers,
    )

    assert invalid.status_code == 422

    created = client.post(
        "/api/v1/admin/programs",
        json={
            "period_id": period_id,
            "name": "Status Valid",
            "slug": "test-pub-prog-admin-valid",
            "status": "cancelled",
        },
        headers=headers,
    )

    assert created.status_code == 201

    program_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/admin/programs/{program_id}",
        json={
            "period_id": period_id,
            "name": "Status Valid",
            "slug": "test-pub-prog-admin-valid",
            "status": "unknown",
        },
        headers=headers,
    )

    assert updated.status_code == 422


# ---------------------------------------------------------------------------
# GET /public/news
# ---------------------------------------------------------------------------


def test_news_search_escapes_wildcards_and_is_case_insensitive(client):
    _news(
        "test-pub-news-percent",
        title="Diskon 50% untuk Anggota",
        published_at=date(2026, 1, 3),
    )
    _news(
        "test-pub-news-percent-lookalike",
        title="Diskon 500 unit",
        published_at=date(2026, 1, 2),
    )
    _news(
        "test-pub-news-underscore",
        title="Rapat_Koordinasi",
        published_at=date(2026, 1, 1),
    )
    _news(
        "test-pub-news-underscore-lookalike",
        title="Rapat Koordinasi",
        published_at=date(2026, 1, 1),
    )
    _news(
        "test-pub-news-draft",
        title="Diskon 50% draft",
        status="draft",
    )

    percent = client.get(
        "/api/v1/public/news",
        params={"q": "50%"},
    )

    assert percent.status_code == 200

    percent_body = percent.json()

    assert [item["slug"] for item in percent_body["items"]] == [
        "test-pub-news-percent"
    ]
    assert percent_body["total"] == 1

    underscore = client.get(
        "/api/v1/public/news",
        params={"q": "Rapat_"},
    ).json()

    assert [item["slug"] for item in underscore["items"]] == [
        "test-pub-news-underscore"
    ]

    insensitive = client.get(
        "/api/v1/public/news",
        params={"q": "diskon 50%"},
    ).json()

    assert [item["slug"] for item in insensitive["items"]] == [
        "test-pub-news-percent"
    ]

    too_short = client.get(
        "/api/v1/public/news",
        params={"q": "a"},
    )

    assert too_short.status_code == 422


def test_news_list_excerpt_tags_and_total(client):
    tag = _tag("TEST-PUB-TAG", "test-pub-tag")

    plain_id = _news(
        "test-pub-news-excerpt-plain",
        title="Berita Excerpt Pendek",
        content="Teks pendek tanpa HTML.",
        published_at=date(2026, 2, 1),
    )
    long_id = _news(
        "test-pub-news-excerpt-long",
        title="Berita Excerpt Panjang",
        content=(
            "<p>Paragraf <strong>pertama</strong> berisi kalimat yang cukup "
            "panjang untuk diuji pemotongannya.</p>"
            + "Lorem ipsum dolor sit amet consectetur adipiscing elit. " * 6
        ),
        published_at=date(2026, 2, 2),
    )

    _attach_tag(plain_id, tag)
    _attach_tag(long_id, tag)

    response = client.get(
        "/api/v1/public/news",
        params={"limit": 50},
    )

    assert response.status_code == 200

    body = response.json()
    items = {item["slug"]: item for item in body["items"]}

    assert body["total"] >= 2

    plain = items["test-pub-news-excerpt-plain"]

    assert plain["excerpt"] == "Teks pendek tanpa HTML."
    assert "content" not in plain
    assert plain["tags"] == [
        {
            "id": tag,
            "name": "TEST-PUB-TAG",
            "slug": "test-pub-tag",
        }
    ]

    long_item = items["test-pub-news-excerpt-long"]

    assert "<" not in long_item["excerpt"]
    assert "strong" not in long_item["excerpt"]
    assert long_item["excerpt"].endswith("…")
    assert len(long_item["excerpt"]) <= 161
    assert not long_item["excerpt"].endswith(" …")
    assert long_item["tags"][0]["slug"] == "test-pub-tag"

    detail = client.get(
        "/api/v1/public/news/test-pub-news-excerpt-long"
    )

    assert detail.status_code == 200
    assert detail.json()["tags"][0]["slug"] == "test-pub-tag"
    assert "content" in detail.json()


def test_news_excerpt_stops_at_word_boundary():
    from app.routers.public import _excerpt

    text = ("kata " * 40).strip()

    excerpt = _excerpt(text)

    assert excerpt.endswith("…")
    assert excerpt[:-1].endswith("kata")
    assert len(excerpt) <= 161

    short = _excerpt("<p>Halo <em>dunia</em></p>")

    assert short == "Halo dunia"


# ---------------------------------------------------------------------------
# GET /public/organization
# ---------------------------------------------------------------------------


def test_organization_sort_order_and_photo_normalization(client):
    period_id = _period(
        "TEST-PUB-ORG-ACTIVE",
        start=date(2098, 1, 1),
        active=True,
    )
    division_id = _division(period_id, "TEST-PUB-ORG-DIV", sort_order=5)

    with SessionLocal() as db:
        position = Position(
            name="TEST-PUB-ORG-POSITION",
            sort_order=7,
        )
        db.add(position)
        db.flush()

        members = [
            Member(
                period_id=period_id,
                division_id=division_id,
                position_id=position.id,
                name="Foto Storage",
                photo_url="images/2026/foto.webp",
                sort_order=0,
            ),
            Member(
                period_id=period_id,
                division_id=division_id,
                position_id=position.id,
                name="Foto HTTPS",
                photo_url="https://cdn.example.com/foto.jpg",
                sort_order=1,
            ),
            Member(
                period_id=period_id,
                division_id=division_id,
                position_id=position.id,
                name="Foto HTTP",
                photo_url="http://cdn.example.com/foto.jpg",
                sort_order=2,
            ),
            Member(
                period_id=period_id,
                division_id=division_id,
                position_id=position.id,
                name="Foto Asing",
                photo_url="uploads/foto.jpg",
                sort_order=3,
            ),
            Member(
                period_id=period_id,
                division_id=division_id,
                position_id=position.id,
                name="Tanpa Foto",
                photo_url=None,
                sort_order=4,
            ),
        ]

        db.add_all(members)
        db.commit()

    response = client.get("/api/v1/public/organization")

    assert response.status_code == 200

    body = response.json()

    assert body["period"] == {
        "id": period_id,
        "name": "TEST-PUB-ORG-ACTIVE",
    }

    division = next(
        item
        for item in body["divisions"]
        if item["id"] == division_id
    )

    assert division["sort_order"] == 5

    position = next(
        item
        for item in body["positions"]
        if item["name"] == "TEST-PUB-ORG-POSITION"
    )

    assert position["sort_order"] == 7

    photos = {
        member["name"]: member["photo_url"]
        for member in body["members"]
        if member["division_id"] == division_id
    }

    assert photos == {
        "Foto Storage": "/api/v1/media/images/2026/foto.webp",
        "Foto HTTPS": "https://cdn.example.com/foto.jpg",
        "Foto HTTP": None,
        "Foto Asing": None,
        "Tanpa Foto": None,
    }


# ---------------------------------------------------------------------------
# Seed idempotency
# ---------------------------------------------------------------------------


def test_seed_is_idempotent_and_grants_media_manage(tmp_path, monkeypatch):
    from app.seed import PERMS, seed as run_seed

    engine = create_engine(f"sqlite:///{tmp_path / 'seed.sqlite3'}")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, expire_on_commit=False)

    monkeypatch.setattr("app.seed.SessionLocal", TestSession)
    monkeypatch.setattr(
        "app.seed.settings.admin_default_password",
        "seed-password-1234",
    )

    def counts() -> tuple[int, int, int]:
        with TestSession() as db:
            return (
                db.scalar(
                    select(func.count()).select_from(Permission)
                ),
                db.scalar(select(func.count()).select_from(Role)),
                db.scalar(
                    select(func.count()).select_from(RolePermission)
                ),
            )

    run_seed()
    first = counts()

    run_seed()

    assert counts() == first
    assert first[0] == len(PERMS)

    with TestSession() as db:
        superadmin = db.scalar(
            select(Role).where(Role.name == "superadmin")
        )

        granted = set(
            db.scalars(
                select(Permission.name)
                .join(
                    RolePermission,
                    RolePermission.permission_id == Permission.id,
                )
                .where(RolePermission.role_id == superadmin.id)
            ).all()
        )

        assert granted == {name for name, _ in PERMS}
        assert "media.manage" in granted

        pairs = db.execute(
            select(
                RolePermission.role_id,
                RolePermission.permission_id,
            )
        ).all()

        assert len(pairs) == len(set(pairs))

    engine.dispose()


# ---------------------------------------------------------------------------
# Backward compatibility of the settings contract touched in review
# ---------------------------------------------------------------------------


def test_public_settings_still_returns_all_registry_keys(client):
    settings = client.get("/api/v1/public/settings").json()["settings"]

    assert tuple(settings) == tuple(SETTINGS_REGISTRY)
