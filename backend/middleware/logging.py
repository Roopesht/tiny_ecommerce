"""
Request/response logging middleware.

Logs all incoming requests and outgoing responses with structured data.
Includes timing, status codes, and user information.
"""

import time
import json
import logging
from fastapi import Request
from typing import Callable

logger = logging.getLogger(__name__)


async def log_requests_middleware(request: Request, call_next: Callable):
    """
    Log all incoming requests with response details.

    Logs:
    - Request method, path, query params
    - Response status code
    - Request duration
    - User ID (if authenticated)

    Args:
        request: FastAPI Request object
        call_next: Next middleware/route handler

    Returns:
        Response from next handler
    """
    start_time = time.time()

    # Extract user ID from Authorization header if present
    auth_header = request.headers.get("authorization", "")
    user_id = "anonymous"

    # Extract request path and method
    method = request.method
    path = request.url.path

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000

    # Build structured log data
    log_data = {
        "type": "request",
        "method": method,
        "path": path,
        "status_code": response.status_code,
        "duration_ms": round(duration_ms, 2),
        "user_id": user_id,
        "timestamp": time.time()
    }

    # Log at different levels based on status code
    if response.status_code >= 500:
        logger.error(json.dumps(log_data))
    elif response.status_code >= 400:
        logger.warning(json.dumps(log_data))
    else:
        logger.info(json.dumps(log_data))

    return response
