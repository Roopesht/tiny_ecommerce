import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

const Dashboard = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const profileData = await apiCall('/auth/me');
      setProfile(profileData);

      // Fetch cart to get item count
      const cartData = await apiCall('/cart');
      setCartItems(cartData.total_items || 0);

      // Fetch orders to get count
      const ordersData = await apiCall('/orders');
      setOrdersCount(Array.isArray(ordersData) ? ordersData.length : 0);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Logout failed: ' + err.message);
    }
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '40px auto',
      padding: '30px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
    },
    heading: {
      fontSize: '32px',
      color: '#333',
      marginBottom: '10px',
      fontWeight: 'bold',
    },
    subheading: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '30px',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      margin: '30px 0',
    },
    stat: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid #eee',
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '10px',
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
    },
    buttonContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      margin: '30px 0',
    },
    button: {
      padding: '15px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    buttonDanger: {
      backgroundColor: '#dc3545',
    },
    buttonDangerHover: {
      backgroundColor: '#c82333',
    },
    errorMessage: {
      padding: '12px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      marginBottom: '20px',
      fontSize: '14px',
    },
    loadingMessage: {
      textAlign: 'center',
      fontSize: '16px',
      color: '#666',
      padding: '40px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingMessage}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {error && <div style={styles.errorMessage}>{error}</div>}

        <h1 style={styles.heading}>
          Welcome,{' '}
          {profile?.firstname ? `${profile.firstname}!` : 'Guest!'}
        </h1>

        <p style={styles.subheading}>
          {user?.email || 'No email'}
        </p>

        {/* Quick Stats */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#333' }}>
          Quick Stats
        </h3>
        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>{cartItems}</div>
            <div style={styles.statLabel}>Items in Cart</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>{ordersCount}</div>
            <div style={styles.statLabel}>Total Orders</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#333' }}>
          What would you like to do?
        </h3>
        <div style={styles.buttonContainer}>
          <button
            onClick={() => onNavigate('products')}
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#0056b3')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = '#007bff')
            }
          >
            Browse Products
          </button>
          <button
            onClick={() => onNavigate('cart')}
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#0056b3')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = '#007bff')
            }
          >
            View Cart
          </button>
          <button
            onClick={() => onNavigate('orders')}
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#0056b3')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = '#007bff')
            }
          >
            View Orders
          </button>
          <button
            onClick={handleLogout}
            style={{
              ...styles.button,
              ...styles.buttonDanger,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#c82333')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = '#dc3545')
            }
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
