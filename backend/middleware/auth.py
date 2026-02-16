"""
Firebase authentication middleware.

Verifies Firebase ID tokens from Authorization header.
Provides authenticated user context to protected routes.
"""

from fastapi import HTTPException, Header, Depends
from firebase_admin import auth as firebase_auth
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FirebaseUser:
    """Represents an authenticated Firebase user"""

    def __init__(self, uid: str, email: str, email_verified: bool):
        """
        Initialize FirebaseUser.

        Args:
            uid: Firebase user ID
            email: User email address
            email_verified: Whether email is verified
        """
        self.uid = uid
        self.email = email
        self.email_verified = email_verified


async def verify_firebase_token(
    authorization: Optional[str] = Header(None)
) -> FirebaseUser:
    """
    Verify Firebase ID token from Authorization header.

    Expected format: Authorization: Bearer {firebase_id_token}

    Args:
        authorization: Authorization header value

    Returns:
        FirebaseUser object with uid and email

    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    if not authorization:
        logger.warning("Missing Authorization header")
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header"
        )

    # Extract token from "Bearer {token}" format
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid Authorization header format")
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Expected: Bearer <token>"
        )

    token = authorization.split("Bearer ")[1]

    try:
        # Verify token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)

        logger.info(f"Token verified for user: {decoded_token['uid']}")

        return FirebaseUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email", ""),
            email_verified=decoded_token.get("email_verified", False)
        )

    except firebase_auth.InvalidIdTokenError:
        logger.error("Invalid Firebase token")
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    except firebase_auth.ExpiredIdTokenError:
        logger.error("Expired Firebase token")
        raise HTTPException(
            status_code=401,
            detail="Token expired. Please refresh your session."
        )

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Token verification failed"
        )


def get_current_user(
    user: FirebaseUser = Depends(verify_firebase_token)
) -> FirebaseUser:
    """
    Dependency to inject authenticated user into route.

    Usage:
        @router.get("/protected")
        async def protected_route(current_user: FirebaseUser = Depends(get_current_user)):
            return {"user_id": current_user.uid}

    Args:
        user: Authenticated FirebaseUser from token verification

    Returns:
        FirebaseUser object
    """
    return user
