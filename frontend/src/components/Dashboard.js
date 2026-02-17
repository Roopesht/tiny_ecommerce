import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';
import commonStyles from '../styles/commonStyles';

const Dashboard = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError('');
        setProfile({ firstname: 'User' }); // Show a default profile immediately
        setCartItems(0);
        setOrdersCount(0);

        // Load actual data in background
        const profileData = await apiCall('/auth/me');
        setProfile(profileData);
        const cartData = await apiCall('/cart');
        setCartItems(cartData.total_items || 0);
        const ordersData = await apiCall('/orders');
        setOrdersCount(Array.isArray(ordersData) ? ordersData.length : 0);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout().catch((err) => {
      setError('Logout failed: ' + err.message);
    });
  };

  return (
    <div style={commonStyles.containerSmall}>
      <div style={commonStyles.card}>
        {error && <div style={commonStyles.errorMessage}>{error}</div>}

        <h1 style={commonStyles.headingLarge}>
          Welcome, {profile?.firstname ? `${profile.firstname}!` : 'Guest!'}
        </h1>
        <p style={commonStyles.subheading}>{user?.email || 'No email'}</p>

        <div style={commonStyles.statsContainer}>
          <div style={commonStyles.stat}>
            <div style={commonStyles.statNumber}>{cartItems !== null ? cartItems : '–'}</div>
            <div style={commonStyles.statLabel}>Items in Cart</div>
          </div>
          <div style={commonStyles.stat}>
            <div style={commonStyles.statNumber}>{ordersCount !== null ? ordersCount : '–'}</div>
            <div style={commonStyles.statLabel}>Total Orders</div>
          </div>
        </div>

        <div style={commonStyles.buttonContainer}>
          <button
            onClick={() => onNavigate('products')}
            style={commonStyles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
          >
            Browse Products
          </button>
          <button
            onClick={() => onNavigate('cart')}
            style={commonStyles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
          >
            View Cart
          </button>
          <button
            onClick={() => onNavigate('orders')}
            style={commonStyles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
          >
            View Orders
          </button>
          <button
            onClick={handleLogout}
            style={{ ...commonStyles.button, ...commonStyles.buttonDanger }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#c82333')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#dc3545')}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
