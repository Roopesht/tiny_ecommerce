# E-Commerce Platform - Project Scope

## What Is This Project?

A **production-ready e-commerce web application** demonstrating modern cloud architecture with Firebase authentication, Google Cloud services, and full observability. Users can browse products, add to cart, place orders, and track purchases.

---

## Project Objectives

1. **Build a functional e-commerce platform** with user authentication and order management
2. **Demonstrate cloud-native architecture** using Google Cloud Run, Firestore, and Firebase
3. **Implement observability best practices** with structured logging, monitoring, and error tracking
4. **Deploy to production** with CI/CD pipeline and performance optimization
5. **Document everything** for maintenance and future scaling

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Firebase Auth |
| **Backend** | FastAPI + Python 3.11 |
| **Database** | Google Cloud Firestore |
| **Authentication** | Firebase Authentication (Email/Password) |
| **Deployment** | Google Cloud Run (Backend) + Firebase Hosting (Frontend) |
| **Observability** | Cloud Logging, Cloud Monitoring, Error Reporting |

---

## Core Features

### User Management
- ✅ Email/password registration via Firebase Auth
- ✅ Secure login with ID token generation
- ✅ User profile management (name, mobile, email)
- ✅ Session persistence across devices

### Product Catalog
- ✅ Browse all products with pagination
- ✅ View detailed product information
- ✅ Filter by category (future enhancement)
- ✅ 10 sample products pre-loaded

### Shopping Cart
- ✅ Add/remove products from cart
- ✅ Update quantities
- ✅ Real-time cart total calculation
- ✅ Cart synchronized with backend

### Order Management
- ✅ Place orders from cart
- ✅ Order confirmation with order ID
- ✅ View order history with status tracking
- ✅ Order items, amounts, and timestamps

### Dashboard
- ✅ User profile display (email, name)
- ✅ Quick stats (cart items, order count, total spent)
- ✅ Navigation to all app sections
- ✅ Logout functionality

---

## System Architecture

```
┌─────────────────────────────────────────┐
│       FRONTEND (React)                  │
│  ├─ Firebase Auth (Email/Password)     │
│  ├─ Login/Register                     │
│  ├─ Dashboard with Stats               │
│  ├─ Product Browsing                   │
│  ├─ Cart Management                    │
│  └─ Order History                      │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ↓
┌─────────────────────────────────────────┐
│  BACKEND (FastAPI on Cloud Run)         │
│  ├─ Firebase Token Verification        │
│  ├─ Structured JSON Logging            │
│  ├─ Auth Routes (/auth/me, /profile)   │
│  ├─ Product Routes (/products)         │
│  ├─ Cart Routes (/cart)                │
│  └─ Order Routes (/orders)             │
└──────────────┬──────────────────────────┘
               │ REST API
               ↓
┌─────────────────────────────────────────┐
│  FIRESTORE DATABASE                     │
│  ├─ users/{uid} - User profiles        │
│  ├─ products/{id} - Product catalog    │
│  ├─ carts/{uid} - Shopping carts       │
│  └─ orders/{id} - Order records        │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Registration Flow
1. User enters email, password, name, mobile
2. Firebase Auth creates user account with password hashing
3. Backend stores additional profile data in Firestore users collection
4. Firebase returns UID + ID token
5. User logged in and redirected to dashboard

### Purchase Flow
1. User browses products (fetched from Firestore)
2. Adds products to cart (stored locally + synced to backend)
3. Clicks "Place Order"
4. Backend creates order document in Firestore
5. Cart cleared after successful order
6. Order appears in order history

### API Security
1. Frontend gets ID token from Firebase Auth
2. Token sent in Authorization header: `Bearer {token}`
3. Backend verifies token signature with Firebase
4. Extracts user UID and email from token
5. Uses UID to filter user-specific data in Firestore

---

## Firestore Collections

### users/{firebase_uid}
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "mobilenumber": "1234567890",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### products/{product_id}
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

### carts/{firebase_uid}
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

### orders/{order_id}
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
  "created_at": "2024-01-15T14:30:00Z"
}
```

---

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health` | GET | No | Health check |
| `/products` | GET | No | List all products |
| `/products/{id}` | GET | No | Product details |
| `/auth/me` | GET | Yes | Get current user |
| `/auth/profile` | POST | Yes | Create/update profile |
| `/cart` | GET | Yes | Get user cart |
| `/cart/add` | POST | Yes | Add to cart |
| `/cart/remove` | POST | Yes | Remove from cart |
| `/orders/place` | POST | Yes | Create order |
| `/orders` | GET | Yes | Get user orders |

---

## Deployment Architecture

### Frontend
- **Platform**: Firebase Hosting
- **URL**: `https://test-99u1b3.web.app`
- **Features**: Auto-deployed on push, CDN, HTTPS, performance optimized

### Backend
- **Platform**: Google Cloud Run
- **URL**: `https://ecommerce-backend-xxxxx.asia-south1.run.app`
- **Features**: Serverless, auto-scaling, containerized, pay-per-use

### Database
- **Platform**: Google Cloud Firestore
- **Region**: asia-south1
- **Features**: NoSQL, real-time sync, automatic scaling, security rules

### Observability
- **Logging**: Google Cloud Logging (structured JSON)
- **Monitoring**: Google Cloud Monitoring (metrics, dashboards)
- **Error Tracking**: Google Cloud Error Reporting
- **Analytics**: Firebase Analytics (user behavior)

---

## Key Statistics

| Metric | Value |
|--------|-------|
| API Endpoints | 11 |
| Firestore Collections | 4 |
| Sample Products | 10 |
| Components (Frontend) | 7 |
| Backend Routes | 4 |
| Documentation Files | 7 |
| Lines of Code (Backend) | ~1,500 |
| Lines of Code (Frontend) | ~2,000 |

---

## Project Phases

### Phase 1: Planning & Setup ✅
- Define scope and architecture
- Create comprehensive documentation
- Plan implementation strategy

### Phase 2: Backend Implementation (Next)
- Firebase Auth middleware
- API endpoints
- Database operations
- Logging & monitoring
- Error handling

### Phase 3: Frontend Implementation
- Firebase Auth integration
- React components
- Cart & order management
- API integration
- Styling & responsiveness

### Phase 4: Testing & Optimization
- Unit & integration tests
- Performance optimization
- Security hardening
- Load testing

### Phase 5: Deployment
- Cloud Run setup
- Firebase Hosting setup
- Firestore configuration
- Product data import
- Monitoring setup

### Phase 6: Maintenance & Scaling
- Monitor metrics
- Fix issues
- Optimize queries
- Add new features

---

## Success Criteria

✅ **Functionality**: All features working end-to-end
✅ **Performance**: Page load < 3s, API response < 500ms
✅ **Reliability**: 99%+ uptime, proper error handling
✅ **Security**: Firebase tokens verified, data encrypted
✅ **Observability**: Structured logging, dashboards, alerts
✅ **Documentation**: Complete with examples and guides

---

## Future Enhancements

- Product search and filtering
- User reviews and ratings
- Wishlist functionality
- Payment integration (Stripe/Razorpay)
- Admin panel for product management
- Email notifications
- Push notifications
- Mobile app (React Native)
- Advanced analytics

---

## Team & Support

This project demonstrates full-stack cloud architecture suitable for:
- **Learning**: Understanding modern cloud development
- **Portfolio**: Showcasing cloud & full-stack skills
- **Production**: Real e-commerce use case
- **Scaling**: Built to handle growth

---

**Status**: Ready for implementation 🚀
