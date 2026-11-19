from fastapi import Request

from app.core.config import settings
from app.core.rate_limit import limiter
from app.utils.ip import get_client_ip, resolve_client_ip


def make_request(
    headers: dict[str, str] | None = None,
    client: tuple[str, int] | None = ("203.0.113.10", 12345),
) -> Request:
    raw_headers = [
        (key.lower().encode("latin-1"), value.encode("latin-1"))
        for key, value in (headers or {}).items()
    ]

    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "query_string": b"",
        "headers": raw_headers,
        "client": client,
        "server": ("testserver", 80),
        "scheme": "http",
    }

    return Request(scope)


def test_vercel_uses_first_forwarded_for_element(
    monkeypatch,
):
    monkeypatch.setattr(settings, "client_ip_source", "vercel")

    request = make_request(
        {
            "x-vercel-forwarded-for": "198.51.100.7, 10.0.0.5",
        }
    )

    assert resolve_client_ip(request) == "198.51.100.7"


def test_vercel_falls_back_to_real_ip(monkeypatch):
    monkeypatch.setattr(settings, "client_ip_source", "vercel")

    request = make_request(
        {
            "x-vercel-forwarded-for": "not-an-ip",
            "x-real-ip": "198.51.100.8",
        }
    )

    assert resolve_client_ip(request) == "198.51.100.8"


def test_vercel_skips_invalid_candidates(monkeypatch):
    monkeypatch.setattr(settings, "client_ip_source", "vercel")

    request = make_request(
        {
            "x-vercel-forwarded-for": "garbage",
            "x-real-ip": "also-garbage",
        },
        client=("203.0.113.20", 12345),
    )

    assert resolve_client_ip(request) == "203.0.113.20"


def test_direct_ignores_forwarded_headers(monkeypatch):
    monkeypatch.setattr(settings, "client_ip_source", "direct")

    request = make_request(
        {
            "x-forwarded-for": "1.1.1.1",
            "x-real-ip": "2.2.2.2",
            "x-vercel-forwarded-for": "3.3.3.3",
        },
        client=("203.0.113.30", 12345),
    )

    assert resolve_client_ip(request) == "203.0.113.30"


def test_trusted_proxy_takes_first_non_proxy_hop_from_the_right(
    monkeypatch,
):
    monkeypatch.setattr(settings, "client_ip_source", "trusted_proxy")
    monkeypatch.setattr(
        settings,
        "trusted_proxy_ips",
        "10.0.0.1, 10.0.0.0/24",
    )

    request = make_request(
        {
            # The left-most element is attacker-controlled and must be ignored.
            "x-forwarded-for": "6.6.6.6, 203.0.113.55, 10.0.0.9",
        },
        client=("10.0.0.1", 12345),
    )

    assert resolve_client_ip(request) == "203.0.113.55"


def test_trusted_proxy_is_ignored_when_peer_is_not_trusted(
    monkeypatch,
):
    monkeypatch.setattr(settings, "client_ip_source", "trusted_proxy")
    monkeypatch.setattr(settings, "trusted_proxy_ips", "10.0.0.1")

    request = make_request(
        {"x-forwarded-for": "1.1.1.1"},
        client=("203.0.113.40", 12345),
    )

    assert resolve_client_ip(request) == "203.0.113.40"


def test_audit_and_rate_limiter_share_the_same_ip(monkeypatch):
    monkeypatch.setattr(settings, "client_ip_source", "vercel")

    request = make_request(
        {"x-vercel-forwarded-for": "198.51.100.99, 10.0.0.5"}
    )

    assert get_client_ip(request) == resolve_client_ip(request)
    assert limiter.client_ip(request) == get_client_ip(request)
    assert get_client_ip(request) == "198.51.100.99"
