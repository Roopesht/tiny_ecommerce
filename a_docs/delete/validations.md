# E-Commerce Backend API

A production-ready FastAPI backend for an e-commerce platform with Firebase authentication, Google Cloud Firestore database, and Cloud Run deployment.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud Project: `test-99u1b3`
- Firebase project configured
- Service account credentials

### Local Development (5 minutes)

```bash
# 1. Setup environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment config
cp .env.template .env
# Edit .env with your credentials

# 4. Run server
uvicorn main:app --reload --port 8080
```

API available at: `http://localhost:8080`

### Test the API

```bash
# Health check
curl http://localhost:8080/health

# List products
curl http://localhost:8080/products

# Interactive API docs
open http://localhost:8080/docs
```

---

## 📁 Project Structure

```
backend/
├── main.py                     # FastAPI application entry point
├── config.py                   # Configuration management
├── firestore.py                # Firestore database operations
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container configuration
├── .env.template              # Environment variables template
├── .env.local                 # Local development config
├── .env.prod                  # Production config
│
├── middleware/
│   ├── __init__.py
│   ├── auth.py                # Firebase authentication
│   └── logging.py             # Request/response logging
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                # User authentication endpoints
│   ├── products.py            # Product catalog endpoints
│   ├── cart.py                # Shopping cart endpoints
│   └── orders.py              # Order management endpoints
│
├── models/
│   ├── __init__.py
│   └── schemas.py             # Pydantic request/response models
│
├── utils/
│   ├── __init__.py
│   ├── logger.py              # Structured logging setup
│   └── exceptions.py          # Custom exception classes
│
├── scripts/
│   └── import_products.py     # Product data import script
│
├── data/
│   └── products.csv           # Sample product data
│
└── docs/
    └── API_VALIDATION.md      # API testing guide
```

---

## 🔐 Authentication

All protected endpoints require Firebase ID tokens:

```bash
curl -H "Authorization: Bearer {firebase_token}" \
  http://localhost:8080/auth/me
```

**Protected Endpoints:**
- `GET /auth/me` - Get user profile
- `POST /auth/profile` - Create/update profile
- `GET /cart` - View shopping cart
- `POST /cart/*` - Cart operations
- `POST /orders/place` - Place order
- `GET /orders` - View order history

**Public Endpoints:**
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /products` - List products
- `GET /products/{id}` - Get product details

---

## 📚 API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Authentication
- `GET /auth/me` - Get current user profile
- `POST /auth/profile` - Create/update profile

### Products
- `GET /products` - List products (paginated)
- `GET /products/{product_id}` - Get product details

### Shopping Cart
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `POST /cart/remove` - Remove item from cart
- `POST /cart/update` - Update item quantity

### Orders
- `POST /orders/place` - Place order from cart
- `GET /orders` - Get user's order history

Full API documentation: `http://localhost:8080/docs`

---

## 🗄️ Database Schema

### Firestore Collections

**users/{firebase_uid}**
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "mobilenumber": "1234567890",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**products/{product_id}**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 899,
  "image_url": "https://...",
  "stock": 50,
  "category": "Electronics",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**carts/{firebase_uid}**
```json
{
  "uid": "firebase_uid",
  "items": [
    {
      "product_id": "prod_1",
      "name": "Wireless Mouse",
      "price": 899,
      "quantity": 2,
      "image_url": "https://..."
    }
  ],
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**orders/{order_id}**
```json
{
  "uid": "firebase_uid",
  "items": [
    {
      "product_id": "prod_1",
      "name": "Wireless Mouse",
      "quantity": 2,
      "price": 899
    }
  ],
  "total_amount": 1798,
  "status": "PLACED",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

## 🛠️ Development

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Development Server

```bash
# With auto-reload
uvicorn main:app --reload --port 8080

# Production-like
uvicorn main:app --host 0.0.0.0 --port 8080
```

### Import Sample Products

```bash
python scripts/import_products.py
```

This imports 10 sample products from `data/products.csv` into Firestore.

### View API Documentation

Open browser: `http://localhost:8080/docs`

Interactive Swagger UI for testing all endpoints.

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:8080/health
```

### Test Protected Endpoint

```bash
TOKEN="your_firebase_token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/auth/me
```

### Load Testing

```bash
# Install Apache Bench
brew install httpd-tools

# Run load test
ab -n 100 -c 10 http://localhost:8080/health
```

See [API_VALIDATION.md](docs/API_VALIDATION.md) for complete testing guide.

---

## 🐳 Docker

### Build Image

```bash
docker build -t ecommerce-backend:latest .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID=test-99u1b3 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json \
  -v $(pwd)/service-account.json:/app/service-account.json \
  ecommerce-backend:latest
```

---

## ☁️ Deployment

### Prerequisites

```bash
# Install Google Cloud CLI
brew install google-cloud-sdk

# Login and set project
gcloud auth login
gcloud config set project test-99u1b3
```

### Deploy to Cloud Run

```bash
# Using source code deployment
gcloud run deploy ecommerce-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated

# Or using Docker image
gcloud run deploy ecommerce-backend \
  --image gcr.io/test-99u1b3/ecommerce-backend:latest \
  --region asia-south1 \
  --allow-unauthenticated
```

### Update Environment Variables

```bash
gcloud run deploy ecommerce-backend \
  --region asia-south1 \
  --update-env-vars CORS_ORIGINS=https://tinyy-ecommerce.web.app
```

### View Logs

```bash
gcloud run logs read ecommerce-backend --region asia-south1 --limit 100
```

### View Service Details

```bash
gcloud run services describe ecommerce-backend --region asia-south1
```

For detailed deployment instructions, see [DEPLOY_STEPS.md](DEPLOY_STEPS.md).

---

## 📊 Monitoring & Logging

### View Logs

**In Cloud Console:**
```
Cloud Logging → Logs Explorer
Resource: Cloud Run
Service: ecommerce-backend
```

**Via CLI:**
```bash
gcloud run logs read ecommerce-backend --region asia-south1 --limit 100
```

### Key Metrics

Monitor in Cloud Console:
- Request count
- Response latencies
- Error rates
- CPU/Memory usage

See [Observability Guide](../a_docs/40_OBSERVABILITY.md) for detailed monitoring setup.

---

## 🔒 Security

- ✅ Firebase token verification on protected routes
- ✅ CORS configuration for frontend access
- ✅ Firestore security rules enforcement
- ✅ Service account credentials in Secret Manager (production)
- ✅ Structured logging for audit trails
- ✅ Input validation with Pydantic
- ✅ HTTPS enforced in production

**Security Checklist:**
- [ ] Service account not committed to git (in .gitignore)
- [ ] CORS origins properly configured
- [ ] Firestore security rules reviewed
- [ ] Environment variables in Secret Manager
- [ ] API token validation working
- [ ] Error messages don't leak sensitive data

---

## 🐛 Troubleshooting

### Firestore Connection Error

```
Error: Failed to initialize Firebase
```

**Solution:**
1. Verify service account JSON exists
2. Check `GOOGLE_APPLICATION_CREDENTIALS` points to correct file
3. Verify Firestore database exists in Firebase Console

### CORS Error

```
Access-Control-Allow-Origin header missing
```

**Solution:**
1. Check frontend URL matches `CORS_ORIGINS`
2. Restart server after changing env vars
3. Clear browser cache

### 401 Unauthorized

```
Invalid token or Missing Authorization header
```

**Solution:**
1. Verify token is fresh (< 1 hour old)
2. Check Authorization header format: `Bearer {token}`
3. Verify user exists in Firebase Auth

### Empty Cart When Placing Order

```
400 Bad Request: Cart is empty
```

**Solution:**
1. Add items to cart first: `POST /cart/add`
2. Verify items with: `GET /cart`
3. Check quantities > 0

---

## 📖 Additional Resources

- **API Testing**: See [API_VALIDATION.md](docs/API_VALIDATION.md)
- **Deployment**: See [DEPLOY_STEPS.md](DEPLOY_STEPS.md)
- **Project Overview**: See [PROJECT_SCOPE.md](../a_docs/10_PROJECT_SCOPE.md)
- **Observability**: See [OBSERVABILITY.md](../a_docs/40_OBSERVABILITY.md)

### Official Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Cloud Firestore](https://cloud.google.com/firestore/docs)
- [Cloud Run](https://cloud.google.com/run/docs)

---

## 🤝 Contributing

When making changes:

1. **Code Style**: Follow PEP 8
2. **Type Hints**: Add type annotations
3. **Logging**: Use structured logging
4. **Tests**: Add tests for new features
5. **Documentation**: Update API docs

---

## 📋 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | No | development | Set to 'production' for deployment |
| `PORT` | No | 8080 | Server port |
| `FIREBASE_PROJECT_ID` | Yes | test-99u1b3 | Your Google Cloud Project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | service-account.json | Path to service account JSON |
| `CORS_ORIGINS` | No | http://localhost:3000 | Allowed frontend origins (comma-separated) |
| `LOG_LEVEL` | No | INFO | Logging level (DEBUG, INFO, WARNING, ERROR) |

---

## 📝 License

This project is part of the E-Commerce Learning Platform.

---

## 🆘 Support

For issues or questions:

1. Check [DEPLOY_STEPS.md](DEPLOY_STEPS.md) troubleshooting section
2. Review logs with `gcloud run logs read ecommerce-backend`
3. Check Firebase Console for data issues
4. Verify Firestore security rules

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: January 15, 2024
