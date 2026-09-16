from __future__ import annotations
import asyncio, hashlib, time
from collections import defaultdict, deque
from ipaddress import ip_address, ip_network
from fastapi import Request, HTTPException
from app.core.config import settings
try:
    from redis.asyncio import Redis
    from redis.exceptions import RedisError
except ImportError:
    Redis = None
    class RedisError(Exception): pass

class RateLimiter:
    def __init__(self):
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()
        self._redis = Redis.from_url(settings.redis_url, decode_responses=True) if settings.rate_limit_backend == "redis" and settings.redis_url and Redis else None

    def _trusted_proxy(self, request: Request) -> bool:
        if not request.client: return False
        try: client = ip_address(request.client.host)
        except ValueError: return False
        return any(client in ip_network(net, strict=False) for net in settings.trusted_proxy_ip_list if _valid_net(net))

    def client_ip(self, request: Request) -> str:
        if self._trusted_proxy(request):
            candidate = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            try: ip_address(candidate); return candidate
            except ValueError: pass
        return request.client.host if request.client else "unknown"

    async def allow(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        now = time.time()
        if self._redis is not None:
            try:
                bucket = int(now // window)
                digest = hashlib.sha256(key.encode()).hexdigest()
                redis_key = f"himatkn:rl:{digest}:{bucket}"
                count = await self._redis.incr(redis_key)
                if count == 1: await self._redis.expire(redis_key, window + 2)
                retry = max(1, window - int(now % window))
                return count <= limit, retry
            except RedisError:
                if settings.rate_limit_fail_closed: return False, window
        if settings.rate_limit_backend == "redis" and settings.rate_limit_fail_closed:
            return False, window
        async with self._lock:
            q = self._events[key]; cutoff = now - window
            while q and q[0] <= cutoff: q.popleft()
            if len(q) >= limit: return False, max(1, int(window - (now - q[0])))
            q.append(now); return True, 0

def _valid_net(value: str) -> bool:
    try: ip_network(value, strict=False); return True
    except ValueError: return False

limiter = RateLimiter()

async def enforce_request_limit(request: Request) -> None:
    path = request.url.path; method = request.method.upper(); ip = limiter.client_ip(request)
    rules = []
    if path.startswith("/api/v1/public/news") or path.startswith("/api/v1/public/programs") or path.startswith("/api/v1/public/organization"):
        rules.append((f"read:{path}:{ip}", settings.general_read_limit, settings.general_read_window_seconds, "Terlalu banyak permintaan."))
    elif path.startswith("/api/v1/") and method in {"POST","PUT","PATCH","DELETE"}:
        rules.append((f"write:{path}:{ip}", settings.general_write_limit, settings.general_write_window_seconds, "Terlalu banyak permintaan."))
    for key, limit, window, message in rules:
        allowed, retry = await limiter.allow(key, limit, window)
        if not allowed:
            raise HTTPException(status_code=429, detail=message, headers={"Retry-After": str(retry), "X-RateLimit-Limit": str(limit)})
