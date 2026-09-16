from __future__ import annotations

from app.core.rate_limit import limiter


def test_public_visit_uses_validated_page(client):
    response = client.post(
        "/api/v1/public/visits",
        params={"page": "/"},
    )

    assert response.status_code == 201
    assert response.json() == {"status": "ok"}


def test_public_visit_requires_non_empty_page(client):
    response = client.post(
        "/api/v1/public/visits",
        params={"page": ""},
    )

    assert response.status_code == 422


def test_public_visit_rate_limit(client, monkeypatch):
    limiter._events.clear()

    monkeypatch.setattr(
        "app.core.config.settings.general_write_limit",
        2,
        raising=False,
    )
    monkeypatch.setattr(
        "app.core.config.settings.general_write_window_seconds",
        60,
        raising=False,
    )

    first = client.post(
        "/api/v1/public/visits",
        params={"page": "/"},
    )
    second = client.post(
        "/api/v1/public/visits",
        params={"page": "/berita"},
    )
    third = client.post(
        "/api/v1/public/visits",
        params={"page": "/struktur"},
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert third.status_code == 429
    assert third.headers.get("Retry-After")


def test_public_news_hides_unpublished_content(client):
    response = client.get("/api/v1/public/news")

    assert response.status_code == 200

    for item in response.json()["items"]:
        assert "content" not in item
