import pytest
from app.core.rate_limit import RateLimiter

@pytest.mark.asyncio
async def test_limit_blocks_after_threshold():
    rl = RateLimiter()
    assert (await rl.allow('k', 2, 60))[0]
    assert (await rl.allow('k', 2, 60))[0]
    assert not (await rl.allow('k', 2, 60))[0]
