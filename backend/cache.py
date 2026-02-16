"""
Caching utilities for async functions.

Provides a decorator for caching async function results with TTL.
"""

import time
import logging
from functools import wraps
from typing import Any, Callable, Dict

logger = logging.getLogger(__name__)

# Global cache storage
_cache: Dict[str, tuple[float, Any]] = {}


def invalidate_cache(key: str) -> None:
    """Invalidate a specific cache key"""
    if key in _cache:
        del _cache[key]


def cached(key_prefix: str, ttl: int = 60) -> Callable:
    """
    Decorator to cache async function results with TTL.

    The decorated function must have a 'current_user' parameter
    (from FastAPI Depends) with a 'uid' attribute.

    Args:
        key_prefix: Prefix for cache key (e.g., "orders", "cart")
        ttl: Time to live in seconds (default 60)

    Example:
        @cached("orders", ttl=60)
        async def get_user_orders(current_user: FirebaseUser = Depends(get_current_user)):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(current_user=None, **kwargs) -> Any:
            # Guard: if current_user is not available, just execute
            if not current_user or not hasattr(current_user, "uid"):
                logger.debug(f"[{key_prefix}] No current_user, executing function")
                return await func(current_user=current_user, **kwargs)

            cache_key = f"{key_prefix}_{current_user.uid}"
            logger.debug(f"[{key_prefix}] Cache key: {cache_key}")

            # Check if cached and valid
            if cache_key in _cache:
                cached_time, cached_data = _cache[cache_key]
                age = time.time() - cached_time
                if age < ttl:
                    logger.info(f"[{key_prefix}] Cache HIT for {cache_key} (age: {age:.1f}s)")
                    return cached_data
                else:
                    logger.debug(f"[{key_prefix}] Cache expired for {cache_key} (age: {age:.1f}s > {ttl}s)")
                    del _cache[cache_key]

            # Call the actual function
            logger.info(f"[{key_prefix}] Cache MISS for {cache_key}, executing function")
            result = await func(current_user=current_user, **kwargs)

            # Cache the result
            _cache[cache_key] = (time.time(), result)
            logger.debug(f"[{key_prefix}] Cached result for {cache_key}")

            return result

        return wrapper

    return decorator
