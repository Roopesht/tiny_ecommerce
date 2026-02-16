"""
Authentication routes.

Handles user profile management and authentication endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from middleware.auth import get_current_user, FirebaseUser
from models.schemas import UserProfile, UserResponse
from firestore import get_document, add_document, update_document
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/me", response_model=UserResponse, status_code=200)
async def get_current_user_profile(
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Get the current authenticated user's profile.

    Returns the user's profile information from Firestore.

    Args:
        current_user: Authenticated user from token verification

    Returns:
        UserResponse with user profile data

    Raises:
        404: User profile not found
        500: Database error
    """
    try:
        # Fetch user data from Firestore
        user_doc = get_document("users", current_user.uid)

        if not user_doc:
            logger.warning(f"Profile not found for user: {current_user.uid}")
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )

        logger.info(f"Retrieved profile for user: {current_user.uid}")

        return UserResponse(
            uid=current_user.uid,
            email=current_user.email,
            firstname=user_doc.get("firstname"),
            lastname=user_doc.get("lastname"),
            mobilenumber=user_doc.get("mobilenumber")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching user profile"
        )


@router.post("/profile", status_code=200)
async def create_or_update_profile(
    profile: UserProfile,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Create or update the current user's profile.

    Creates a new profile if one doesn't exist, otherwise updates the existing one.

    Args:
        profile: User profile data (firstname, lastname, mobilenumber)
        current_user: Authenticated user from token verification

    Returns:
        Message confirming profile was updated

    Raises:
        500: Database error
    """
    try:
        user_data = {
            "uid": current_user.uid,
            "email": current_user.email,
            "firstname": profile.firstname,
            "lastname": profile.lastname,
            "mobilenumber": profile.mobilenumber,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

        # Check if user exists
        existing = get_document("users", current_user.uid)

        if existing:
            # Update existing user
            update_document("users", current_user.uid, user_data)
            logger.info(f"Updated profile for user: {current_user.uid}")
            action = "updated"
        else:
            # Create new user
            user_data["created_at"] = datetime.utcnow().isoformat() + "Z"
            add_document("users", user_data, doc_id=current_user.uid)
            logger.info(f"Created profile for user: {current_user.uid}")
            action = "created"

        return {
            "message": f"Profile {action} successfully",
            "uid": current_user.uid
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating profile"
        )
