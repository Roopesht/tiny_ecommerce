# API Validation & Testing Guide

Complete guide for testing the e-commerce backend API with examples and use cases.

## Quick Start

### 1. Get API Base URL

**Local Development:**
```
http://localhost:8080
```

**Cloud Deployment:**
```
https://ecommerce-backend-xxxxx.asia-south1.run.app
```

### 2. Access API Documentation

Open in browser:
```
{BASE_URL}/docs
```

This opens Swagger UI with interactive API explorer.

---

## Authentication

### Getting a Firebase ID Token

For protected endpoints, you need a Firebase ID token.

**From Frontend:**
```javascript
const token = await firebase.auth().currentUser.getIdToken();
console.log(token);
```

**Using Firebase CLI:**
```bash
firebase auth:export tokens.json --project test-99u1b3
```

### Adding Token to Requests

All protected endpoints require Authorization header:

```
Authorization: Bearer {firebase_id_token}
```

Example with curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/auth/me
```

---

## API Endpoints Testing

### Health & Status

#### Health Check (Public)

```bash
curl http://localhost:8080/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "ecommerce-backend",
  "environment": "development"
}
```

---

### Authentication Routes

#### 1. Get Current User Profile (Protected)

```bash
curl -X GET \
  -H "Authorization: Bearer {token}" \
  http://localhost:8080/auth/me
```

**Response (200 OK):**
```json
{
  "uid": "firebase_uid_123",
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "mobilenumber": "1234567890"
}
```

**Errors:**
- **401 Unauthorized**: Token invalid or missing
- **404 Not Found**: User profile doesn't exist
- **500 Error**: Database error

#### 2. Create/Update User Profile (Protected)

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "mobilenumber": "9876543210"
  }' \
  http://localhost:8080/auth/profile
```

**Request Body:**
```json
{
  "firstname": "string (required, 1-100 chars)",
  "lastname": "string (required, 1-100 chars)",
  "mobilenumber": "string (required, 10-20 chars)"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile created successfully",
  "uid": "firebase_uid_123"
}
```

---

### Product Routes

#### 1. List All Products (Public)

```bash
curl "http://localhost:8080/products?limit=10&offset=0"
```

**Query Parameters:**
- `limit`: Number of products (default 50, max 200)
- `offset`: Skip first N products (default 0)

**Response (200 OK):**
```json
[
  {
    "id": "wireless_mouse",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with 2.4GHz connectivity",
    "price": 899,
    "image_url": "https://...",
    "stock": 50,
    "category": "Electronics",
    "created_at": "2024-01-15T10:30:00Z"
  },
  ...
]
```

**Errors:**
- **500 Error**: Database error

#### 2. Get Product Details (Public)

```bash
curl http://localhost:8080/products/wireless_mouse
```

**Response (200 OK):**
```json
{
  "id": "wireless_mouse",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with 2.4GHz connectivity",
  "price": 899,
  "image_url": "https://...",
  "stock": 50,
  "category": "Electronics",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- **404 Not Found**: Product doesn't exist
- **500 Error**: Database error

---

### Shopping Cart Routes

#### 1. Get User Cart (Protected)

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/cart
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "product_id": "wireless_mouse",
      "name": "Wireless Mouse",
      "price": 899,
      "quantity": 2,
      "image_url": "https://..."
    }
  ],
  "total_items": 2,
  "total_amount": 1798
}
```

#### 2. Add Item to Cart (Protected)

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "wireless_mouse",
    "quantity": 2
  }' \
  http://localhost:8080/cart/add
```

**Request Body:**
```json
{
  "product_id": "string (required)",
  "quantity": "integer (required, >= 1)"
}
```

**Response (200 OK):**
```json
{
  "message": "Item added to cart",
  "total_items": 2,
  "total_amount": 1798
}
```

**Errors:**
- **404 Not Found**: Product not found
- **400 Bad Request**: Invalid quantity
- **500 Error**: Database error

#### 3. Remove Item from Cart (Protected)

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "wireless_mouse"}' \
  http://localhost:8080/cart/remove
```

**Request Body:**
```json
{
  "product_id": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "message": "Item removed from cart"
}
```

**Errors:**
- **404 Not Found**: Product not in cart
- **500 Error**: Database error

#### 4. Update Cart Item Quantity (Protected)

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "wireless_mouse",
    "quantity": 5
  }' \
  http://localhost:8080/cart/update
```

**Request Body:**
```json
{
  "product_id": "string (required)",
  "quantity": "integer (required, >= 0)"
}
```

**Response (200 OK):**
```json
{
  "message": "Cart updated"
}
```

**Note:** If quantity is 0, the item is removed from cart.

---

### Order Routes

#### 1. Place Order (Protected)

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  http://localhost:8080/orders/place
```

**Request Body:** Empty object (uses items from cart)

**Response (200 OK):**
```json
{
  "message": "Order placed successfully",
  "order_id": "order_abc123def456",
  "total_amount": 1798
}
```

**Errors:**
- **400 Bad Request**: Cart is empty
- **500 Error**: Database error

**Note:** Cart is automatically cleared after successful order.

#### 2. Get User Orders (Protected)

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/orders
```

**Response (200 OK):**
```json
[
  {
    "id": "order_abc123def456",
    "items": [
      {
        "product_id": "wireless_mouse",
        "name": "Wireless Mouse",
        "quantity": 2,
        "price": 899
      }
    ],
    "total_amount": 1798,
    "status": "PLACED",
    "created_at": "2024-01-15T14:30:00Z"
  }
]
```

**Errors:**
- **500 Error**: Database error

---

## Testing Workflows

### Workflow 1: Browse & Add to Cart

```bash
BASE_URL="http://localhost:3000"

# 1. List products
curl "$BASE_URL/products?limit=10"

# 2. View product details
curl "$BASE_URL/products/wireless_mouse"

# 3. Add to cart (need token)
TOKEN="..."
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "wireless_mouse", "quantity": 1}' \
  "$BASE_URL/cart/add"

# 4. View cart
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/cart"
```

### Workflow 2: Complete Purchase

```bash
BASE_URL="http://localhost:8080"
TOKEN="..."

# 1. Add items to cart
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "wireless_mouse", "quantity": 2}' \
  "$BASE_URL/cart/add"

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "mechanical_keyboard", "quantity": 1}' \
  "$BASE_URL/cart/add"

# 2. Review cart
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/cart"

# 3. Place order
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$BASE_URL/orders/place"

# 4. View order history
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/orders"
```

### Workflow 3: User Profile Management

```bash
BASE_URL="http://localhost:8080"
TOKEN="..."

# 1. Get current profile
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me"

# 2. Update profile
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "mobilenumber": "9876543210"
  }' \
  "$BASE_URL/auth/profile"

# 3. Verify update
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me"
```

---

## Testing with Postman

### 1. Import Collection

**Option A: Import via URL**
```
N/A - Use the raw API from /docs endpoint
```

**Option B: Create Collection Manually**

1. Open Postman
2. Create new collection: "E-Commerce API"
3. Create folder: "Public"
4. Create folder: "Protected"
5. Add requests below

### 2. Add Environment Variables

In Postman, create environment with variables:

```
baseUrl = http://localhost:8080
token = {Your Firebase ID Token}
```

### 3. Sample Requests

**Get Products:**
- Method: GET
- URL: `{{baseUrl}}/products?limit=50`
- No Auth needed

**Add to Cart:**
- Method: POST
- URL: `{{baseUrl}}/cart/add`
- Headers: `Authorization: Bearer {{token}}`
- Body (JSON):
  ```json
  {
    "product_id": "wireless_mouse",
    "quantity": 1
  }
  ```

**Place Order:**
- Method: POST
- URL: `{{baseUrl}}/orders/place`
- Headers: `Authorization: Bearer {{token}}`
- Body (JSON): `{}`

---

## Response Status Codes

| Code | Meaning | Examples |
|------|---------|----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid data, empty cart |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | Product/profile doesn't exist |
| 500 | Server Error | Database error, server issue |

---

## Common Testing Issues

### Issue: "401 Unauthorized"

**Cause:** Token is invalid or expired

**Solution:**
1. Get a fresh token
2. Ensure Authorization header format: `Bearer {token}`
3. Check token hasn't expired (valid for 1 hour)

### Issue: "404 Not Found" when adding product to cart

**Cause:** Product ID doesn't exist

**Solution:**
1. Verify product exists: `GET /products`
2. Copy exact product ID
3. Use correct ID in cart request

### Issue: "400 Bad Request" when placing order

**Cause:** Cart is empty

**Solution:**
1. Add items to cart first
2. Verify with `GET /cart`
3. Check items have quantity > 0

### Issue: "500 Internal Server Error"

**Cause:** Server-side error

**Solution:**
1. Check backend logs: `gcloud run logs read ecommerce-backend`
2. Verify Firestore is accessible
3. Check service account credentials
4. Verify environment variables

---

## Performance Expectations

Target response times (p95):

| Endpoint | Time |
|----------|------|
| GET /products | < 200ms |
| GET /products/{id} | < 100ms |
| GET /cart | < 150ms |
| POST /cart/add | < 200ms |
| POST /orders/place | < 300ms |
| GET /orders | < 200ms |

---

## Load Testing

Simple load test with Apache Bench:

```bash
# Install ab
brew install httpd-tools  # macOS
# or
apt-get install apache2-utils  # Linux

# Test health endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:8080/health

# Test list products
ab -n 100 -c 10 http://localhost:8080/products
```

Expected results:
- Health check: < 50ms average
- List products: < 200ms average
- Success rate: 100%

---

## API Documentation

**Interactive API Docs**: `{BASE_URL}/docs`

Features:
- Try out requests
- See request/response examples
- View all endpoints
- Check required parameters

---

## Support

For issues or questions:
1. Check logs: `gcloud run logs read ecommerce-backend`
2. Review troubleshooting section
3. Check Firebase Console for data issues
4. Verify Firestore security rules

