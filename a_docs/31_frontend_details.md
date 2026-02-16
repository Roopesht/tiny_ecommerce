# Frontend Implementation Details & Addendum

Complete React implementation guide with patterns, hooks, and best practices.

## Table of Contents
1. Project Setup & Configuration
2. Firebase Integration Details
3. Context API & State Management
4. Component Implementation Patterns
5. Custom Hooks
6. Styling System
7. Error Handling & Validation
8. API Integration Patterns
9. Performance Optimization
10. Testing Strategy

---

## 1. Project Setup & Configuration

### 1.1 Initialize React Project

```bash
cd ecommerce-frontend
npx create-react-app .
npm install firebase
```

### 1.2 Environment Configuration

Create `.env`:
```
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Create `.env.production`:
```
REACT_APP_API_BASE_URL=https://ecommerce-backend-xxxxx.asia-south1.run.app
REACT_APP_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=test-99u1b3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=test-99u1b3
REACT_APP_FIREBASE_STORAGE_BUCKET=test-99u1b3.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 1.3 NPM Scripts

Update `package.json`:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

---

## 2. Firebase Integration

### 2.1 Firebase Config (`src/firebase/config.js`)

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Analytics (optional)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available:', error);
}

export { analytics };
```

### 2.2 Firebase Auth Service (`src/services/authService.js`)

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const authService = {
  /**
   * Register new user with email and password
   */
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }

      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get ID token for API calls
   */
  async getIdToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  },

  /**
   * Handle Firebase auth errors
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many login attempts, try again later',
      'auth/user-disabled': 'User account is disabled'
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  }
};
```

---

## 3. Context API & State Management

### 3.1 Auth Context (`src/context/AuthContext.js`)

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const token = await authService.getIdToken();
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token every 50 minutes (token valid for 1 hour)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const token = await authService.getIdToken();
      setIdToken(token);
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const register = async (email, password, userData) => {
    try {
      setError(null);
      const newUser = await authService.register(email, password, userData.firstname);
      setUser(newUser);
      const token = await authService.getIdToken();
      setIdToken(token);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const authUser = await authService.login(email, password);
      setUser(authUser);
      const token = await authService.getIdToken();
      setIdToken(token);
      return authUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      setIdToken(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    idToken,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3.2 Cart Context (`src/context/CartContext.js`)

```javascript
import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addItem = useCallback((product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

---

## 4. Component Implementation Patterns

### 4.1 Login Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils/validation';

export const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {(formError || error) && (
          <div className="error-message">{formError || error}</div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

### 4.2 Protected Route Component

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### 4.3 Products Component with Pagination

```javascript
import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(
        `/products?page=${page}&limit=${pageSize}`
      );
      setProducts(response);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <h2>Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## 5. Custom Hooks

### 5.1 useFetch Hook

```javascript
import { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiCall(endpoint, options);

        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, loading, error };
};

// Usage
const { data: products, loading, error } = useFetch('/products');
```

### 5.2 useLocalStorage Hook

```javascript
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Usage
const [preferences, setPreferences] = useLocalStorage('userPrefs', {});
```

### 5.3 useAsync Hook

```javascript
import { useEffect, useState, useCallback } from 'react';

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
```

---

## 6. Styling System

### 6.1 Global Styles (`src/styles/globals.css`)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;

  --text-color: #333333;
  --text-light: #666666;
  --border-color: #dddddd;
  --bg-light: #f8f9fa;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --border-radius: 4px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  --transition: all 0.3s ease;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  background-color: #ffffff;
}

button {
  cursor: pointer;
  font-size: 1rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: white;
  transition: var(--transition);
}

button:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input, select, textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  margin-bottom: var(--spacing-md);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.error {
  color: var(--danger-color);
  background-color: #fff5f5;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.success {
  color: var(--success-color);
  background-color: #f0f9f0;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}
```

### 6.2 Component Styles Pattern

```javascript
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },

  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },

  button: {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.3s'
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem'
    }
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },

  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

// Usage
<div style={styles.container}>
  <div style={styles.grid}>
    {/* Items */}
  </div>
</div>
```

---

## 7. Error Handling & Validation

### 7.1 Validation Utilities (`src/utils/validation.js`)

```javascript
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhoneNumber = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    } else if (rule.validator && value && !rule.validator(value)) {
      errors[field] = rule.errorMessage || `${field} is invalid`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Usage
const rules = {
  email: {
    required: true,
    validator: validateEmail,
    errorMessage: 'Invalid email'
  },
  password: {
    required: true,
    validator: validatePassword,
    errorMessage: 'Password must be 6+ characters'
  }
};

const { isValid, errors } = validateForm(formData, rules);
```

### 7.2 Error Boundary

```javascript
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 8. API Integration Patterns

### 8.1 API Utility with Token (`src/utils/api.js`)

```javascript
import { authService } from '../services/authService';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

export const apiCall = async (endpoint, options = {}) => {
  const token = await authService.getIdToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  return handleResponse(response);
};

// HTTP method helpers
export const api = {
  get: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'GET', ...options }),

  post: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    }),

  put: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    }),

  delete: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'DELETE', ...options })
};

// Usage
await api.get('/products');
await api.post('/cart/add', { product_id: '123', quantity: 1 });
```

### 8.2 Request/Response Interceptor Pattern

```javascript
export class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
  }

  addRequestInterceptor(callback) {
    this.interceptors.request.push(callback);
  }

  addResponseInterceptor(callback) {
    this.interceptors.response.push(callback);
  }

  addErrorInterceptor(callback) {
    this.interceptors.error.push(callback);
  }

  async request(endpoint, options = {}) {
    let config = { ...options };

    // Run request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let data = await response.json();

      // Run response interceptors
      for (const interceptor of this.interceptors.response) {
        data = await interceptor(data);
      }

      return data;
    } catch (error) {
      // Run error interceptors
      for (const interceptor of this.interceptors.error) {
        await interceptor(error);
      }
      throw error;
    }
  }
}

// Usage
const client = new APIClient(process.env.REACT_APP_API_BASE_URL);

client.addRequestInterceptor(async (config) => {
  const token = await authService.getIdToken();
  config.headers = {
    ...config.headers,
    'Authorization': `Bearer ${token}`
  };
  return config;
});

client.addErrorInterceptor(async (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized - redirect to login
  }
});
```

---

## 9. Performance Optimization

### 9.1 Code Splitting with React.lazy

```javascript
import React, { Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));

export const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </Suspense>
  );
};
```

### 9.2 Image Optimization Component

```javascript
export const OptimizedImage = ({ src, alt, width, height }) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [imageRef, setImageRef] = React.useState();

  React.useEffect(() => {
    let observer;

    if (imageRef && imageSrc === null) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }

    return () => observer?.disconnect();
  }, [imageRef, imageSrc, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      style={{ backgroundColor: '#f0f0f0' }}
    />
  );
};
```

### 9.3 Memoization Pattern

```javascript
import { memo, useMemo } from 'react';

// Prevent unnecessary re-renders
const ProductCard = memo(({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <img src={product.image_url} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">₹{product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});

// Memoize expensive calculations
const CartTotal = ({ items }) => {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return <div>Total: ₹{total.toFixed(2)}</div>;
};
```

---

## 10. Testing Strategy

### 10.1 Unit Tests with Jest

```javascript
import { validateEmail, validatePassword } from '../utils/validation';

describe('Validation Utilities', () => {
  test('validateEmail with valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('validateEmail with invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('validatePassword with valid password', () => {
    expect(validatePassword('password123')).toBe(true);
  });

  test('validatePassword with short password', () => {
    expect(validatePassword('pass')).toBe(false);
  });
});
```

### 10.2 Component Tests with React Testing Library

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../components/Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });
});
```

---

## NPM Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "firebase": "^10.6.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "source-map-explorer": "^2.5.3"
  }
}
```

---

## Project Best Practices

### ✅ DO
- Use custom hooks to share logic
- Memoize expensive computations
- Split code for lazy loading
- Validate input before sending to API
- Use environment variables for config
- Log errors for debugging
- Write tests for critical paths
- Use semantic HTML
- Optimize images
- Handle loading and error states

### ❌ DON'T
- Hardcode API URLs
- Store sensitive data in localStorage
- Use inline styles everywhere
- Fetch on every render
- Ignore console errors
- Trust user input
- Create components in render methods
- Use state for things that don't change
- Forget cleanup in useEffect
- Make unnecessary API calls

---

## Debugging Commands

```bash
# Start with source maps for debugging
npm start

# Analyze bundle size
npm run analyze

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- Login.test.js

# Check for accessibility issues
npm install -D axe-core
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Firebase auth working in production
- [ ] API calls use correct production URL
- [ ] Error handling displays user-friendly messages
- [ ] Loading states implemented
- [ ] Images optimized
- [ ] Code split and lazy loaded
- [ ] Analytics configured
- [ ] Error logging setup
- [ ] Tested on multiple browsers
- [ ] Mobile responsive
- [ ] Performance metrics good
- [ ] Security review complete
- [ ] All console errors resolved
