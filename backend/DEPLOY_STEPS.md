# Backend Deployment Guide

Complete step-by-step instructions for deploying the e-commerce backend to Google Cloud Run.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Firebase Setup](#firebase-setup)
4. [Local Testing](#local-testing)
5. [Cloud Deployment](#cloud-deployment)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You'll need:
- Google Cloud Project ID: **test-99u1b3**
- Cloud Run Region: **asia-south1**
- Frontend URLs:
  - Development: `http://localhost:3000`
  - Production: `https://tinyy-ecommerce.web.app`
- Git and Google Cloud CLI installed

### Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Windows
choco install google-cloud-sdk

# Then authenticate
gcloud auth login
gcloud config set project test-99u1b3
```

---

## Local Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

```bash
# Copy template
cp .env.template .env

# Or use development config
cp .env.local .env
```

Edit `.env` with your values:
```
ENVIRONMENT=development
PORT=8080
FIREBASE_PROJECT_ID=test-99u1b3
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=DEBUG
```

### 5. Place Service Account Credentials

Download from Firebase Console:

1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `service-account.json` in backend folder

**⚠️ WARNING: Never commit service-account.json to git!**

Verify it's in `.gitignore`:
```
service-account.json
```

---

## Firebase Setup

### 1. Create Firestore Database

In Firebase Console:

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose region: **asia-south1 (India)**
5. Click **Create**

### 2. Create Collections (Optional - Backend Will Create)

The backend will create collections automatically, but you can pre-create them:

Collections needed:
- `users`
- `products`
- `carts`
- `orders`

### 3. Setup Firestore Security Rules

In Firestore → Rules tab, use this basic configuration:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read on products
    match /products/{document=**} {
      allow read;
    }

    // Allow users to read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Allow users to manage their cart
    match /carts/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Allow users to read their orders
    match /orders/{document=**} {
      allow read: if resource.data.uid == request.auth.uid;
      allow create: if request.auth.uid != null;
    }
  }
}
```

---

## Local Testing

### 1. Run Development Server

```bash
# Make sure you're in the backend directory and venv is activated
uvicorn main:app --reload --port 8080
```

Server will be available at: `http://localhost:8080`

### 2. Test Health Endpoint

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ecommerce-backend",
  "environment": "development"
}
```

### 3. Import Sample Products

In a new terminal:

```bash
# Activate venv first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run import script
python scripts/import_products.py
```

Expected output:
```
✓ Imported: Wireless Mouse (ID: wireless_mouse)
✓ Imported: Mechanical Keyboard (ID: mechanical_keyboard)
...
✓ Successfully imported: 10 products
```

### 4. Test API Endpoints

**Get Products:**
```bash
curl http://localhost:8080/products
```

**Get API Documentation:**
Open browser to: `http://localhost:8080/docs`

This opens Swagger UI where you can test all endpoints interactively.

---

## Cloud Deployment

### 1. Build and Push Docker Image

```bash
# Set variables
PROJECT_ID=test-99u1b3
SERVICE_NAME=ecommerce-backend
REGION=asia-south1

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# Authenticate with Google Cloud
gcloud auth configure-docker

# Push image to Container Registry
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,FIREBASE_PROJECT_ID=$PROJECT_ID,CORS_ORIGINS=https://tinyy-ecommerce.web.app \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 100
```

**What this command does:**
- Deploys image to Cloud Run
- Sets region to asia-south1
- Allows public access (unauthenticated requests for /products, /health)
- Sets environment variables
- Allocates 512MB RAM and 1 CPU
- Sets request timeout to 5 minutes
- Auto-scales up to 100 instances

### 3. Wait for Deployment

```bash
# Check deployment status
gcloud run services describe $SERVICE_NAME --region $REGION
```

Look for:
- **URL**: Your service URL (copy this!)
- **Status**: Should show as deployed

### 4. Mount Service Account Credentials

For production, use Google Secret Manager instead of local files:

```bash
# Create secret for service account
gcloud secrets create firebase-service-account \
  --data-file=service-account.json

# Grant Cloud Run service account access
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_RUN_SA=$PROJECT_NUMBER-compute@developer.gserviceaccount.com

gcloud secrets add-iam-policy-binding firebase-service-account \
  --member=serviceAccount:$CLOUD_RUN_SA \
  --role=roles/secretmanager.secretAccessor
```

Update Cloud Run deployment to use the secret:

```bash
gcloud run deploy $SERVICE_NAME \
  --region $REGION \
  --platform managed \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/firebase-service-account
  --secrets firebase-service-account=/run/secrets/firebase-service-account
```

---

## Verification

### 1. Test Deployed Service

```bash
# Replace with your actual service URL
SERVICE_URL=https://ecommerce-backend-xxxxx.asia-south1.run.app

# Health check
curl $SERVICE_URL/health

# List products
curl $SERVICE_URL/products

# View API docs
open $SERVICE_URL/docs
```

### 2. Check Logs

```bash
# View recent logs
gcloud run logs read ecommerce-backend --region asia-south1 --limit 100

# View only errors
gcloud logging read "resource.service.name=ecommerce-backend AND severity=ERROR" --limit 50
```

### 3. Monitor Performance

In Google Cloud Console:

1. Go to **Cloud Run** → **ecommerce-backend**
2. Click **Metrics** tab
3. View:
   - Request count
   - Request latencies
   - CPU usage
   - Memory usage

### 4. Test Protected Endpoints

You'll need a Firebase ID token to test protected endpoints like `/auth/me`, `/cart`, `/orders`.

Get a token:
1. Deploy frontend
2. Login with test user account
3. In browser console: `firebase.auth().currentUser.getIdToken()`
4. Copy the token

Then test:
```bash
TOKEN="your_firebase_token"
SERVICE_URL="https://ecommerce-backend-xxxxx.asia-south1.run.app"

curl -H "Authorization: Bearer $TOKEN" $SERVICE_URL/auth/me
```

---

## Troubleshooting

### Issue: "service-account.json not found"

**Solution:**
1. Download service account JSON from Firebase Console
2. Save as `service-account.json` in backend folder
3. Make sure it's listed in `.gitignore`

### Issue: "CORS error" when frontend tries to call backend

**Solution:**
1. Check your frontend URL
2. Update CORS_ORIGINS environment variable
3. Redeploy: `gcloud run deploy` with new env vars

### Issue: "Cloud Run service failed to start"

**Solution:**
Check logs:
```bash
gcloud run logs read ecommerce-backend --region asia-south1 --limit 50
```

Common causes:
- Wrong environment variables
- Missing service account credentials
- Port not set to 8080
- Firestore connection timeout

### Issue: "Firestore operations timeout"

**Solution:**
1. Check if Firestore database exists and is in asia-south1
2. Verify Firestore rules allow your operations
3. Check Cloud Run memory - increase if needed
4. Check network connectivity

### Issue: "Unauthorized (401) errors"

**Solution:**
1. Verify Firebase token is fresh (tokens expire in 1 hour)
2. Check token format: should be `Bearer {token}`
3. Check Authorization header is sent correctly
4. Verify user exists in Firebase Auth

---

## Quick Reference Commands

```bash
# Deployment variables
PROJECT_ID=test-99u1b3
SERVICE_NAME=ecommerce-backend
REGION=asia-south1
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

# Deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated

# View service details
gcloud run services describe $SERVICE_NAME --region $REGION

# View logs
gcloud run logs read $SERVICE_NAME --region $REGION --limit 100

# Update only environment variables
gcloud run deploy $SERVICE_NAME \
  --region $REGION \
  --update-env-vars CORS_ORIGINS=https://new-frontend.com

# Rollback to previous revision
gcloud run revisions list --service $SERVICE_NAME --region $REGION
gcloud run deploy $SERVICE_NAME --revision [revision_name] --region $REGION

# Delete service
gcloud run services delete $SERVICE_NAME --region $REGION

# Stream logs in real-time
gcloud run logs read $SERVICE_NAME --region $REGION --follow
```

---

## Production Checklist

Before considering the deployment complete:

- [ ] Backend URL is accessible
- [ ] Health endpoint returns 200
- [ ] Products endpoint returns data
- [ ] Logs are flowing to Cloud Logging
- [ ] No errors in error logs
- [ ] CORS properly configured for frontend
- [ ] Firestore security rules are in place
- [ ] Service account is in Secret Manager (not in repo)
- [ ] Memory and CPU are appropriate
- [ ] Auto-scaling is configured
- [ ] Alerts are set up
- [ ] Monitoring dashboard is created

---

## Next Steps

1. **Deploy Frontend** - See frontend deployment guide
2. **Setup Monitoring** - See observability guide
3. **Import Product Data** - Run `python scripts/import_products.py`
4. **Test End-to-End** - Test full user flows
5. **Setup Alerts** - Configure error and latency alerts

---

## Support & Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Google Cloud Logging](https://cloud.google.com/logging/docs)
- Backend API Docs: `{SERVICE_URL}/docs`

---

**Last Updated**: 2024-01-15
**Version**: 1.0
