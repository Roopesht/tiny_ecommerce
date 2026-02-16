"""
E-Commerce Backend API - Main Application Entry Point.

FastAPI application for the e-commerce platform.
Handles authentication, products, cart, and orders.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from utils.logger import setup_logging
from middleware.logging import log_requests_middleware
from routes import auth, products, cart, orders
import logging

# Setup logging
logger = setup_logging()
logger.info(f"Starting application in {settings.environment} environment")

# Create FastAPI app
app = FastAPI(
    title="E-Commerce Backend API",
    description="Production-ready e-commerce backend with Firebase auth",
    version="1.0.0"
)

# ==================== Middleware ====================

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600
)

# Add request logging middleware
app.middleware("http")(log_requests_middleware)

# ==================== Exception Handlers ====================


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with structured response"""
    logger.error(f"HTTP Exception {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# ==================== Health Check Routes ====================


@app.get("/health")
async def health_check():
    """
    Health check endpoint for load balancers.

    Used by Cloud Run and other health check systems.
    """
    logger.debug("Health check endpoint called")
    return {
        "status": "healthy",
        "service": "ecommerce-backend",
        "environment": settings.environment
    }


@app.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.

    Verifies that the service is ready to handle requests.
    Can be extended to check database connectivity.
    """
    try:
        logger.debug("Readiness check endpoint called")
        # Add database connectivity check here if needed
        return {
            "status": "ready",
            "service": "ecommerce-backend"
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Service not ready"
        )

# ==================== API Routes ====================

# Include route modules
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)

# ==================== Root Route ====================


@app.get("/")
async def root():
    """
    Root endpoint - API information.

    Provides basic information about the API.
    """
    return {
        "message": "E-Commerce Backend API",
        "version": "1.0.0",
        "documentation": "/docs",
        "environment": settings.environment
    }

# ==================== Startup/Shutdown ====================


@app.on_event("startup")
async def startup_event():
    """
    Application startup event.

    Initializes required services and resources.
    """
    logger.info("Application startup")
    logger.info(f"CORS origins: {settings.cors_origins_list}")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event.

    Cleans up resources.
    """
    logger.info("Application shutdown")


# ==================== Entry Point ====================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )
