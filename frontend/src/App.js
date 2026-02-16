import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Orders from './components/Orders';

/**
 * Main App Component - Handles routing via mode-based navigation
 * Instead of React Router, we use simple state to switch between pages
 */
function AppContent() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Show loading spinner while authentication initializes
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Loading...
      </div>
    );
  }

  // If not logged in, show login/register pages
  if (!user) {
    return mode === 'register' ? (
      <Register onSwitchToLogin={() => setMode('login')} />
    ) : (
      <Login onSwitchToRegister={() => setMode('register')} />
    );
  }

  // Helper function to navigate to product details
  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setMode('productDetail');
  };

  // Render based on current mode
  switch (mode) {
    case 'dashboard':
      return <Dashboard onNavigate={setMode} />;

    case 'products':
      return (
        <Products
          onNavigate={setMode}
          onViewProduct={handleViewProduct}
        />
      );

    case 'productDetail':
      return (
        <ProductDetails
          productId={selectedProductId}
          onNavigate={setMode}
        />
      );

    case 'cart':
      return <Cart onNavigate={setMode} />;

    case 'orders':
      return <Orders onNavigate={setMode} />;

    default:
      return <Dashboard onNavigate={setMode} />;
  }
}

/**
 * Main App - Wraps with AuthProvider for authentication context
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
