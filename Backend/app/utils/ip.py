from __future__ import annotations

from ipaddress import IPv4Address, IPv6Address, ip_address, ip_network

from fastapi import Request

from app.core.config import CLIENT_IP_SOURCES, settings


def _parse_ip(value: str | None) -> IPv4Address | IPv6Address | None:
    if not value:
        return None

    try:
        return ip_address(value.strip())
    except ValueError:
        return None


def _trusted_proxy_networks():
    networks = []

    for raw in settings.trusted_proxy_ip_list:
        try:
            networks.append(ip_network(raw, strict=False))
        except ValueError:
            continue

    return networks


def _is_trusted_proxy(value: str | None) -> bool:
    parsed = _parse_ip(value)

    if parsed is None:
        return False

    return any(
        parsed in network
        for network in _trusted_proxy_networks()
    )


def _first_header_ip(value: str | None) -> str | None:
    candidate = (value or "").split(",")[0].strip()

    if _parse_ip(candidate) is not None:
        return candidate

    return None


def _vercel_ip(request: Request) -> str | None:
    candidate = _first_header_ip(
        request.headers.get("x-vercel-forwarded-for"),
    )

    if candidate is not None:
        return candidate

    real_ip = (request.headers.get("x-real-ip") or "").strip()

    if _parse_ip(real_ip) is not None:
        return real_ip

    return None


def _trusted_proxy_ip(request: Request) -> str | None:
    client_host = request.client.host if request.client else None

    # Only trust forwarded headers when the direct peer is a known proxy.
    if not _is_trusted_proxy(client_host):
        return client_host

    forwarded = request.headers.get("x-forwarded-for", "")

    # Read from the right: every hop to the right of the real client is a
    # proxy we control, so the left-most element can be spoofed.
    for part in reversed(forwarded.split(",")):
        candidate = part.strip()

        if _parse_ip(candidate) is None:
            continue

        if not _is_trusted_proxy(candidate):
            return candidate

    return client_host


def _fallback_client_host(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def resolve_client_ip(request: Request) -> str:
    """Return the single client IP used by rate limiting and audit logs."""

    source = settings.client_ip_source

    if source == "vercel":
        return _vercel_ip(request) or _fallback_client_host(request)

    if source == "trusted_proxy":
        return _trusted_proxy_ip(request) or _fallback_client_host(request)

    # "direct" (and any value that should have been rejected at startup).
    return _fallback_client_host(request)


def get_client_ip(request: Request) -> str:
    return resolve_client_ip(request)


__all__ = [
    "CLIENT_IP_SOURCES",
    "get_client_ip",
    "resolve_client_ip",
]
