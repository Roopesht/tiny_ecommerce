# Backend Deployment Guide - Cloud Run (Simplified)

Deploy the FastAPI backend to Google Cloud Run with minimal setup.

## Prerequisites

- `gcloud` CLI installed and authenticated
- `docker` installed locally
- Service account JSON file (`service-account.json`) already downloaded
- Google Cloud Project: `test-99u1b3`
- Billing enabled on the project

## Quick Setup (10 minutes)

### Step 1: Prepare Service Account

Copy your service account JSON file to the backend directory:

```bash
cd backend
# Make sure service-account.json exists here
ls -la service-account.json
```

### Step 2: Create Firestore Secret in Cloud

```bash
# Set project
gcloud config set project test-99u1b3

# Create secret with your service account key
gcloud secrets create firebase-service-account \
  --data-file=service-account.json \
  --replication-policy="automatic"
```

### Step 3: Build Docker Image Locally

```bash
cd backend

# Build image
docker build --platform linux/amd64 -t ecommerce-backend:latest .

# Test locally (optional)
docker run -p 8080:8080 \
  -e ENVIRONMENT=development \
  -e FIREBASE_PROJECT_ID=test-99u1b3 \
  -v $(pwd)/service-account.json:/secrets/service-account.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/service-account.json \
  ecommerce-backend:latest

# Then test: curl http://localhost:8080/health
# Press Ctrl+C to stop
```

### Step 4: Push to Container Registry

```bash
# Authenticate Docker with GCP
gcloud auth configure-docker

# Tag image
docker tag ecommerce-backend:latest \
  gcr.io/test-99u1b3/ecommerce-backend:latest

# Push to Google Container Registry
docker push gcr.io/test-99u1b3/ecommerce-backend:latest
```

### Step 5: Deploy to Cloud Run

```bash
gcloud run deploy ecommerce-backend \
  --image gcr.io/test-99u1b3/ecommerce-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars ENVIRONMENT=production,FIREBASE_PROJECT_ID=test-99u1b3,CORS_ORIGINS=https://tinyy-ecommerce.web.app \
  --update-secrets GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest

```

### Step 6: Get Service URL

```bash
gcloud run services describe ecommerce-backend \
  --platform managed \
  --region asia-south1 \
  --format='value(status.url)'
```

You'll get a URL like: `https://ecommerce-backend-xxxxx.asia-south1.run.app`

### Step 7: Test Backend

```bash
# Replace with your actual URL
BACKEND_URL="https://ecommerce-backend-xxxxx.asia-south1.run.app"

# Health check
curl $BACKEND_URL/health

# List products
curl $BACKEND_URL/products
```

### Step 8: Update Frontend Config

Update `frontend/.env.production`:

```env
REACT_APP_API_BASE_URL=https://ecommerce-backend-xxxxx.asia-south1.run.app
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## Troubleshooting

### Issue: Docker build fails

```bash
# Check if Dockerfile exists
ls -la backend/Dockerfile

# Check Python version compatibility
python --version  # Should be 3.9+
```

### Issue: Push fails

```bash
# Verify authentication
gcloud auth list

# Reconfigure Docker
gcloud auth configure-docker --quiet
```

### Issue: Deployment fails

```bash
# Check logs
gcloud run logs read ecommerce-backend --region asia-south1 --limit 50

# Check service account has necessary permissions
gcloud projects get-iam-policy test-99u1b3 \
  --flatten="bindings[].members" \
  --filter="bindings.members:*iam.gserviceaccount.com"
```

### Issue: 503 Service Unavailable

- Wait 1-2 minutes for Cloud Run to scale up
- Check if Firestore database exists and is accessible
- Verify GOOGLE_APPLICATION_CREDENTIALS is set correctly

---

## Useful Commands

```bash
# View all deployments
gcloud run services list --region asia-south1

# View recent logs
gcloud run logs read ecommerce-backend --region asia-south1 --limit 20

# Redeploy with new image
gcloud run deploy ecommerce-backend \
  --image gcr.io/test-99u1b3/ecommerce-backend:latest \
  --region asia-south1

# Delete deployment (cleanup)
gcloud run services delete ecommerce-backend --region asia-south1
```

---

## What's Next

✅ Backend deployed on Cloud Run
→ **Next**: Deploy frontend to Firebase Hosting (see 52_DEPLOY_FRONTEND.md)

---

## Reference

| Item | Value |
|------|-------|
| Project | test-99u1b3 |
| Region | asia-south1 |
| Service Name | ecommerce-backend |
| Container Registry | gcr.io/test-99u1b3/ecommerce-backend |
