"""
Order management routes.

Handles order placement and order history retrieval.
"""

from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user, FirebaseUser
from models.schemas import OrderResponse, PlaceOrderResponse, OrderItem
from firestore import get_document, add_document, update_document, query_documents
from datetime import datetime
from typing import List
import logging
from cache import cached, invalidate_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/place", response_model=PlaceOrderResponse, status_code=200)
async def place_order(current_user: FirebaseUser = Depends(get_current_user)):
    """
    Place an order from the user's shopping cart.

    Creates an order document, copies cart items, clears the cart,
    and returns the order ID.

    Args:
        current_user: Authenticated user

    Returns:
        PlaceOrderResponse with order_id and total_amount

    Raises:
        400: Cart is empty
        500: Database error
    """
    try:
        # Get user's cart
        cart = get_document("carts", current_user.uid)

        if not cart or not cart.get("items"):
            logger.warning(f"Cart empty for user: {current_user.uid}")
            raise HTTPException(
                status_code=400,
                detail="Cart is empty"
            )

        items = cart.get("items", [])

        # Calculate total
        total_amount = sum(
            item.get("price", 0) * item.get("quantity", 0)
            for item in items
        )

        # Create order document
        order_data = {
            "uid": current_user.uid,
            "items": [
                {
                    "product_id": item.get("product_id"),
                    "name": item.get("name"),
                    "quantity": item.get("quantity"),
                    "price": item.get("price")
                }
                for item in items
            ],
            "total_amount": total_amount,
            "status": "PLACED",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

        # Add order to database
        order_id = add_document("orders", order_data)

        # Clear cart
        update_document("carts", current_user.uid, {
            "items": [],
            "updated_at": datetime.utcnow().isoformat() + "Z"
        })

        # Invalidate cache
        invalidate_cache(f"orders_{current_user.uid}")

        logger.info(f"Order {order_id} placed by user {current_user.uid} for amount {total_amount}")

        return PlaceOrderResponse(
            message="Order placed successfully",
            order_id=order_id,
            total_amount=total_amount
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error placing order: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error placing order"
        )


@router.get("", response_model=List[OrderResponse], status_code=200)
@cached("orders")
async def get_user_orders(current_user: FirebaseUser = Depends(get_current_user)):
    """
    Get all orders for the current user.

    Returns order history sorted by most recent first.
    Results are cached for 60 seconds per user.

    Args:
        current_user: Authenticated user

    Returns:
        List of OrderResponse objects

    Raises:
        500: Database error
    """
    try:
        # Query orders for this user
        orders = query_documents("orders", "uid", "==", current_user.uid)

        # Sort by created_at descending (most recent first)
        orders.sort(
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )

        # Format response
        result = []
        for order in orders:
            result.append(
                OrderResponse(
                    id=order.get("id"),
                    items=[OrderItem(**item) for item in order.get("items", [])],
                    total_amount=order.get("total_amount", 0),
                    status=order.get("status", "UNKNOWN"),
                    created_at=order.get("created_at", "")
                )
            )

        logger.info(f"Retrieved {len(orders)} orders for user {current_user.uid}")

        return result

    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching orders"
        )
