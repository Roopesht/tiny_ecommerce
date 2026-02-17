# Backend Architecture & Design

Complete architecture overview of the e-commerce backend application.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React)                       │
│  ├─ Firebase Auth (Email/Password)                 │
│  ├─ Login/Register Pages                           │
│  ├─ Product Browsing                               │
│  ├─ Shopping Cart                                  │
│  └─ Order Management                               │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS Requests
               │ Authorization: Bearer {token}
               ↓
┌─────────────────────────────────────────────────────┐
│     Backend (FastAPI on Cloud Run)                  │
│  ┌────────────────────────────────────────────────┐ │
│  │  API Routes (main.py)                          │ │
│  │  ├─ /health - Health checks                    │ │
│  │  ├─ /auth/* - User authentication              │ │
│  │  ├─ /products/* - Product catalog              │ │
│  │  ├─ /cart/* - Shopping cart                    │ │
│  │  └─ /orders/* - Order management               │ │
│  └────────────────────────────────────────────────┘ │
│                      ↑ ↓                             │
│  ┌────────────────────────────────────────────────┐ │
│  │  Middleware Layer                              │ │
│  │  ├─ CORS Middleware                            │ │
│  │  ├─ Authentication Middleware                  │ │
│  │  │   └─ Firebase Token Verification            │ │
│  │  └─ Logging Middleware                         │ │
│  │      └─ Structured JSON Logging                │ │
│  └────────────────────────────────────────────────┘ │
│                      ↑ ↓                             │
│  ┌────────────────────────────────────────────────┐ │
│  │  Business Logic Layer (routes/)                │ │
│  │  ├─ Authentication (auth.py)                   │ │
│  │  ├─ Products (products.py)                     │ │
│  │  ├─ Cart (cart.py)                             │ │
│  │  └─ Orders (orders.py)                         │ │
│  └────────────────────────────────────────────────┘ │
│                      ↑ ↓                             │
│  ┌────────────────────────────────────────────────┐ │
│  │  Data Layer (firestore.py)                     │ │
│  │  ├─ CRUD Operations                            │ │
│  │  ├─ Query Operations                           │ │
│  │  ├─ Batch Operations                           │ │
│  │  └─ Array Operations                           │ │
│  └────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────────┘
               │ REST API Calls
               ↓
┌─────────────────────────────────────────────────────┐
│       Google Cloud Services                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ Firestore Database (asia-south1)               │ │
│  │ ├─ users collection                            │ │
│  │ ├─ products collection                         │ │
│  │ ├─ carts collection                            │ │
│  │ └─ orders collection                           │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ Cloud Logging                                  │ │
│  │ └─ Structured JSON logs                        │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ Firebase Authentication                        │ │
│  │ └─ Token verification                          │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

```
Client Request
    ↓
CORS Middleware ─→ Check origin
    ↓
Logging Middleware ─→ Log request
    ↓
Routing ─→ Match endpoint
    ↓
Is Protected Route? ─→ YES ─→ Auth Middleware ─→ Verify Firebase Token
    ├─ Token valid? ─→ NO ─→ Return 401 Unauthorized
    └─ Token valid? ─→ YES ─→ Extract user info
    ↓
Route Handler ─→ Process business logic
    ├─ Validate input (Pydantic)
    ├─ Query/update database (Firestore)
    └─ Generate response
    ↓
Response Middleware ─→ Add CORS headers
    ↓
Logging Middleware ─→ Log response with timing
    ↓
Return to Client
```

---

## Application Layers

### 1. API Route Layer (`routes/`)

**Responsibilities:**
- Handle HTTP requests
- Validate request data with Pydantic schemas
- Call business logic
- Format responses

**Files:**
- `auth.py` - User authentication endpoints
- `products.py` - Product catalog endpoints
- `cart.py` - Shopping cart operations
- `orders.py` - Order management

**Pattern:**
```python
@router.get("/endpoint")
async def endpoint(current_user: FirebaseUser = Depends(get_current_user)):
    # Validate and process
    return response
```

### 2. Middleware Layer (`middleware/`)

**Responsibilities:**
- Authenticate requests
- Log requests/responses
- Handle CORS
- Error handling

**Files:**
- `auth.py` - Firebase token verification
- `logging.py` - Request/response logging

**Pattern:**
```python
async def middleware(request: Request, call_next):
    # Pre-processing
    response = await call_next(request)
    # Post-processing
    return response
```

### 3. Business Logic Layer (`firestore.py`)

**Responsibilities:**
- Database operations
- Data transformation
- Query logic
- Error handling

**Operations:**
- CRUD (Create, Read, Update, Delete)
- Queries (single condition, multiple conditions)
- Batch operations
- Array operations

**Pattern:**
```python
def get_document(collection: str, doc_id: str) -> Dict:
    # Get from Firestore
    # Transform data
    # Return
```

### 4. Data Model Layer (`models/`)

**Responsibilities:**
- Define request/response schemas
- Validate data types
- Document API contracts

**Files:**
- `schemas.py` - Pydantic models for all endpoints

**Pattern:**
```python
class UserResponse(BaseModel):
    uid: str
    email: str
    firstname: Optional[str] = None
```

### 5. Utility Layer (`utils/`)

**Responsibilities:**
- Logging setup
- Exception handling
- Helper functions

**Files:**
- `logger.py` - Structured logging
- `exceptions.py` - Custom exceptions

---

## Data Flow Examples

### Example 1: Adding Item to Cart

```
1. User clicks "Add to Cart"
   └─ Frontend sends: POST /cart/add
      with body: {product_id: "wireless_mouse", quantity: 1}

2. Middleware processes request
   ├─ CORS check ✓
   ├─ Log request
   └─ Verify Firebase token ✓

3. Route handler processes
   ├─ Validate request body (Pydantic)
   ├─ Verify product exists (Firestore query)
   ├─ Get user's current cart (Firestore read)
   ├─ Add item or update quantity
   ├─ Calculate totals
   ├─ Save to database (Firestore update)
   └─ Return response

4. Middleware returns
   ├─ Add CORS headers
   ├─ Log response (200 OK, 145ms)
   └─ Send to client

5. Response: {"message": "Item added", "total_amount": 1798}
```

### Example 2: Placing an Order

```
1. User clicks "Place Order"
   └─ Frontend sends: POST /orders/place

2. Middleware processes request
   ├─ Verify Firebase token ✓
   └─ Extract user ID

3. Route handler processes
   ├─ Get user's cart (Firestore read)
   ├─ Validate cart not empty
   ├─ Create order document
   │  ├─ Copy cart items
   │  ├─ Calculate total
   │  └─ Set status = "PLACED"
   ├─ Save order (Firestore create)
   ├─ Clear cart (Firestore update)
   └─ Return order_id

4. Middleware returns
   ├─ Log response (200 OK, 234ms)
   └─ Send to client

5. Response: {"order_id": "order_abc123", "total_amount": 1798}
```

---

## Database Schema Design

### Firestore Collections

#### users/{firebase_uid}
```
Purpose: Store user profiles
Access: User can read/write their own
Query: By UID (document ID)

Fields:
├─ uid: string
├─ email: string
├─ firstname: string
├─ lastname: string
├─ mobilenumber: string
├─ created_at: timestamp
└─ updated_at: timestamp
```

#### products/{product_id}
```
Purpose: Store product catalog
Access: Anyone can read, admin creates
Query: List all, get by ID

Fields:
├─ name: string
├─ description: string
├─ price: number
├─ image_url: string
├─ stock: number
├─ category: string
└─ created_at: timestamp
```

#### carts/{firebase_uid}
```
Purpose: Store shopping carts
Access: User can read/write their own
Query: By UID (document ID)

Fields:
├─ uid: string
├─ items: array[
│  ├─ product_id: string
│  ├─ name: string
│  ├─ price: number
│  ├─ quantity: number
│  └─ image_url: string
│ ]
└─ updated_at: timestamp
```

#### orders/{order_id}
```
Purpose: Store orders
Access: User can read their own, admin all
Query: Get user orders, get by ID

Fields:
├─ uid: string
├─ items: array[
│  ├─ product_id: string
│  ├─ name: string
│  ├─ quantity: number
│  └─ price: number
│ ]
├─ total_amount: number
├─ status: string (PLACED, PROCESSING, SHIPPED, DELIVERED)
├─ created_at: timestamp
└─ updated_at: timestamp
```

---

## API Endpoint Design

### Endpoint Categories

#### 1. Health Checks (Public)
```
GET  /health      → Service health
GET  /ready       → Readiness status
```

#### 2. Authentication (Protected: some)
```
GET  /auth/me           → Get current user (protected)
POST /auth/profile      → Update profile (protected)
```

#### 3. Products (Public)
```
GET  /products              → List all products
GET  /products/{product_id} → Get product details
```

#### 4. Shopping Cart (Protected)
```
GET  /cart              → Get user's cart
POST /cart/add          → Add item to cart
POST /cart/remove       → Remove item from cart
POST /cart/update       → Update quantity
```

#### 5. Orders (Protected)
```
POST /orders/place      → Place order from cart
GET  /orders            → Get user's orders
```

### Response Format

**Success Response (2xx):**
```json
{
  "data": {...},
  "message": "Success message"
}
```

**List Response:**
```json
[
  {"id": "...", "name": "..."},
  {"id": "...", "name": "..."}
]
```

**Error Response (4xx, 5xx):**
```json
{
  "detail": "Error message"
}
```

---

## Authentication Flow

```
1. User Signup/Login (Frontend)
   └─ Firebase creates user

2. Frontend gets ID token
   └─ firebase.auth().currentUser.getIdToken()

3. Frontend sends protected request
   └─ Authorization: Bearer {id_token}

4. Backend middleware verifies
   ├─ Extract token from header
   ├─ Call Firebase: verify_id_token(token)
   ├─ Extract uid and email
   └─ Pass to route handler

5. Route handler accesses user
   └─ current_user.uid, current_user.email

6. Filter by user ID
   └─ Only user can see their own data
```

---

## Configuration Management

```
.env.template  ─→  Template (reference)
    ↓
.env.local     ─→  Local development
    │               DEBUG logging
    │               localhost:3000 CORS
    ↓
config.py      ─→  Loads from .env
    │               Validates values
    │               Provides settings object
    ↓
.env.prod      ─→  Production
                    INFO logging
                    tinyy-ecommerce.web.app CORS
```

**Usage in code:**
```python
from config import settings

if settings.is_production:
    # Production behavior
else:
    # Development behavior
```

---

## Error Handling

```
HTTPException (FastAPI)
    ├─ 400 Bad Request (invalid input)
    ├─ 401 Unauthorized (auth failed)
    ├─ 404 Not Found (resource missing)
    └─ 500 Server Error

Custom Exceptions (utils/exceptions.py)
    ├─ NotFound
    ├─ Unauthorized
    ├─ BadRequest
    └─ InternalServerError

Global Exception Handler (main.py)
    └─ Catches all exceptions
       └─ Logs error
       └─ Returns JSON response
```

---

## Logging Architecture

```
Application
    ↓
Logger (utils/logger.py)
    ├─ Local: Console output
    └─ Production: Google Cloud Logging
    ↓
Structured Format
    ├─ timestamp
    ├─ severity (INFO, WARNING, ERROR)
    ├─ type (request, error, database)
    └─ additional fields
    ↓
Cloud Logging
    └─ Searchable, filterable, analyzable
```

**Log Types:**
```
request    → API request/response
error      → Exception/error
database   → Firestore operations
auth       → Authentication events
```

---

## Security Architecture

```
Request
    ↓
CORS Check
    └─ Only allowed origins accepted
    ↓
Authentication (if protected)
    └─ Firebase token required
    └─ Token signature verified
    └─ Token expiration checked
    ↓
Input Validation
    └─ Pydantic schema validation
    └─ Type checking
    ↓
Database Access
    └─ User ID filtering
    └─ Firestore security rules
    ↓
Response
    └─ No sensitive data in errors
    └─ CORS headers added
```

---

## Deployment Architecture

```
Source Code
    ↓
Docker Build
    ├─ Multi-stage build
    ├─ Dependencies installed
    └─ Application copied
    ↓
Docker Image
    └─ Pushed to GCR
    ↓
Cloud Run
    ├─ Auto-scaling
    ├─ Health checks
    └─ Environment variables
    ↓
Cloud Firestore
    └─ Database operations
    ↓
Cloud Logging
    └─ Structured logs
    ↓
Monitoring & Alerts
```

---

## Performance Considerations

### Request Processing
- Async/await for I/O operations
- Firestore operations are non-blocking
- Database connection pooling (automatic)

### Database
- Composite indexes for complex queries
- Document size limits respected
- Batch operations for bulk updates

### Caching (Future)
- Cache products (infrequently change)
- Cache user profiles
- Invalidate on update

### Scaling
- Cloud Run auto-scales 0-100 instances
- Firestore auto-scales
- Load balancing automatic

---

## Testing Architecture

```
Unit Tests
    ├─ test_health.py
    │  ├─ Health endpoint tests
    │  ├─ API docs availability
    │  └─ CORS configuration
    └─ No database required

Integration Tests (not yet)
    ├─ Full request/response cycle
    ├─ Database interaction
    └─ Authentication flow

Load Tests (optional)
    ├─ Concurrent requests
    ├─ Performance benchmarks
    └─ Scaling validation
```

---

## Code Organization Principles

### 1. Separation of Concerns
- Routes handle HTTP
- Models validate data
- Firestore handles database
- Middleware handles cross-cutting

### 2. DRY (Don't Repeat Yourself)
- Shared functions in firestore.py
- Schemas in models/schemas.py
- Logging setup in utils/logger.py

### 3. SOLID Principles
- Single Responsibility: Each module has one purpose
- Dependency Injection: Middleware passes dependencies
- Interface Segregation: Small focused functions

### 4. Documentation
- Docstrings on all functions
- Type hints on all parameters
- Comments on complex logic

---

## Future Enhancement Paths

```
Current (Phase 1)
├─ Core CRUD operations ✓
├─ User authentication ✓
└─ Basic ordering ✓

Phase 2: Features
├─ Advanced search
├─ Filtering by category
├─ User reviews/ratings
└─ Wishlist

Phase 3: Payments
├─ Stripe integration
├─ Payment processing
├─ Order status tracking
└─ Refunds

Phase 4: Scale
├─ Caching layer
├─ Read replicas
├─ Analytics pipeline
└─ Admin dashboard
```

---

**Architecture Status**: ✅ Production Ready
**Design Pattern**: Layered Architecture with Middleware
**Scalability**: Horizontal (via Cloud Run)
**Performance**: Optimized for typical e-commerce loads
