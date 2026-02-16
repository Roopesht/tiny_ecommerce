"""
Custom exception classes for the API.

Provides structured error responses with HTTP status codes.
"""

from fastapi import HTTPException
from typing import Optional


class APIException(HTTPException):
    """Base API exception class"""

    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None
    ):
        """
        Initialize API exception.

        Args:
            status_code: HTTP status code
            detail: Error message
            error_code: Optional error code for categorization
        """
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class NotFound(APIException):
    """404 Not Found exception"""

    def __init__(self, resource: str):
        """
        Initialize NotFound exception.

        Args:
            resource: Name of the resource that was not found
        """
        super().__init__(
            status_code=404,
            detail=f"{resource} not found",
            error_code="NOT_FOUND"
        )


class Unauthorized(APIException):
    """401 Unauthorized exception"""

    def __init__(self, detail: str = "Unauthorized"):
        """
        Initialize Unauthorized exception.

        Args:
            detail: Error message
        """
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="UNAUTHORIZED"
        )


class BadRequest(APIException):
    """400 Bad Request exception"""

    def __init__(self, detail: str):
        """
        Initialize BadRequest exception.

        Args:
            detail: Error message
        """
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="BAD_REQUEST"
        )


class InternalServerError(APIException):
    """500 Internal Server Error exception"""

    def __init__(self, detail: str = "Internal server error"):
        """
        Initialize InternalServerError exception.

        Args:
            detail: Error message
        """
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="INTERNAL_ERROR"
        )


class Conflict(APIException):
    """409 Conflict exception"""

    def __init__(self, detail: str):
        """
        Initialize Conflict exception.

        Args:
            detail: Error message
        """
        super().__init__(
            status_code=409,
            detail=detail,
            error_code="CONFLICT"
        )
