"""
Pydantic schemas for request/response validation.

Defines the data models used throughout the API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ==================== User Models ====================

class UserProfile(BaseModel):
    """User profile data"""
    firstname: str = Field(..., min_length=1, max_length=100)
    lastname: str = Field(..., min_length=1, max_length=100)
    mobilenumber: str = Field(..., min_length=10, max_length=20)


class UserResponse(BaseModel):
    """User profile response"""
    uid: str
    email: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    mobilenumber: Optional[str] = None


# ==================== Product Models ====================

class ProductResponse(BaseModel):
    """Product data response"""
    id: str
    name: str
    description: str
    price: float
    image_url: str
    stock: int
    category: str
    created_at: Optional[str] = None


# ==================== Cart Models ====================

class CartItem(BaseModel):
    """Item in shopping cart"""
    product_id: str
    name: str
    price: float
    quantity: int
    image_url: str


class CartRequest(BaseModel):
    """Request to add/remove item from cart"""
    product_id: str
    quantity: Optional[int] = 1


class CartResponse(BaseModel):
    """Shopping cart response"""
    items: List[CartItem] = []
    total_items: int = 0
    total_amount: float = 0.0


class AddToCartRequest(BaseModel):
    """Request to add item to cart"""
    product_id: str = Field(..., min_length=1)
    quantity: int = Field(1, ge=1)


class UpdateCartRequest(BaseModel):
    """Request to update cart item quantity"""
    product_id: str = Field(..., min_length=1)
    quantity: int = Field(..., ge=0)


class RemoveFromCartRequest(BaseModel):
    """Request to remove item from cart"""
    product_id: str = Field(..., min_length=1)


# ==================== Order Models ====================

class OrderItem(BaseModel):
    """Item in an order"""
    product_id: str
    name: str
    quantity: int
    price: float


class OrderResponse(BaseModel):
    """Order response"""
    id: str
    items: List[OrderItem]
    total_amount: float
    status: str
    created_at: str


class PlaceOrderRequest(BaseModel):
    """Request to place an order (empty body, uses cart)"""
    pass


class PlaceOrderResponse(BaseModel):
    """Response when order is placed"""
    message: str
    order_id: str
    total_amount: float


# ==================== General Models ====================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: Optional[str] = None
