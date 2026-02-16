# Backend Deployment Guide - Google Cloud Run

This guide covers deploying the FastAPI backend to Google Cloud Run with Firestore database.

## Prerequisites

### Google Cloud Project
- Google Cloud account and project created
- Firebase project enabled in the same GCP project
- Billing enabled on the project
- Project ID: `test-99u1b3`

### Tools & Access
- `gcloud` CLI installed and authenticated
- `docker` installed (for local testing)
- Service account with Firestore and Cloud Run permissions
- Firebase Console access

### Code Ready
- Backend code in `ecommerce-backend/` directory
- `Dockerfile` configured
- `.env.template` with required variables
- `requirements.txt` with all dependencies

## Phase 1: Service Account Setup

### 1.1 Create Service Account

In Google Cloud Console:
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Enter name: `ecommerce-backend`
4. Click **Create and Continue**

### 1.2 Grant IAM Roles

1. Select the created service account
2. Click **Edit** (pencil icon)
3. Go to **Permissions** tab
4. Add these roles:
   - `Cloud Datastore User` (for Firestore)
   - `Cloud Logging Ops Agent` (for logging)
   - `Cloud Monitoring Metric Writer` (for monitoring)

### 1.3 Create and Download Service Account Key

1. In the service account, go to **Keys** tab
2. Click **Add Key** → **Create new key**
3. Select **JSON** format
4. Click **Create**
5. Save the JSON file as `service-account.json`

**⚠️ IMPORTANT**: Keep this file secure, never commit to git

## Phase 2: Firestore Setup

### 2.1 Create Firestore Database

In Firebase Console:
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose location (e.g., `asia-south1`)
4. Start in **Test Mode** (we'll update security rules)
5. Click **Create**

### 2.2 Create Collections

The collections are auto-created when data is inserted, but you can pre-create them:

```
Collections needed:
- users
- products
- carts
- orders
```

### 2.3 Set Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users - UID-based access control
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products - public read, backend write only
    match /products/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Carts - user-specific
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Orders - user can read own orders
    match /orders/{document=**} {
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow write: if false;
    }
  }
}
```

Click **Publish** to deploy rules.

## Phase 3: Environment Variables & Secrets

### 3.1 Create Secrets

Store sensitive data in Google Secret Manager:

```bash
# Login to gcloud
gcloud auth login
gcloud config set project test-99u1b3

# Create secret for service account key
gcloud secrets create firebase-service-account \
  --data-file=service-account.json \
  --replication-policy="automatic"

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member=serviceAccount:ecommerce-backend@test-99u1b3.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### 3.2 Create .env Configuration

Create `ecommerce-backend/.env` with:

```
ENVIRONMENT=production
FIREBASE_PROJECT_ID=test-99u1b3
GOOGLE_APPLICATION_CREDENTIALS=/secrets/service-account.json
CORS_ORIGINS=https://yourfrontend.web.app,https://yourfrontend.com
```

## Phase 4: Docker Build & Test

### 4.1 Build Docker Image Locally

```bash
cd ecommerce-backend

# Build image
docker build -t ecommerce-backend:latest .

# Test locally
docker run -p 8080:8080 \
  -e ENVIRONMENT=production \
  -e FIREBASE_PROJECT_ID=test-99u1b3 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/service-account.json \
  -v $(pwd)/service-account.json:/secrets/service-account.json \
  ecommerce-backend:latest
```

Test API:
```bash
curl http://localhost:8080/health
```

### 4.2 Push to Container Registry

```bash
# Configure Docker authentication
gcloud auth configure-docker

# Tag image
docker tag ecommerce-backend:latest \
  gcr.io/test-99u1b3/ecommerce-backend:latest

# Push to Google Container Registry
docker push gcr.io/test-99u1b3/ecommerce-backend:latest
```

## Phase 5: Deploy to Cloud Run

### 5.1 Deploy Using gcloud

```bash
gcloud run deploy ecommerce-backend \
  --image gcr.io/test-99u1b3/ecommerce-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars ENVIRONMENT=production,FIREBASE_PROJECT_ID=test-99u1b3 \
  --service-account ecommerce-backend@test-99u1b3.iam.gserviceaccount.com \
  --update-secrets GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest
```

### 5.2 Configure Environment Variables

After deployment, update in Cloud Run Console:

1. Go to **Cloud Run** → **ecommerce-backend**
2. Click **Edit and Deploy New Revision**
3. Go to **Environment** section
4. Set environment variables:
   - `ENVIRONMENT=production`
   - `FIREBASE_PROJECT_ID=test-99u1b3`
   - `CORS_ORIGINS=your-frontend-urls`
5. Click **Deploy**

### 5.3 Get Service URL

After deployment completes:

```bash
gcloud run services describe ecommerce-backend \
  --platform managed \
  --region asia-south1 \
  --format='value(status.url)'
```

Service URL format: `https://ecommerce-backend-xxxxx.asia-south1.run.app`

## Phase 6: Import Products

### 6.1 Create Products CSV

Create `ecommerce-backend/data/products.csv`:

```csv
name,description,price,image_url,stock,category
Wireless Mouse,Ergonomic wireless mouse with 2.4GHz,899,https://images.example.com/mouse.jpg,50,Electronics
Mechanical Keyboard,RGB backlit mechanical keyboard,3499,https://images.example.com/keyboard.jpg,30,Electronics
USB-C Cable,1 meter fast charging cable,199,https://images.example.com/cable.jpg,100,Accessories
Laptop Stand,Aluminum adjustable stand,1299,https://images.example.com/stand.jpg,25,Furniture
Webcam HD,1080p HD webcam with auto-focus,2499,https://images.example.com/webcam.jpg,40,Electronics
Desk Lamp,LED desk lamp with brightness control,899,https://images.example.com/lamp.jpg,60,Furniture
Phone Case,Protective silicone case,299,https://images.example.com/case.jpg,200,Accessories
Bluetooth Speaker,Portable speaker with 10hr battery,1899,https://images.example.com/speaker.jpg,35,Electronics
Monitor Stand,Wooden stand with storage,1599,https://images.example.com/monitor.jpg,20,Furniture
Power Bank,20000mAh fast charging,1999,https://images.example.com/powerbank.jpg,45,Electronics
```

### 6.2 Create Import Script

Create `ecommerce-backend/scripts/import_products.py`:

```python
#!/usr/bin/env python3

import sys
import os
import csv
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firestore import add_document

def import_products(csv_file):
    """Import products from CSV to Firestore"""

    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found: {csv_file}")
        return False

    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            count = 0

            for row in reader:
                product = {
                    "name": row["name"].strip(),
                    "description": row["description"].strip(),
                    "price": float(row["price"]),
                    "image_url": row["image_url"].strip(),
                    "stock": int(row["stock"]),
                    "category": row.get("category", "General").strip(),
                    "created_at": datetime.utcnow()
                }

                doc_id = add_document("products", product)
                count += 1
                print(f"✓ Imported: {product['name']} (ID: {doc_id})")

            print(f"\n✅ Successfully imported {count} products")
            return True

    except Exception as e:
        print(f"❌ Error importing products: {str(e)}")
        return False

if __name__ == "__main__":
    csv_file = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "products.csv"
    )
    success = import_products(csv_file)
    sys.exit(0 if success else 1)
```

### 6.3 Run Import Script Locally

```bash
cd ecommerce-backend
python scripts/import_products.py
```

Verify products in Firebase Console → Firestore → products collection

## Phase 7: Verify Deployment

### 7.1 Health Check

```bash
curl https://ecommerce-backend-xxxxx.asia-south1.run.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ecommerce-backend"
}
```

### 7.2 Test API Endpoints

**List products**:
```bash
curl https://ecommerce-backend-xxxxx.asia-south1.run.app/products
```

**Check readiness**:
```bash
curl https://ecommerce-backend-xxxxx.asia-south1.run.app/ready
```

### 7.3 Check Logs

```bash
gcloud run logs read ecommerce-backend \
  --platform managed \
  --region asia-south1 \
  --limit 50
```

## Phase 8: Monitoring & Observability

### 8.1 Enable Cloud Logging

```bash
gcloud logging write app-log "Backend deployment successful" \
  --severity INFO
```

### 8.2 View Logs in Cloud Console

1. Go to **Cloud Logging**
2. Filter by service: `resource.service.name="ecommerce-backend"`
3. View structured logs

### 8.3 Set Up Monitoring

1. Go to **Cloud Monitoring** → **Dashboards**
2. Create new dashboard for ecommerce-backend
3. Add charts for:
   - Request count
   - Request latency
   - Error rate
   - Memory usage
   - CPU usage

### 8.4 Create Alerts

In **Monitoring** → **Alert policies**:

**Alert for high error rate**:
- Metric: `cloud.run/request_count` with status="500"
- Condition: > 5 errors in 5 minutes
- Notification: Email

## Phase 9: Continuous Deployment (Optional)

### 9.1 Create Cloud Build Trigger

```bash
gcloud builds connect github \
  --repository=your-repo \
  --name=ecommerce-backend-repo
```

### 9.2 Create cloudbuild.yaml

Create `ecommerce-backend/cloudbuild.yaml`:

```yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -t
      - gcr.io/$PROJECT_ID/ecommerce-backend:$COMMIT_SHA
      - -t
      - gcr.io/$PROJECT_ID/ecommerce-backend:latest
      - .

  - name: gcr.io/cloud-builders/docker
    args:
      - push
      - gcr.io/$PROJECT_ID/ecommerce-backend:$COMMIT_SHA

  - name: gcr.io/cloud-builders/run
    args:
      - deploy
      - ecommerce-backend
      - --image=gcr.io/$PROJECT_ID/ecommerce-backend:$COMMIT_SHA
      - --region=asia-south1
      - --platform=managed
```

## Troubleshooting

### Issue: Service won't start
**Solution**: Check logs for errors
```bash
gcloud run logs read ecommerce-backend --limit 100
```

### Issue: Firestore connection timeout
**Solution**:
- Verify service account has Firestore permissions
- Check Firestore database exists
- Verify network connectivity

### Issue: CORS errors from frontend
**Solution**: Update CORS_ORIGINS environment variable

### Issue: 401 Unauthorized on protected routes
**Solution**:
- Verify Firebase tokens are being sent
- Check Firebase configuration
- Verify token format in Authorization header

## Rollback

If deployment has issues:

```bash
# List revisions
gcloud run revisions list --service ecommerce-backend --region asia-south1

# Rollback to previous revision
gcloud run deploy ecommerce-backend \
  --region asia-south1 \
  --revision [previous-revision-name]
```

## Next Steps

1. ✅ Backend deployed to Cloud Run
2. ✅ Firestore configured with security rules
3. ✅ Products imported
4. → **Next**: Deploy frontend to Firebase Hosting (see DEPLOY_FRONTEND.md)
5. → **Next**: Setup observability (see OBSERVABILITY.md)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `gcloud run deploy` | Deploy to Cloud Run |
| `gcloud run logs read` | View service logs |
| `gcloud run services describe` | Get service details |
| `gcloud secrets create` | Create secret |
| `gcloud builds log` | View build logs |

## Important URLs

- Backend Service: `https://ecommerce-backend-xxxxx.asia-south1.run.app`
- Cloud Console: `https://console.cloud.google.com/run`
- Firestore Console: `https://console.firebase.google.com`
- Cloud Logging: `https://console.cloud.google.com/logs`
