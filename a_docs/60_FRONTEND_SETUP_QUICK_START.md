# Frontend Setup - Quick Start Guide

## ✅ What Has Been Done

The complete React frontend for the e-commerce platform has been implemented at `/frontend/`.

### Created Files & Structure

```
frontend/
├── src/
│   ├── firebase/
│   │   └── config.js                  # Firebase initialization
│   ├── context/
│   │   └── AuthContext.js             # Authentication state management
│   ├── utils/
│   │   └── api.js                     # API utility with token injection
│   ├── components/
│   │   ├── Login.js                   # Login page
│   │   ├── Register.js                # Registration page (with profile)
│   │   ├── Dashboard.js               # User dashboard
│   │   ├── Products.js                # Product listing grid
│   │   ├── ProductDetails.js          # Single product view with add to cart
│   │   ├── Cart.js                    # Shopping cart (table view)
│   │   └── Orders.js                  # Order history with expandable details
│   ├── App.js                         # Main app with mode-based routing
│   ├── index.js                       # React entry point
│   └── index.css                      # Global styles
├── .env                               # Development environment variables
├── .env.production                    # Production environment variables
├── firebase.json                      # Firebase Hosting configuration
├── .firebaserc                        # Firebase project config
├── package.json                       # Dependencies (React 19, Firebase)
└── README.md                          # Project documentation
```

### Key Features Implemented

✅ **Authentication**
- Firebase Authentication integration
- Email/password login and registration
- Automatic token injection in API calls
- Token auto-refresh every 50 minutes

✅ **Navigation**
- Mode-based navigation (no React Router - simple for learning)
- Transitions between login, register, dashboard, products, cart, orders

✅ **Components**
- Login form with validation
- Registration form with name, email, password, phone
- Dashboard with user stats and navigation
- Products list with grid layout
- Product details with add to cart
- Shopping cart with quantity management
- Order history with expandable items

✅ **API Integration**
- Automatic Firebase token injection
- Simple error handling
- API utility with GET, POST, PUT, DELETE helpers

✅ **Styling**
- Clean, simple inline styles (beginner-friendly)
- CSS variables for colors and spacing
- Responsive grid layouts
- No complex CSS libraries

---

## 🚀 Getting Started

### Step 1: Configure Firebase Credentials

Edit `frontend/.env`:

```bash
cd frontend
nano .env  # or use your editor
```

Fill in the Firebase config values from Firebase Console:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

**How to find these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `test-99u1b3`
3. Click "Project Settings" (gear icon)
4. Go to "General" tab
5. Find "Your apps" section
6. Copy the Web app configuration

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start Backend

In a new terminal:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8080
```

### Step 4: Start Frontend

```bash
cd frontend
npm start
```

The app opens at `http://localhost:3000`

---

## 🧪 Testing the Application

### Test Walkthrough

1. **Register**
   - Click "Register"
   - Fill in email, password, name, phone
   - Click "Register"
   - Should redirect to Dashboard

2. **Browse Products**
   - Click "Browse Products"
   - See product grid (from backend)
   - Click "View Details" on any product

3. **Add to Cart**
   - On product details page
   - Enter quantity
   - Click "Add to Cart"
   - Should see success message

4. **View Cart**
   - Click "View Cart" on Dashboard
   - See cart items in table
   - Can update quantity or remove items
   - Click "Place Order"

5. **View Orders**
   - After placing order, redirects to Orders
   - See order ID, date, status, total
   - Click order to expand and see items

### Verify in Browser DevTools

**Console Tab:**
- Should have no errors
- Auth messages may show (normal)

**Network Tab:**
- API calls to `http://localhost:8080` endpoints
- Authorization header with Bearer token present
- Status 200 for successful requests

**Application Tab:**
- LocalStorage has Firebase auth token
- No sensitive data exposed

---

## 📋 Architecture Overview

### Component Hierarchy

```
App (AuthProvider wrapper)
├── AuthContext (authentication state)
└── AppContent (mode-based routing)
    ├── Login / Register (unauthenticated)
    └── Dashboard / Products / Cart / Orders (authenticated)
```

### Data Flow

1. **Authentication**
   - Firebase creates/validates user
   - ID token obtained
   - Stored in AuthContext
   - Auto-injected in API calls

2. **API Calls**
   - `apiCall()` function gets current token
   - Adds `Authorization: Bearer {token}` header
   - Sends to backend
   - Backend validates token
   - Returns data or error

3. **State Management**
   - AuthContext for global auth state
   - Local component state for UI
   - No Redux or complex state management

### Navigation Pattern

- No React Router for simplicity
- App.js manages `mode` state
- Mode values: login, register, dashboard, products, productDetail, cart, orders
- Components call `onNavigate(mode)` to switch pages

---

## 🔧 Configuration Details

### .env Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| REACT_APP_API_BASE_URL | Backend API URL | http://localhost:8080 |
| REACT_APP_FIREBASE_API_KEY | Firebase authentication key | AIza... |
| REACT_APP_FIREBASE_PROJECT_ID | Firebase project | test-99u1b3 |

All variables prefixed with `REACT_APP_` are exposed to the frontend.

### Firebase Configuration

- **Project ID**: test-99u1b3
- **Auth Method**: Email/Password
- **Persistence**: Browser Local Storage
- **Token Expiry**: 1 hour (auto-refresh at 50 minutes)

### Backend Integration

- **Base URL**: http://localhost:8080 (dev), Cloud Run URL (prod)
- **CORS**: Configured for localhost:3000 and https://test-99u1b3.web.app
- **Auth Header**: `Authorization: Bearer {firebase_id_token}`

---

## 📚 File Purposes

### Core Files

**firebase/config.js**
- Initializes Firebase SDK
- Sets up authentication persistence
- Exports `auth` object

**context/AuthContext.js**
- Manages global authentication state
- Handles login/register/logout
- Provides `useAuth()` hook
- Auto-refreshes tokens

**utils/api.js**
- Wraps Fetch API
- Auto-injects Firebase tokens
- Handles errors
- Provides HTTP method helpers (get, post, put, delete)

**App.js**
- Main component with AuthProvider
- Mode-based navigation logic
- Conditional rendering based on auth state

### Components

**Login.js**
- Email/password login form
- Validation and error handling
- Link to register

**Register.js**
- Registration form (email, password, name, phone)
- Client-side validation
- Creates Firebase user + backend profile
- Link to login

**Dashboard.js**
- Shows welcome message and user stats
- Quick actions (browse, cart, orders)
- Logout button

**Products.js**
- Fetches and displays product grid
- View Details button for each product
- Loading and error states

**ProductDetails.js**
- Shows single product details
- Quantity selector
- Add to Cart button
- Back button

**Cart.js**
- Table view of cart items
- Update quantity and remove buttons
- Cart total
- Place Order and Continue Shopping buttons

**Orders.js**
- List of all orders (newest first)
- Expandable order details
- Status badges with colors
- Order items table

---

## 🐛 Debugging Tips

### Common Issues

**"Cannot find module" errors**
```bash
npm install
```

**Firebase config error**
- Check all environment variables in `.env`
- Ensure project ID matches `test-99u1b3`
- Verify values from Firebase Console

**API 401 errors (Unauthorized)**
- Backend cannot verify token
- Check if backend is running
- Check Authorization header in Network tab
- Try logout and login again

**CORS errors**
- Backend doesn't allow frontend origin
- Check backend CORS configuration
- Should include `http://localhost:3000`

**Blank page or infinite loading**
- Check browser console for errors
- Open DevTools → Console tab
- Look for Firebase or network errors

### Useful Console Commands

In browser console:
```javascript
// Check auth state
firebase.auth().currentUser

// Check token
firebase.auth().currentUser?.getIdToken()

// Check what's in localStorage
localStorage
```

---

## 📦 Production Deployment

### Update for Production

1. **Update .env.production**
```bash
REACT_APP_API_BASE_URL=https://your-cloud-run-url.asia-south1.run.app
# Keep Firebase config same
```

2. **Build**
```bash
npm run build
```

3. **Deploy to Firebase Hosting**
```bash
firebase login
firebase deploy --only hosting
```

App available at: `https://test-99u1b3.web.app`

---

## 📖 Code Quality

### Kept Simple For Training
- ✅ No complex state management
- ✅ No advanced routing
- ✅ Inline styles (not separate CSS files)
- ✅ Clear variable and function names
- ✅ Comments where needed
- ✅ Basic error handling

### Security Practices
- ✅ Firebase tokens in Authorization header
- ✅ No credentials in code
- ✅ Environment variables for sensitive config
- ✅ Basic input validation

---

## 🎓 Learning Path

After this frontend works, explore:

1. **Search/Filter Products**
   - Add search box in Products.js
   - Filter based on query

2. **Product Categories**
   - Add category buttons
   - Filter products by category

3. **User Profile**
   - New page to edit name, phone
   - Call PUT to backend

4. **Order Details**
   - Expand order to show full details
   - Track order status

5. **Better Error Handling**
   - Error boundaries
   - Retry logic
   - User-friendly messages

6. **Testing**
   - Unit tests with Jest
   - Component tests with React Testing Library

---

## 📞 Support

If something doesn't work:

1. Check browser console (DevTools → Console)
2. Check Network tab for API errors
3. Verify `.env` configuration
4. Ensure backend is running
5. Check backend logs for errors
6. Review README.md in frontend folder

---

## ✨ Summary

You now have a fully functional React frontend that:
- ✅ Authenticates users with Firebase
- ✅ Integrates with the backend API
- ✅ Manages shopping cart
- ✅ Places orders
- ✅ Views order history
- ✅ Is deployment-ready for Firebase Hosting

The code is intentionally simple for learning purposes. All major concepts are explained in comments.

**Next Step**: [See DEPLOY_FRONTEND.md for deployment instructions](52_DEPLOY_FRONTEND.md)
