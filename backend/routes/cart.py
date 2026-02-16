"""
Shopping cart routes.

Handles cart operations: view, add items, remove items, update quantities.
"""

from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user, FirebaseUser
from models.schemas import (
    CartResponse, CartItem, AddToCartRequest, RemoveFromCartRequest, UpdateCartRequest
)
from firestore import get_document, add_document, update_document
from datetime import datetime
import logging
from cache import cached, invalidate_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["cart"])


async def get_user_cart(uid: str) -> dict:
    """Helper function to get user's cart"""
    cart = get_document("carts", uid)
    if not cart:
        return {"uid": uid, "items": []}
    return cart


@router.get("", response_model=CartResponse, status_code=200)
@cached("cart")
async def get_cart(current_user: FirebaseUser = Depends(get_current_user)):
    """
    Get the current user's shopping cart.

    Returns all items in the user's cart with total calculations.
    Results are cached for 60 seconds per user.

    Args:
        current_user: Authenticated user

    Returns:
        CartResponse with items and totals

    Raises:
        500: Database error
    """
    try:
        cart = await get_user_cart(current_user.uid)

        items = cart.get("items", [])
        total_items = sum(item.get("quantity", 0) for item in items)
        total_amount = sum(
            item.get("price", 0) * item.get("quantity", 0)
            for item in items
        )

        result = CartResponse(
            items=[CartItem(**item) for item in items],
            total_items=total_items,
            total_amount=total_amount
        )

        logger.info(f"Retrieved cart for user: {current_user.uid}")

        return result

    except Exception as e:
        logger.error(f"Error fetching cart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching cart"
        )


@router.post("/add", status_code=200)
async def add_to_cart(
    request: AddToCartRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Add an item to the shopping cart.

    If product already in cart, increases quantity.
    If cart doesn't exist, creates a new cart.

    Args:
        request: AddToCartRequest with product_id and quantity
        current_user: Authenticated user

    Returns:
        Message with updated cart total

    Raises:
        404: Product not found
        500: Database error
    """
    try:
        # Verify product exists
        product = get_document("products", request.product_id)
        if not product:
            logger.warning(f"Product not found: {request.product_id}")
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        # Get current cart
        cart = await get_user_cart(current_user.uid)
        items = cart.get("items", [])

        # Check if product already in cart
        existing_item = next(
            (item for item in items if item["product_id"] == request.product_id),
            None
        )

        if existing_item:
            # Update quantity
            existing_item["quantity"] += request.quantity
        else:
            # Add new item
            new_item = {
                "product_id": request.product_id,
                "name": product.get("name", ""),
                "price": product.get("price", 0),
                "quantity": request.quantity,
                "image_url": product.get("image_url", "")
            }
            items.append(new_item)

        # Calculate totals
        total_items = sum(item.get("quantity", 0) for item in items)
        total_amount = sum(
            item.get("price", 0) * item.get("quantity", 0)
            for item in items
        )

        # Update cart in database
        cart_data = {
            "uid": current_user.uid,
            "items": items,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

        if "id" in cart:
            update_document("carts", current_user.uid, cart_data)
        else:
            add_document("carts", cart_data, doc_id=current_user.uid)

        # Invalidate cache
        invalidate_cache(f"cart_{current_user.uid}")

        logger.info(f"Added {request.quantity} of {request.product_id} to cart for {current_user.uid}")

        return {
            "message": "Item added to cart",
            "total_items": total_items,
            "total_amount": total_amount
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to cart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error adding to cart"
        )


@router.post("/remove", status_code=200)
async def remove_from_cart(
    request: RemoveFromCartRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Remove an item from the shopping cart.

    Completely removes the product from cart.

    Args:
        request: RemoveFromCartRequest with product_id
        current_user: Authenticated user

    Returns:
        Message confirming removal

    Raises:
        404: Cart not found or product not in cart
        500: Database error
    """
    try:
        cart = await get_user_cart(current_user.uid)

        if not cart or "items" not in cart:
            raise HTTPException(
                status_code=404,
                detail="Cart not found"
            )

        items = cart.get("items", [])
        original_count = len(items)

        # Remove item
        items = [
            item for item in items
            if item.get("product_id") != request.product_id
        ]

        if len(items) == original_count:
            logger.warning(f"Product not in cart: {request.product_id}")
            raise HTTPException(
                status_code=404,
                detail="Product not in cart"
            )

        # Update cart
        cart_data = {
            "uid": current_user.uid,
            "items": items,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

        update_document("carts", current_user.uid, cart_data)

        # Invalidate cache
        invalidate_cache(f"cart_{current_user.uid}")

        logger.info(f"Removed {request.product_id} from cart for {current_user.uid}")

        return {"message": "Item removed from cart"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing from cart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error removing from cart"
        )


@router.post("/update", status_code=200)
async def update_cart_quantity(
    request: UpdateCartRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Update the quantity of an item in the cart.

    If quantity is 0, removes the item.

    Args:
        request: UpdateCartRequest with product_id and new quantity
        current_user: Authenticated user

    Returns:
        Message confirming update

    Raises:
        404: Cart not found or product not in cart
        500: Database error
    """
    try:
        cart = await get_user_cart(current_user.uid)

        if not cart or "items" not in cart:
            raise HTTPException(
                status_code=404,
                detail="Cart not found"
            )

        items = cart.get("items", [])

        # Find item
        item = next(
            (item for item in items if item["product_id"] == request.product_id),
            None
        )

        if not item:
            logger.warning(f"Product not in cart: {request.product_id}")
            raise HTTPException(
                status_code=404,
                detail="Product not in cart"
            )

        # Update or remove
        if request.quantity <= 0:
            items = [i for i in items if i["product_id"] != request.product_id]
        else:
            item["quantity"] = request.quantity

        # Update cart
        cart_data = {
            "uid": current_user.uid,
            "items": items,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

        update_document("carts", current_user.uid, cart_data)

        # Invalidate cache
        invalidate_cache(f"cart_{current_user.uid}")

        logger.info(f"Updated {request.product_id} quantity to {request.quantity} for {current_user.uid}")

        return {"message": "Cart updated"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating cart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating cart"
        )
