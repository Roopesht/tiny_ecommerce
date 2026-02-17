# Backend Implementation Details & Addendum

Complete implementation guide with code examples, patterns, and best practices.

## Table of Contents
1. Project Structure Setup
2. Middleware Implementation
3. Authentication & Authorization
4. Database Operations
5. Error Handling
6. Logging & Monitoring
7. API Patterns
8. Testing Strategy
9. Performance Optimization
10. Security Hardening

---

## 1. Project Structure Setup

### 1.1 Create Directory Structure

```bash
cd backend

# Create directories
mkdir -p middleware utils routes models scripts data docs
mkdir -p tests/unit tests/integration
```

### 1.2 Update requirements.txt

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
firebase-admin==6.2.0
google-cloud-logging==3.8.0
google-cloud-error-reporting==1.10.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
```

### 1.3 Initialize Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 2. Middleware Implementation

### 2.1 Authentication Middleware (`middleware/auth.py`)

```python
from fastapi import HTTPException, Header, Depends
from firebase_admin import auth as firebase_auth
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

class FirebaseUser:
    """Represents authenticated Firebase user"""
    def __init__(self, uid: str, email: str, email_verified: bool):
        self.uid = uid
        self.email = email
        self.email_verified = email_verified

async def verify_firebase_token(
    authorization: Optional[str] = Header(None)
) -> FirebaseUser:
    """
    Verify Firebase ID token from Authorization header.

    Expected format: Authorization: Bearer {firebase_id_token}

    Returns FirebaseUser object with uid and email
    Raises HTTPException with 401 if token is invalid
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
            detail="Invalid Authorization header format"
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
            detail="Token expired"
        )

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Token verification failed"
        )

# Dependency for protected routes
def get_current_user(user: FirebaseUser = Depends(verify_firebase_token)) -> FirebaseUser:
    """Dependency to inject authenticated user into route"""
    return user
```

### 2.2 Logging Middleware (`middleware/logging.py`)

```python
import time
import json
import logging
from fastapi import Request
from typing import Callable

logger = logging.getLogger(__name__)

async def log_requests_middleware(request: Request, call_next: Callable):
    """
    Log all incoming requests with response details.

    Logs:
    - Request method, path, query params
    - Response status code
    - Request duration
    - User ID (if authenticated)
    """
    start_time = time.time()

    # Get user ID from Authorization header if present
    auth_header = request.headers.get("authorization", "")
    user_id = "anonymous"

    # Extract request body if POST/PUT (for debugging)
    request_body = ""
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            request_body = await request.body()
        except:
            request_body = ""

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000

    # Log structured request data
    log_data = {
        "type": "request",
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": round(duration_ms, 2),
        "user_id": user_id,
        "timestamp": time.time()
    }

    # Log at different levels based on status code
    if response.status_code >= 500:
        logger.error(json.dumps(log_data))
    elif response.status_code >= 400:
        logger.warning(json.dumps(log_data))
    else:
        logger.info(json.dumps(log_data))

    return response
```

---

## 3. Authentication & Authorization

### 3.1 Config Management (`config.py`)

```python
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application configuration from environment variables"""

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Firebase
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "test-99u1b3")
    google_application_credentials: str = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS",
        "service-account.json"
    )

    # CORS
    cors_origins: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    )

    # Server
    api_port: int = int(os.getenv("PORT", 8080))
    api_host: str = "0.0.0.0"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### 3.2 Updated Auth Routes (`routes/auth.py`)

```python
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from middleware.auth import get_current_user, FirebaseUser
from firestore import get_document, add_document, update_document
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

# Schemas
class UserProfile(BaseModel):
    firstname: str
    lastname: str
    mobilenumber: str

class UserResponse(BaseModel):
    uid: str
    email: str
    firstname: str = None
    lastname: str = None
    mobilenumber: str = None

# Routes

@router.get("/me", response_model=UserResponse, status_code=200)
async def get_current_user_profile(current_user: FirebaseUser = Depends(get_current_user)):
    """Get current authenticated user profile"""
    try:
        # Fetch user data from Firestore
        user_doc = get_document("users", current_user.uid)

        if not user_doc:
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
    """Create or update user profile"""
    try:
        user_data = {
            "uid": current_user.uid,
            "email": current_user.email,
            "firstname": profile.firstname,
            "lastname": profile.lastname,
            "mobilenumber": profile.mobilenumber,
            "updated_at": datetime.utcnow()
        }

        # Check if user exists
        existing = get_document("users", current_user.uid)

        if existing:
            # Update existing user
            update_document("users", current_user.uid, user_data)
            logger.info(f"Updated profile for user: {current_user.uid}")
        else:
            # Create new user
            user_data["created_at"] = datetime.utcnow()
            add_document("users", user_data, doc_id=current_user.uid)
            logger.info(f"Created profile for user: {current_user.uid}")

        return {
            "message": "Profile updated successfully",
            "uid": current_user.uid
        }

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating profile"
        )
```

---

## 4. Database Operations

### 4.1 Enhanced Firestore Helper (`firestore.py`)

```python
import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase
cred = credentials.Certificate(
    os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")
)

firebase_admin.initialize_app(cred, {
    "projectId": os.getenv("FIREBASE_PROJECT_ID", "test-99u1b3")
})

db = firestore.client()

# ==================== Basic Operations ====================

def get_document(collection: str, doc_id: str) -> Optional[Dict]:
    """Fetch single document by ID"""
    try:
        doc = db.collection(collection).document(doc_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None
    except Exception as e:
        logger.error(f"Error fetching {collection}/{doc_id}: {str(e)}")
        raise

def get_all_documents(collection: str, limit: int = 50) -> List[Dict]:
    """Fetch all documents from collection with pagination"""
    try:
        docs = db.collection(collection).limit(limit).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        logger.error(f"Error fetching all {collection}: {str(e)}")
        raise

def add_document(collection: str, data: Dict, doc_id: Optional[str] = None) -> str:
    """Add new document to collection"""
    try:
        if doc_id:
            db.collection(collection).document(doc_id).set(data)
            logger.info(f"Added document {doc_id} to {collection}")
            return doc_id
        else:
            _, doc_ref = db.collection(collection).add(data)
            logger.info(f"Added document {doc_ref.id} to {collection}")
            return doc_ref.id
    except Exception as e:
        logger.error(f"Error adding to {collection}: {str(e)}")
        raise

def update_document(collection: str, doc_id: str, data: Dict) -> None:
    """Update existing document"""
    try:
        db.collection(collection).document(doc_id).update(data)
        logger.info(f"Updated {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error updating {collection}/{doc_id}: {str(e)}")
        raise

def delete_document(collection: str, doc_id: str) -> None:
    """Delete document"""
    try:
        db.collection(collection).document(doc_id).delete()
        logger.info(f"Deleted {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error deleting {collection}/{doc_id}: {str(e)}")
        raise

# ==================== Query Operations ====================

def query_documents(
    collection: str,
    field: str,
    operator: str,
    value: Any
) -> List[Dict]:
    """Query documents with single condition"""
    try:
        docs = db.collection(collection).where(field, operator, value).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        logger.error(f"Error querying {collection}: {str(e)}")
        raise

def query_multiple_conditions(
    collection: str,
    conditions: List[tuple]
) -> List[Dict]:
    """Query with multiple conditions"""
    try:
        query = db.collection(collection)
        for field, operator, value in conditions:
            query = query.where(field, operator, value)

        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        logger.error(f"Error querying {collection}: {str(e)}")
        raise

# ==================== Batch Operations ====================

def batch_update_documents(collection: str, updates: Dict[str, Dict]) -> None:
    """Update multiple documents in batch"""
    try:
        batch = db.batch()
        for doc_id, data in updates.items():
            batch.update(db.collection(collection).document(doc_id), data)
        batch.commit()
        logger.info(f"Batch updated {len(updates)} documents in {collection}")
    except Exception as e:
        logger.error(f"Error in batch update: {str(e)}")
        raise

def batch_delete_documents(collection: str, doc_ids: List[str]) -> None:
    """Delete multiple documents in batch"""
    try:
        batch = db.batch()
        for doc_id in doc_ids:
            batch.delete(db.collection(collection).document(doc_id))
        batch.commit()
        logger.info(f"Batch deleted {len(doc_ids)} documents from {collection}")
    except Exception as e:
        logger.error(f"Error in batch delete: {str(e)}")
        raise

# ==================== Array Operations ====================

def add_to_array(collection: str, doc_id: str, field: str, value: Any) -> None:
    """Add value to array field"""
    try:
        db.collection(collection).document(doc_id).update({
            field: firestore.ArrayUnion([value])
        })
        logger.info(f"Added to {field} in {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error adding to array: {str(e)}")
        raise

def remove_from_array(collection: str, doc_id: str, field: str, value: Any) -> None:
    """Remove value from array field"""
    try:
        db.collection(collection).document(doc_id).update({
            field: firestore.ArrayRemove([value])
        })
        logger.info(f"Removed from {field} in {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error removing from array: {str(e)}")
        raise

# ==================== Timestamp Operations ====================

def get_server_timestamp():
    """Get server timestamp"""
    return firestore.SERVER_TIMESTAMP
```

---

## 5. Error Handling

### 5.1 Custom Exception Classes

```python
# utils/exceptions.py
from fastapi import HTTPException
from typing import Optional

class APIException(HTTPException):
    """Base API exception"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class NotFound(APIException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=404,
            detail=f"{resource} not found",
            error_code="NOT_FOUND"
        )

class Unauthorized(APIException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="UNAUTHORIZED"
        )

class BadRequest(APIException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="BAD_REQUEST"
        )

class InternalServerError(APIException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="INTERNAL_ERROR"
        )
```

### 5.2 Global Exception Handler

```python
# In main.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle uncaught exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

## 6. Logging & Monitoring

### 6.1 Structured Logging Setup (`utils/logger.py`)

```python
import logging
import json
from google.cloud import logging as cloud_logging
import os

def setup_logging():
    """Setup structured logging for local and cloud"""

    if os.getenv("ENVIRONMENT") == "production":
        # Use Google Cloud Logging
        client = cloud_logging.Client()
        client.setup_logging()

    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    return logging.getLogger(__name__)

def log_structured(
    logger,
    level: str,
    log_type: str,
    **kwargs
):
    """Log structured JSON data"""
    log_data = {
        "type": log_type,
        "timestamp": datetime.utcnow().isoformat(),
        **kwargs
    }

    level_func = getattr(logger, level.lower())
    level_func(json.dumps(log_data))

# Usage
logger = setup_logging()
log_structured(
    logger,
    "info",
    "product_viewed",
    product_id="prod_123",
    user_id="user_456"
)
```

---

## 7. API Patterns

### 7.1 Standard Response Format

```python
# utils/responses.py
from pydantic import BaseModel
from typing import Any, Optional

class APIResponse(BaseModel):
    """Standard API response format"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    status_code: int

# Usage in routes
@router.get("/products")
async def list_products():
    try:
        products = get_all_documents("products")
        return APIResponse(
            success=True,
            data=products,
            status_code=200
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            status_code=500
        )
```

### 7.2 Pagination Pattern

```python
# utils/pagination.py
from pydantic import BaseModel
from typing import List, Any

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

def paginate_results(
    items: List[Any],
    page: int = 1,
    page_size: int = 20
) -> PaginatedResponse:
    total = len(items)
    total_pages = (total + page_size - 1) // page_size

    start = (page - 1) * page_size
    end = start + page_size

    return PaginatedResponse(
        items=items[start:end],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (`tests/unit/test_auth.py`)

```python
import pytest
from unittest.mock import patch, MagicMock
from routes.auth import get_current_user_profile
from middleware.auth import FirebaseUser

@pytest.fixture
def mock_user():
    return FirebaseUser(
        uid="test_uid",
        email="test@example.com",
        email_verified=True
    )

@pytest.fixture
def mock_get_document():
    with patch('routes.auth.get_document') as mock:
        mock.return_value = {
            "uid": "test_uid",
            "email": "test@example.com",
            "firstname": "John",
            "lastname": "Doe"
        }
        yield mock

def test_get_current_user_profile(mock_user, mock_get_document):
    # Implementation
    pass

def test_get_user_profile_not_found(mock_user):
    with patch('routes.auth.get_document', return_value=None):
        with pytest.raises(HTTPException) as exc:
            # Test implementation
            pass
        assert exc.value.status_code == 404
```

### 8.2 Integration Tests

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_products_endpoint():
    response = client.get("/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

---

## 9. Performance Optimization

### 9.1 Connection Pooling

Firestore automatically handles connection pooling. No additional configuration needed.

### 9.2 Caching Strategy

```python
# utils/cache.py
from functools import lru_cache
from datetime import datetime, timedelta

class TTLCache:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl_seconds = ttl_seconds
        self.cache = {}
        self.timestamps = {}

    def get(self, key: str):
        if key not in self.cache:
            return None

        # Check if expired
        if datetime.now() - self.timestamps[key] > timedelta(seconds=self.ttl_seconds):
            del self.cache[key]
            del self.timestamps[key]
            return None

        return self.cache[key]

    def set(self, key: str, value):
        self.cache[key] = value
        self.timestamps[key] = datetime.now()

# Usage
products_cache = TTLCache(ttl_seconds=300)

@router.get("/products")
async def list_products():
    cached = products_cache.get("all_products")
    if cached:
        return cached

    products = get_all_documents("products")
    products_cache.set("all_products", products)
    return products
```

### 9.3 Query Optimization

```python
# Best practices
# 1. Use indexed fields
# 2. Limit result sets
# 3. Filter at database level

@router.get("/products/category/{category}")
async def get_by_category(category: str, limit: int = 50):
    # Good: Filter at database level
    products = query_documents("products", "category", "==", category)
    return products[:limit]

# Bad: Fetch all then filter
# products = get_all_documents("products")
# return [p for p in products if p["category"] == category]
```

---

## 10. Security Hardening

### 10.1 Input Validation

```python
from pydantic import BaseModel, Field, validator

class CreateProductRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)

    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

### 10.2 Rate Limiting (Future Enhancement)

```python
# Installation: pip install slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/products")
@limiter.limit("100/minute")
async def list_products(request: Request):
    # Implementation
    pass
```

### 10.3 CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware
from config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)
```

### 10.4 HTTPS Enforcement (Production)

```python
# In main.py for production
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

if settings.is_production:
    app.add_middleware(HTTPSRedirectMiddleware)
```

---

## Environment Variables Template

Create `.env.template`:

```
# Environment
ENVIRONMENT=development
PORT=8080

# Firebase
FIREBASE_PROJECT_ID=test-99u1b3
GOOGLE_APPLICATION_CREDENTIALS=service-account.json

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging
LOG_LEVEL=INFO
```

---

## Useful Commands

```bash
# Run with auto-reload
uvicorn main:app --reload --port 8080

# Run production
uvicorn main:app --host 0.0.0.0 --port 8080

# Run tests
pytest tests/

# Run tests with coverage
pytest --cov=routes tests/

# Format code
black .

# Lint
pylint routes/ models/ middleware/
```

---

## Common Patterns & Anti-Patterns

### ✅ DO

- Use dependency injection for middleware
- Handle all exceptions explicitly
- Log all errors with context
- Validate input at API boundary
- Use type hints throughout
- Cache frequently accessed data
- Use async/await for I/O operations
- Document API endpoints

### ❌ DON'T

- Hardcode configuration values
- Catch all exceptions silently
- Trust user input without validation
- Return raw error messages to clients
- Make synchronous external API calls
- Commit secrets to repository
- Skip error logging
- Use mutable default arguments

---

## Debugging Tips

**1. View Firestore Operations:**
```python
import logging
logging.getLogger("google.cloud.firestore").setLevel(logging.DEBUG)
```

**2. Log Request/Response Bodies:**
```python
# Enable in middleware during development
print(f"Request: {request.method} {request.url.path}")
print(f"Body: {await request.body()}")
print(f"Response Status: {response.status_code}")
```

**3. Test Firebase Token:**
```python
from firebase_admin import auth
token = auth.create_custom_token("test_uid")
print(token)
```

---

## Production Checklist

- [ ] All secrets in Secret Manager
- [ ] CORS origins properly configured
- [ ] Error logging to Cloud Logging
- [ ] Health check endpoints working
- [ ] Database indexes created
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Monitoring dashboards setup
- [ ] Alert policies created
- [ ] Rollback plan documented
