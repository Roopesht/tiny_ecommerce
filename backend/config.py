"""
Application configuration management.

Loads configuration from environment variables using pydantic.
Supports both development and production environments.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application configuration from environment variables"""

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Firebase Configuration
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "test-99u1b3")
    google_application_credentials: str = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS",
        "service-account.json"
    )

    # CORS Configuration
    cors_origins: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    # Server Configuration
    api_port: int = int(os.getenv("PORT", 8080))
    api_host: str = "0.0.0.0"

    # Logging Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.environment == "development"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Load settings
settings = Settings()
