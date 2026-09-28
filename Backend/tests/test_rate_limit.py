
import pytest
from fastapi import Request

import app.core.rate_limit as rate_limit_module
from app.core.rate_limit import RateLimiter, enforce_request_limit


def make_request(
    path: str,
    method: str = "GET",
) -> Request:
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "query_string": b"",
        "headers": [],
        "client": ("203.0.113.10", 12345),
        "server": ("testserver", 80),
        "scheme": "http",
    }

    return Request(scope)


@pytest.mark.asyncio
async def test_limit_blocks_after_threshold():
    rl = RateLimiter()

    assert (await rl.allow("k", 2, 60))[0]
    assert (await rl.allow("k", 2, 60))[0]
    assert not (await rl.allow("k", 2, 60))[0]


class RecordingLimiter:
    def __init__(self) -> None:
        self.calls: list[tuple[str, int, int]] = []

    def client_ip(self, request: Request) -> str:
        return "203.0.113.10"

    async def allow(
        self,
        key: str,
        limit: int,
        window: int,
    ) -> tuple[bool, int]:
        self.calls.append((key, limit, window))
        return True, 0


@pytest.mark.asyncio
async def test_public_news_slugs_share_same_semantic_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/public/news/artikel-a")
    )
    first_calls = list(fake.calls)

    fake.calls.clear()

    await enforce_request_limit(
        make_request("/api/v1/public/news/artikel-b")
    )
    second_calls = list(fake.calls)

    assert first_calls == second_calls
    assert first_calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:public-news:203.0.113.10", 120, 60),
    ]


@pytest.mark.asyncio
async def test_program_ids_share_same_semantic_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request(
            "/api/v1/admin/programs/1",
            "PUT",
        )
    )
    first_calls = list(fake.calls)

    fake.calls.clear()

    await enforce_request_limit(
        make_request(
            "/api/v1/admin/programs/999999",
            "PUT",
        )
    )
    second_calls = list(fake.calls)

    assert first_calls == second_calls
    assert first_calls == [
        ("write-global:203.0.113.10", 120, 60),
        ("write:admin-programs:203.0.113.10", 60, 60),
    ]


@pytest.mark.asyncio
async def test_query_string_does_not_change_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    request = make_request("/api/v1/public/news")
    await enforce_request_limit(request)

    assert fake.calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:public-news:203.0.113.10", 120, 60),
    ]


@pytest.mark.asyncio
async def test_login_uses_specialized_limiter_only(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request(
            "/api/v1/auth/login",
            "POST",
        )
    )

    assert fake.calls == []


@pytest.mark.asyncio
async def test_public_visit_uses_specialized_limiter_only(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request(
            "/api/v1/public/visits",
            "POST",
        )
    )

    assert fake.calls == []

@pytest.mark.asyncio
async def test_admin_get_uses_semantic_group(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/admin/news")
    )

    assert fake.calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:admin-news:203.0.113.10", 120, 60),
    ]


@pytest.mark.asyncio
async def test_admin_dynamic_news_ids_share_same_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/admin/news/1")
    )
    first_calls = list(fake.calls)

    fake.calls.clear()

    await enforce_request_limit(
        make_request("/api/v1/admin/news/999999")
    )
    second_calls = list(fake.calls)

    assert first_calls == second_calls


@pytest.mark.asyncio
async def test_media_image_and_document_reads_have_semantic_scopes(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/media/images/example.jpg")
    )

    assert fake.calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:media-images:203.0.113.10", 120, 60),
    ]

    fake.calls.clear()

    await enforce_request_limit(
        make_request("/api/v1/media/documents/example.pdf")
    )

    assert fake.calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:media-documents:203.0.113.10", 120, 60),
    ]


@pytest.mark.asyncio
async def test_auth_reads_use_semantic_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/auth/me")
    )

    assert fake.calls == [
        ("read-global:203.0.113.10", 360, 60),
        ("read:auth-read:203.0.113.10", 120, 60),
    ]


@pytest.mark.asyncio
async def test_auth_login_and_public_visit_skip_generic_scope(
    monkeypatch: pytest.MonkeyPatch,
):
    fake = RecordingLimiter()
    monkeypatch.setattr(rate_limit_module, "limiter", fake)

    await enforce_request_limit(
        make_request("/api/v1/auth/login", "POST")
    )
    assert fake.calls == []

    await enforce_request_limit(
        make_request("/api/v1/public/visits", "POST")
    )
    assert fake.calls == []