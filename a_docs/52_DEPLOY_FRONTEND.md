# Frontend Deployment Guide - Firebase Hosting

This guide covers deploying the React frontend to Firebase Hosting.

## Prerequisites

### Tools & Access
- Node.js 18+ and npm 10+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- GitHub account (optional, for automatic deployments)
- Firebase Console access for `test-99u1b3` project

### Configuration Ready
- Backend deployed to Cloud Run
- Backend URL available (e.g., `https://ecommerce-backend-xxxxx.asia-south1.run.app`)
- Firebase config values obtained
- Production environment variables prepared

### Code Ready
- Frontend code in `ecommerce-frontend/` directory
- Firebase SDK installed: `npm install firebase`
- All components completed and tested locally
- `.env.production` file created

## Phase 1: Firebase Project Setup

### 1.1 Verify Firebase Hosting Enabled

In Firebase Console:
1. Go to **Hosting**
2. Click **Get Started**
3. Follow setup wizard
4. Connect to Git (optional)

### 1.2 Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Find "Your apps" section
3. If no web app, click **Add app** → **Web**
4. Copy Firebase config object:

```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "test-99u1b3.firebaseapp.com",
  projectId: "test-99u1b3",
  storageBucket: "test-99u1b3.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Phase 2: Environment Configuration

### 2.1 Create Production Environment File

Create `ecommerce-frontend/.env.production`:

```
REACT_APP_API_BASE_URL=https://ecommerce-backend-xxxxx.asia-south1.run.app
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

### 2.2 Verify Local Environment

Ensure `.env` (development) is configured for local testing:

```
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
...
```

## Phase 3: Local Build & Testing

### 3.1 Install Dependencies

```bash
cd ecommerce-frontend
npm install
```

### 3.2 Build Production Bundle

```bash
npm run build
```

This creates optimized files in the `build/` directory.

### 3.3 Test Production Build Locally

```bash
# Install serve globally
npm install -g serve

# Run production build locally
serve -s build -l 3000
```

Visit `http://localhost:3000` and test:
- ✅ Register a new user
- ✅ Login with credentials
- ✅ Browse products
- ✅ Add products to cart
- ✅ View cart
- ✅ Place order
- ✅ View order history

## Phase 4: Firebase Hosting Configuration

### 4.1 Create firebase.json

Create or update `ecommerce-frontend/firebase.json`:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=7200"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### 4.2 Create .firebaserc

Create `ecommerce-frontend/.firebaserc`:

```json
{
  "projects": {
    "default": "test-99u1b3"
  },
  "targets": {
    "test-99u1b3": {
      "hosting": {
        "frontend": [
          "ecommerce-frontend"
        ]
      }
    }
  }
}
```

## Phase 5: Firebase CLI Setup

### 5.1 Login to Firebase

```bash
firebase login
```

This opens browser to authenticate with your Google account.

### 5.2 Verify Project Connection

```bash
firebase projects:list
```

Should show `test-99u1b3` project.

### 5.3 Check Hosting Configuration

```bash
firebase hosting:sites:list

firebase target:apply hosting tinyy-ecommerce tinyy-ecommerce
```

## Phase 6: Deploy to Firebase Hosting

### 6.1 Preview Deployment

```bash
firebase hosting:channel:deploy main-preview \
  --expires 1h
```

This creates a preview URL to test before production.

### 6.2 Deploy to Production

```bash
firebase deploy --only hosting
```

**Output will show**:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/test-99u1b3/overview
Hosting URL: https://test-99u1b3.web.app
```

### 6.3 Alternative: Manual Build + Deploy

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

## Phase 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

In Firebase Console:
1. Go to **Hosting**
2. Click your site
3. Click **Connect domain**
4. Enter your domain (e.g., `ecommerce.example.com`)
5. Verify ownership via DNS

### 7.2 Update DNS Records

Firebase provides DNS records to add to your domain registrar:
- CNAME record pointing to Firebase
- (or A records if using www)

After DNS propagates (can take 24 hours):
- App available at `https://ecommerce.example.com`
- SSL certificate auto-provisioned

## Phase 8: Verify Deployment

### 8.1 Check Deployment Status

```bash
firebase hosting:sites:list
firebase hosting:channel:list
```

### 8.2 Test Deployed Application

1. Visit `https://test-99u1b3.web.app`
2. Test all features:
   - ✅ Register new user
   - ✅ Login
   - ✅ Browse products
   - ✅ Add to cart
   - ✅ Place order
   - ✅ View orders

### 8.3 Check Browser Console

- No JavaScript errors
- Network requests to backend successful
- Firebase auth working

### 8.4 Verify in Firebase Console

1. Go to **Authentication**
   - Should see registered users

2. Go to **Firestore**
   - Check `users`, `carts`, `orders` collections have data

3. Go to **Hosting**
   - Should show "Live" status
   - View analytics

## Phase 9: Performance Optimization

### 9.1 Check Build Size

```bash
npm run build
# Check build/ directory size

# Install build analyzer
npm install source-map-explorer

# Analyze
npx source-map-explorer 'build/static/js/*.js'
```

### 9.2 Enable Code Splitting

In `App.js`, use React lazy loading:

```javascript
const Dashboard = lazy(() => import('./components/Dashboard'));
const Products = lazy(() => import('./components/Products'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Component />
</Suspense>
```

### 9.3 Optimize Images

- Compress images before adding
- Use WebP format where possible
- Implement lazy loading

### 9.4 Check Firebase Analytics

In Firebase Console → **Analytics**:
- View app performance
- User sessions
- Geographic data
- Error rates

## Phase 10: Continuous Deployment (Optional)

### 10.1 Deploy via GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
    paths:
      - 'ecommerce-frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install & Build
        working-directory: ecommerce-frontend
        run: |
          npm install
          npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: test-99u1b3
          channelId: live
        env:
          FIREBASE_CLI_EXPERIMENTS: webframeworks
```

### 10.2 Add GitHub Secret

1. Go to GitHub repo → **Settings** → **Secrets**
2. Add `FIREBASE_SERVICE_ACCOUNT`:
   ```bash
   firebase login:ci
   # Copy token and add as secret
   ```

## Monitoring & Analytics

### 11.1 Enable Firebase Analytics

Firebase Analytics automatically tracks:
- User sessions
- Screen views
- Events
- Crashes

### 11.2 View Metrics

In Firebase Console → **Analytics**:
- Real-time user count
- Session duration
- Geographic distribution
- Device types

### 11.3 Setup Custom Events (Optional)

Track custom user actions:
```javascript
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics();
logEvent(analytics, "add_to_cart", {
  product_id: productId,
  price: price
});
```

## Troubleshooting

### Issue: Deployment fails with "permission denied"
**Solution**:
```bash
firebase logout
firebase login
firebase deploy --only hosting
```

### Issue: Pages not loading (404 errors)
**Solution**: Verify `rewrites` in firebase.json points to index.html

### Issue: API calls failing (CORS errors)
**Solution**:
- Verify `REACT_APP_API_BASE_URL` in `.env.production`
- Check backend CORS origins include frontend domain
- Check backend deployment status

### Issue: Firebase config not working
**Solution**: Verify all Firebase config values in `.env.production`

### Issue: Old version still showing after deployment
**Solution**:
- Clear browser cache: Ctrl+Shift+Delete
- Do hard refresh: Ctrl+Shift+R
- Check deployment status: `firebase hosting:sites:list`

## Rollback

To rollback to previous deployment:

```bash
# List releases
firebase hosting:releases:list

# Rollback to specific release
firebase hosting:clone [source_site] [target_site]
```

## Monitoring After Deployment

### 11.1 Set Up Error Alerts

In Firebase Console:
1. Go to **Crashlytics** (if enabled)
2. Set up alerts for crashes

### 11.2 Monitor Performance

Create Dashboard to track:
- Page load time
- User sessions
- Error rate
- Conversion rate (if e-commerce tracking added)

## Next Steps

1. ✅ Frontend deployed to Firebase Hosting
2. ✅ Backend deployed to Cloud Run
3. → **Next**: Setup observability (see OBSERVABILITY.md)
4. → **Next**: Monitor and optimize

## Quick Reference Commands

```bash
# Local development
npm start

# Production build
npm run build

# Test production build locally
serve -s build

# Deploy to Firebase
firebase deploy --only hosting

# Preview before deploying
firebase hosting:channel:deploy preview

# Check deployment status
firebase hosting:sites:list

# View logs
firebase functions:log
```

## Important URLs

| URL | Purpose |
|-----|---------|
| `https://test-99u1b3.web.app` | Primary hosting URL |
| `https://console.firebase.google.com/project/test-99u1b3/hosting` | Hosting console |
| `https://console.firebase.google.com/project/test-99u1b3/authentication` | Auth console |
| `https://console.firebase.google.com/project/test-99u1b3/firestore` | Firestore console |

## Production Checklist

Before marking deployment as complete:

- [ ] Frontend loads without errors
- [ ] Register and login works
- [ ] Firebase auth creates users correctly
- [ ] Products display and load from backend
- [ ] Add to cart works
- [ ] Firestore saves cart data
- [ ] Place order works
- [ ] Orders appear in history
- [ ] Backend logs show requests
- [ ] No CORS errors in console
- [ ] Images load correctly
- [ ] Responsive design works on mobile
- [ ] Performance metrics are good
- [ ] Analytics shows user activity
