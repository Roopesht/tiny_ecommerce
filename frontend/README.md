# E-Commerce Frontend

A React application for the e-commerce platform. Built with React 19, Firebase Authentication, and a simple mode-based navigation system.

## Quick Setup

### Prerequisites
- Node.js 18+ and npm 10+
- Firebase project configured (`test-99u1b3`)
- Backend API running on `http://localhost:8080` (for development)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**

Edit `.env` and add your Firebase configuration from the Firebase Console:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

Get these values from Firebase Console → Project Settings → General → Your apps

### Development

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Project Structure

```
src/
├── firebase/config.js              # Firebase initialization
├── context/AuthContext.js          # Global authentication state
├── utils/api.js                    # API utility with token injection
├── components/
│   ├── Login.js                    # Login page
│   ├── Register.js                 # Registration page
│   ├── Dashboard.js                # User dashboard
│   ├── Products.js                 # Product listing
│   ├── ProductDetails.js           # Single product view
│   ├── Cart.js                     # Shopping cart
│   └── Orders.js                   # Order history
├── App.js                          # Main app component (mode-based routing)
├── index.js                        # React entry point
└── index.css                       # Global styles
```

## How It Works

### Authentication
- Uses Firebase Authentication for login/registration
- `AuthContext` provides global state via `useAuth()` hook
- Firebase ID tokens auto-injected in all API requests
- Tokens auto-refresh every 50 minutes

### Navigation
Uses **mode-based navigation** for simplicity (no React Router):
- `login` - Login page
- `register` - Registration page
- `dashboard` - User dashboard (default)
- `products` - Product listing
- `productDetail` - Single product view
- `cart` - Shopping cart
- `orders` - Order history

### API Integration
The `apiCall()` function:
- Automatically injects Firebase ID token
- Uses native Fetch API
- Handles errors gracefully

## Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`

### `npm run build`
Creates an optimized production build in the `build/` folder

### `npm test`
Runs tests in interactive mode

## Testing Locally

1. **Start backend** (in separate terminal):
```bash
cd ../backend
source venv/bin/activate
uvicorn main:app --reload --port 8080
```

2. **Start frontend**:
```bash
npm start
```

3. **Test the flow**:
   - Register: Fill form and create account
   - Login: Use your credentials
   - Browse products: Click "Browse Products"
   - Add to cart: View product details and add item
   - Checkout: View cart, place order
   - View orders: See order history

## Deployment to Firebase Hosting

### Build for production
```bash
npm run build
```

### Deploy
```bash
firebase login
firebase deploy --only hosting
```

The app will be available at: `https://test-99u1b3.web.app`

Update `.env.production` with your Cloud Run backend URL before deploying.

## API Endpoints

### Public
- `GET /products` - List all products
- `GET /products/{id}` - Get product details

### Protected (requires login)
- `GET /auth/me` - Get user profile
- `POST /auth/profile` - Create/update profile
- `GET /cart` - Get shopping cart
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update quantity
- `POST /cart/remove` - Remove item
- `POST /orders/place` - Place order
- `GET /orders` - Get order history

## Troubleshooting

**API errors (401)**
- Check `.env` Firebase config
- Ensure backend is running
- Check browser console

**CORS errors**
- Backend must include `http://localhost:3000` in CORS origins

**Old version showing**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)

## Learning Resources

- [React Documentation](https://react.dev)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
