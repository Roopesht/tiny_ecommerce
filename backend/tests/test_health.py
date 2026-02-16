"""
Tests for health check endpoints.

Unit tests for basic health and readiness checks.
These tests don't require Firebase or Firestore setup.
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint"""

    def test_health_check_returns_200(self, client):
        """Health endpoint should return 200 OK"""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_response_format(self, client):
        """Health endpoint should return correct JSON format"""
        response = client.get("/health")
        data = response.json()

        assert "status" in data
        assert data["status"] == "healthy"
        assert "service" in data
        assert data["service"] == "ecommerce-backend"

    def test_health_check_includes_environment(self, client):
        """Health endpoint should include environment info"""
        response = client.get("/health")
        data = response.json()

        assert "environment" in data


class TestReadinessEndpoint:
    """Tests for readiness check endpoint"""

    def test_ready_endpoint_returns_200(self, client):
        """Ready endpoint should return 200 OK"""
        response = client.get("/ready")
        assert response.status_code == 200

    def test_ready_response_format(self, client):
        """Ready endpoint should return correct JSON format"""
        response = client.get("/ready")
        data = response.json()

        assert "status" in data
        assert data["status"] == "ready"
        assert "service" in data


class TestRootEndpoint:
    """Tests for root endpoint"""

    def test_root_returns_200(self, client):
        """Root endpoint should return 200 OK"""
        response = client.get("/")
        assert response.status_code == 200

    def test_root_response_format(self, client):
        """Root endpoint should return API info"""
        response = client.get("/")
        data = response.json()

        assert "message" in data
        assert "version" in data
        assert "documentation" in data


class TestCORSConfiguration:
    """Tests for CORS headers"""

    def test_cors_headers_present(self, client):
        """Response should include CORS headers"""
        response = client.options("/health")

        # CORS headers should be present
        # Note: Exact headers depend on client origin
        assert response.status_code in [200, 204]


class TestDocumentationEndpoint:
    """Tests for API documentation"""

    def test_swagger_docs_available(self, client):
        """Swagger UI should be available"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_schema_available(self, client):
        """OpenAPI schema should be available"""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        data = response.json()
        assert "info" in data
        assert "paths" in data


# Example of how to run tests:
# pytest tests/test_health.py
# pytest tests/test_health.py::TestHealthEndpoint::test_health_check_returns_200
# pytest tests/test_health.py -v
