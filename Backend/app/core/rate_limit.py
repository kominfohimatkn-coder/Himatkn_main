from __future__ import annotations

import asyncio
import hashlib
import time
from collections import defaultdict, deque
from ipaddress import ip_address, ip_network

from fastapi import HTTPException, Request

from app.core.config import settings

try:
    from redis.asyncio import Redis
    from redis.exceptions import RedisError
except ImportError:
    Redis = None

    class RedisError(Exception):
        pass


MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

PUBLIC_READ_GROUPS: tuple[tuple[str, str], ...] = (
    ("/api/v1/public/news", "public-news"),
    ("/api/v1/public/programs", "public-programs"),
    ("/api/v1/public/organization", "public-organization"),
)

ADMIN_READ_GROUPS: tuple[tuple[str, str], ...] = (
    ("/api/v1/admin/dashboard", "admin-dashboard"),
    ("/api/v1/admin/admins", "admin-admins"),
    ("/api/v1/admin/agendas", "admin-agendas"),
    ("/api/v1/admin/documents", "admin-documents"),
    ("/api/v1/admin/news", "admin-news"),
    ("/api/v1/admin/organization", "admin-organization"),
    ("/api/v1/admin/programs", "admin-programs"),
    ("/api/v1/admin/settings", "admin-settings"),
    ("/api/v1/admin/visitor-logs", "admin-visitor-logs"),
    ("/api/v1/admin/activity-logs", "admin-activity-logs"),
    ("/api/v1/media/images", "media-images"),
    ("/api/v1/media/documents", "media-documents"),
    ("/api/v1/auth", "auth-read"),
)

WRITE_GROUPS: tuple[tuple[str, str], ...] = (
    ("/api/v1/admin/admins", "admin-admins"),
    ("/api/v1/admin/news", "admin-news"),
    ("/api/v1/admin/programs", "admin-programs"),
    ("/api/v1/admin/agendas", "admin-agendas"),
    ("/api/v1/admin/documents", "admin-documents"),
    ("/api/v1/admin/notifications", "admin-notifications"),
    ("/api/v1/admin/organization", "admin-organization"),
    ("/api/v1/admin/settings", "admin-settings"),
    ("/api/v1/media", "media"),
)

# These endpoints already have specialized rate limits.
SPECIAL_WRITE_PATHS = {
    "/api/v1/auth/login",
    "/api/v1/public/visits",
}


def _matches_prefix(path: str, prefix: str) -> bool:
    return path == prefix or path.startswith(f"{prefix}/")


def _valid_net(value: str) -> bool:
    try:
        ip_network(value, strict=False)
        return True
    except ValueError:
        return False


def _semantic_scope(
    path: str,
    method: str,
) -> tuple[str, str] | None:
    """
    Return (traffic_class, semantic_group).

    The semantic group deliberately ignores resource IDs/slugs.
    """

    method = method.upper()

    if method == "GET":
        for prefix, group in PUBLIC_READ_GROUPS:
            if _matches_prefix(path, prefix):
                return "read", group

        for prefix, group in ADMIN_READ_GROUPS:
            if _matches_prefix(path, prefix):
                return "read", group

        return None

    if method not in MUTATING_METHODS:
        return None

    if path in SPECIAL_WRITE_PATHS:
        return None

    for prefix, group in WRITE_GROUPS:
        if _matches_prefix(path, prefix):
            return "write", group

    # Future/current admin mutation endpoints that are not explicitly mapped.
    if _matches_prefix(path, "/api/v1/admin"):
        return "write", "admin-other"

    # Future authenticated mutations under /auth.
    if _matches_prefix(path, "/api/v1/auth"):
        return "write", "auth"

    # Generic fallback for future API mutations.
    if path.startswith("/api/v1/"):
        return "write", "api-other"

    return None


class RateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

        self._redis = (
            Redis.from_url(
                settings.redis_url,
                decode_responses=True,
            )
            if (
                settings.rate_limit_backend == "redis"
                and settings.redis_url
                and Redis
            )
            else None
        )

    def _trusted_proxy(self, request: Request) -> bool:
        if not request.client:
            return False

        try:
            client = ip_address(request.client.host)
        except ValueError:
            return False

        return any(
            client in ip_network(net, strict=False)
            for net in settings.trusted_proxy_ip_list
            if _valid_net(net)
        )

    def client_ip(self, request: Request) -> str:
        if self._trusted_proxy(request):
            candidate = (
                request.headers.get("x-forwarded-for", "")
                .split(",")[0]
                .strip()
            )

            try:
                ip_address(candidate)
                return candidate
            except ValueError:
                pass

        return request.client.host if request.client else "unknown"

    async def allow(
        self,
        key: str,
        limit: int,
        window: int,
    ) -> tuple[bool, int]:
        now = time.time()

        if self._redis is not None:
            try:
                bucket = int(now // window)
                digest = hashlib.sha256(key.encode()).hexdigest()
                redis_key = f"himatkn:rl:{digest}:{bucket}"

                count = await self._redis.incr(redis_key)

                if count == 1:
                    await self._redis.expire(
                        redis_key,
                        window + 2,
                    )

                retry = max(
                    1,
                    window - int(now % window),
                )

                return count <= limit, retry

            except RedisError:
                if settings.rate_limit_fail_closed:
                    return False, window

        if (
            settings.rate_limit_backend == "redis"
            and settings.rate_limit_fail_closed
        ):
            return False, window

        async with self._lock:
            queue = self._events[key]
            cutoff = now - window

            while queue and queue[0] <= cutoff:
                queue.popleft()

            if len(queue) >= limit:
                retry = max(
                    1,
                    int(window - (now - queue[0])),
                )
                return False, retry

            queue.append(now)
            return True, 0


limiter = RateLimiter()


async def enforce_request_limit(request: Request) -> None:
    path = request.url.path
    method = request.method.upper()
    ip = limiter.client_ip(request)

    scope = _semantic_scope(path, method)

    if scope is None:
        return

    traffic_class, group = scope

    if traffic_class == "read":
        rules = (
            (
                f"read-global:{ip}",
                settings.global_read_limit,
                settings.general_read_window_seconds,
            ),
            (
                f"read:{group}:{ip}",
                settings.general_read_limit,
                settings.general_read_window_seconds,
            ),
        )
    else:
        rules = (
            (
                f"write-global:{ip}",
                settings.global_write_limit,
                settings.general_write_window_seconds,
            ),
            (
                f"write:{group}:{ip}",
                settings.general_write_limit,
                settings.general_write_window_seconds,
            ),
        )

    for key, limit, window in rules:
        allowed, retry = await limiter.allow(
            key,
            limit,
            window,
        )

        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="Terlalu banyak permintaan.",
                headers={
                    "Retry-After": str(retry),
                    "X-RateLimit-Limit": str(limit),
                },
            )