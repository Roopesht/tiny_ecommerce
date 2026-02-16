import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const Cart = ({ onNavigate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/cart');
      setCartItems(data.items || []);
      setTotalAmount(data.total_amount || 0);
    } catch (err) {
      setError('Failed to load cart: ' + err.message);
      console.error('Cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await apiCall('/cart/update', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });
      await fetchCart();
    } catch (err) {
      setError('Failed to update quantity: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setActionLoading(true);
      setError('');
      await apiCall('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
        }),
      });
      await fetchCart();
    } catch (err) {
      setError('Failed to remove item: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const response = await apiCall('/orders/place', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setSuccess('Order placed successfully!');
      setTimeout(() => {
        onNavigate('orders');
      }, 1500);
    } catch (err) {
      setError('Failed to place order: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    heading: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '30px',
    },
    errorMessage: {
      padding: '15px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    successMessage: {
      padding: '15px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    loadingMessage: {
      textAlign: 'center',
      fontSize: '16px',
      color: '#666',
      padding: '40px',
    },
    emptyMessage: {
      textAlign: 'center',
      fontSize: '16px',
      color: '#666',
      padding: '40px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '30px',
      border: '1px solid #ddd',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #ddd',
    },
    tableHeaderCell: {
      padding: '12px',
      textAlign: 'left',
      fontWeight: 'bold',
      color: '#333',
      fontSize: '14px',
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
    },
    tableRow: {
      backgroundColor: 'white',
    },
    tableRowAlt: {
      backgroundColor: '#fafafa',
    },
    quantityInput: {
      width: '60px',
      padding: '5px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      textAlign: 'center',
    },
    removeButton: {
      padding: '5px 10px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    totalContainer: {
      textAlign: 'right',
      padding: '20px',
      borderTop: '2px solid #ddd',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      marginBottom: '30px',
    },
    totalLabel: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
    },
    totalAmount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#007bff',
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      flex: 1,
    },
    buttonGreen: {
      backgroundColor: '#28a745',
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Shopping Cart</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      {cartItems.length === 0 ? (
        <div style={styles.emptyMessage}>
          Your cart is empty. <br />
          <button
            onClick={() => onNavigate('products')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Product</th>
                <th style={styles.tableHeaderCell}>Price</th>
                <th style={styles.tableHeaderCell}>Quantity</th>
                <th style={styles.tableHeaderCell}>Subtotal</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr
                  key={item.product_id}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <td style={styles.tableCell}>{item.name}</td>
                  <td style={styles.tableCell}>
                    ₹{item.price?.toLocaleString() || 'N/A'}
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.product_id,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      style={styles.quantityInput}
                      disabled={actionLoading}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      style={styles.removeButton}
                      disabled={actionLoading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.totalContainer}>
            <div style={styles.totalLabel}>
              Total: <span style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}

      <div style={styles.buttonContainer}>
        <button
          onClick={() => onNavigate('products')}
          style={styles.button}
        >
          Continue Shopping
        </button>
        {cartItems.length > 0 && (
          <button
            onClick={handlePlaceOrder}
            disabled={actionLoading || cartItems.length === 0}
            style={{
              ...styles.button,
              ...styles.buttonGreen,
              ...(actionLoading || cartItems.length === 0
                ? styles.buttonDisabled
                : {}),
            }}
          >
            {actionLoading ? 'Placing Order...' : 'Place Order'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart;
