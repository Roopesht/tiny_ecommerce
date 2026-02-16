# Quick Reference Guide

Fast lookup for common commands and configurations.

## 🚀 Local Development (1 minute setup)

```bash
cd backend

# Setup
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.template .env

# Run
uvicorn main:app --reload --port 8080

# Test
curl http://localhost:8080/health
open http://localhost:8080/docs
```

## 📦 Project Configuration

**Project ID**: `test-99u1b3`
**Region**: `asia-south1`
**Service**: `ecommerce-backend`
**Frontend (Dev)**: `http://localhost:3000`
**Frontend (Prod)**: `https://tinyy-ecommerce.web.app`

## 🔧 Environment Variables

```bash
# Development (.env.local)
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=DEBUG

# Production (.env.prod)
ENVIRONMENT=production
CORS_ORIGINS=https://tinyy-ecommerce.web.app
LOG_LEVEL=INFO

# Both
FIREBASE_PROJECT_ID=test-99u1b3
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
PORT=8080
```

## 📝 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health` | GET | No | Health check |
| `/ready` | GET | No | Readiness check |
| `/products` | GET | No | List products |
| `/products/{id}` | GET | No | Product details |
| `/auth/me` | GET | Yes | Get profile |
| `/auth/profile` | POST | Yes | Update profile |
| `/cart` | GET | Yes | View cart |
| `/cart/add` | POST | Yes | Add to cart |
| `/cart/remove` | POST | Yes | Remove from cart |
| `/cart/update` | POST | Yes | Update quantity |
| `/orders/place` | POST | Yes | Place order |
| `/orders` | GET | Yes | View orders |

## 🔐 Authentication Header

```
Authorization: Bearer {firebase_id_token}
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8080/health

# List products
curl http://localhost:8080/products

# Add to cart (requires token)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "wireless_mouse", "quantity": 1}' \
  http://localhost:8080/cart/add

# All tests
pytest tests/ -v

# Specific test
pytest tests/test_health.py::TestHealthEndpoint::test_health_check_returns_200
```

## 🐳 Docker

```bash
# Build
docker build -t ecommerce-backend:latest .

# Run
docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID=test-99u1b3 \
  -v $(pwd)/service-account.json:/app/service-account.json \
  ecommerce-backend:latest
```

## ☁️ Cloud Run Deployment

```bash
# Set variables
PROJECT_ID=test-99u1b3
SERVICE=ecommerce-backend
REGION=asia-south1

# Deploy from source
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated

# Deploy from image
gcloud run deploy $SERVICE \
  --image gcr.io/$PROJECT_ID/$SERVICE:latest \
  --region $REGION \
  --allow-unauthenticated

# View service
gcloud run services describe $SERVICE --region $REGION

# View logs
gcloud run logs read $SERVICE --region $REGION --limit 50

# Update env vars
gcloud run deploy $SERVICE \
  --region $REGION \
  --update-env-vars CORS_ORIGINS=https://tinyy-ecommerce.web.app

# Rollback
gcloud run revisions list --service $SERVICE --region $REGION
gcloud run deploy $SERVICE \
  --revision [revision_name] \
  --region $REGION

# Delete
gcloud run services delete $SERVICE --region $REGION
```

## 📊 Monitoring

```bash
# View service metrics
gcloud run services describe $SERVICE --region $REGION

# View detailed logs
gcloud logging read "resource.service.name=$SERVICE" \
  --limit 100 \
  --format json

# View errors only
gcloud logging read "resource.service.name=$SERVICE AND severity=ERROR" \
  --limit 50

# Stream logs
gcloud run logs read $SERVICE --region $REGION --follow
```

## 📥 Data Import

```bash
# Import sample products
python scripts/import_products.py

# View products in Firestore
# Firebase Console → Firestore → products collection
```

## 🔑 Important Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application |
| `firestore.py` | Database operations |
| `config.py` | Configuration |
| `middleware/auth.py` | Authentication |
| `routes/*.py` | API endpoints |
| `DEPLOY_STEPS.md` | Deployment guide |
| `API_VALIDATION.md` | API testing |

## 🚨 Common Issues & Solutions

**"service-account.json not found"**
```bash
# Download from Firebase Console → Project Settings → Service Accounts
# Save as backend/service-account.json
```

**"CORS error"**
```bash
# Update .env file
CORS_ORIGINS=http://localhost:3000

# Restart server
```

**"401 Unauthorized"**
```bash
# Get fresh Firebase token from frontend
# Check Authorization header format: Bearer {token}
```

**"Cart is empty" when placing order**
```bash
# Add items first
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "wireless_mouse", "quantity": 1}' \
  http://localhost:8080/cart/add
```

## 📚 Documentation Map

```
backend/
├── README.md                 # Quick start
├── DEPLOY_STEPS.md          # Deployment guide (detailed)
├── IMPLEMENTATION_SUMMARY.md # What's implemented
├── QUICK_REFERENCE.md       # This file
└── docs/
    └── API_VALIDATION.md    # API testing guide
```

## 🎯 Development Workflow

```bash
# 1. Start development server
uvicorn main:app --reload --port 8080

# 2. Make code changes
# (auto-reload will apply changes)

# 3. Test with curl or Postman
curl -X GET http://localhost:8080/products

# 4. Run tests
pytest tests/ -v

# 5. Check logs
# View at http://localhost:8080/docs

# 6. Commit changes
git add .
git commit -m "Describe your changes"
```

## 🔄 Deployment Workflow

```bash
# 1. Verify local tests pass
pytest tests/ -v

# 2. Build Docker image
docker build -t ecommerce-backend:latest .

# 3. Test Docker locally
docker run -p 8080:8080 ecommerce-backend:latest

# 4. Deploy to Cloud Run
gcloud run deploy ecommerce-backend --source . --region asia-south1

# 5. Verify deployment
curl https://ecommerce-backend-xxxxx.asia-south1.run.app/health

# 6. Monitor logs
gcloud run logs read ecommerce-backend --region asia-south1
```

## 🔗 Useful Links

- Local API Docs: `http://localhost:8080/docs`
- Firebase Console: `https://console.firebase.google.com`
- Cloud Console: `https://console.cloud.google.com`
- Cloud Logging: `https://console.cloud.google.com/logs`
- Cloud Run: `https://console.cloud.google.com/run`

## 💾 Database Schema Quick Reference

```
users/{uid}
├── email, firstname, lastname, mobilenumber
├── created_at, updated_at

products/{product_id}
├── name, description, price, image_url
├── stock, category, created_at

carts/{uid}
├── items (array of {product_id, name, price, quantity, image_url})
├── updated_at

orders/{order_id}
├── uid, items (array), total_amount, status
├── created_at, updated_at
```

## ⚡ Performance Tips

- Cache products (they change infrequently)
- Use pagination for large result sets
- Indexes for frequent queries
- Monitor slow queries in Cloud Logging
- Auto-scaling handles traffic spikes

## 🔒 Security Checklist

- [ ] service-account.json in .gitignore
- [ ] Never commit .env files
- [ ] CORS_ORIGINS configured correctly
- [ ] Firestore rules reviewed
- [ ] Error messages don't expose secrets
- [ ] Tokens verified on protected routes
- [ ] Input validation with Pydantic

## 📊 Status Commands

```bash
# Check backend is running
curl http://localhost:8080/health

# Check if deployed
gcloud run services describe ecommerce-backend --region asia-south1

# List all deployments
gcloud run services list

# Check recent commits
git log --oneline -10

# Check git status
git status
```

## 🆘 Support

1. Check logs: `gcloud run logs read ecommerce-backend`
2. Read DEPLOY_STEPS.md troubleshooting section
3. Check Firebase Console for data
4. Review security rules in Firestore
5. Verify environment variables

---

**Last Updated**: January 15, 2024
**Status**: Production Ready ✅
