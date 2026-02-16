"""
Structured logging setup for local and Google Cloud environments.

Configures logging to output JSON for easy parsing in Cloud Logging.
"""

import logging
import json
from datetime import datetime
from google.cloud import logging as cloud_logging
import os


def setup_logging(service_name: str = "ecommerce-backend") -> logging.Logger:
    """
    Setup structured logging for development and production.

    In production (ENVIRONMENT=production), uses Google Cloud Logging.
    In development, uses console logging with JSON format.

    Args:
        service_name: Name of the service for logging

    Returns:
        Configured logger instance
    """
    # Get environment
    environment = os.getenv("ENVIRONMENT", "development")

    if environment == "production":
        try:
            # Use Google Cloud Logging in production
            client = cloud_logging.Client()
            client.setup_logging()
            logger = logging.getLogger(service_name)
            logger.info("Using Google Cloud Logging")
            return logger
        except Exception as e:
            print(f"Warning: Could not setup Google Cloud Logging: {e}")
            # Fall back to console logging
            print("Falling back to console logging")

    # Configure root logger for console output
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    return logging.getLogger(service_name)


def log_structured(
    logger: logging.Logger,
    level: str,
    log_type: str,
    **kwargs
):
    """
    Log structured JSON data.

    Args:
        logger: Logger instance
        level: Log level (info, warning, error, debug)
        log_type: Type of log (api_request, error, database, auth, etc.)
        **kwargs: Additional fields to include in log

    Example:
        log_structured(
            logger,
            "info",
            "product_viewed",
            product_id="prod_123",
            user_id="user_456"
        )
    """
    log_data = {
        "type": log_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **kwargs
    }

    level_func = getattr(logger, level.lower(), logger.info)
    level_func(json.dumps(log_data))


class StructuredLogger:
    """Convenience class for structured logging"""

    def __init__(self, logger: logging.Logger):
        """Initialize with logger instance"""
        self.logger = logger

    def log(self, level: str, log_type: str, **kwargs):
        """Log structured data"""
        log_structured(self.logger, level, log_type, **kwargs)

    def info(self, log_type: str, **kwargs):
        """Log info level"""
        self.log("info", log_type, **kwargs)

    def warning(self, log_type: str, **kwargs):
        """Log warning level"""
        self.log("warning", log_type, **kwargs)

    def error(self, log_type: str, **kwargs):
        """Log error level"""
        self.log("error", log_type, **kwargs)

    def debug(self, log_type: str, **kwargs):
        """Log debug level"""
        self.log("debug", log_type, **kwargs)
