"""
Product routes.

Handles product listing and retrieval endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from models.schemas import ProductResponse
from firestore import get_document, get_all_documents
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse], status_code=200)
async def list_products(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    List all products with pagination.

    Returns a paginated list of all available products.

    Args:
        limit: Maximum number of products to return (1-200, default 50)
        offset: Number of products to skip (default 0)

    Returns:
        List of ProductResponse objects

    Raises:
        500: Database error
    """
    try:
        products = get_all_documents("products", limit=limit, offset=offset)
        logger.info(f"Listed {len(products)} products (offset={offset}, limit={limit})")
        return products

    except Exception as e:
        logger.error(f"Error listing products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching products"
        )


@router.get("/{product_id}", response_model=ProductResponse, status_code=200)
async def get_product_details(product_id: str):
    """
    Get detailed information about a specific product.

    Args:
        product_id: The product ID to retrieve

    Returns:
        ProductResponse with product details

    Raises:
        404: Product not found
        500: Database error
    """
    try:
        product = get_document("products", product_id)

        if not product:
            logger.warning(f"Product not found: {product_id}")
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        logger.info(f"Retrieved product: {product_id}")
        return product

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching product"
        )
