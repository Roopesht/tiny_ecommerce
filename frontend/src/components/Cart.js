import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import commonStyles from '../styles/commonStyles';

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


  if (loading) {
    return (
      <div style={commonStyles.containerSmall}>
        <div style={commonStyles.loadingMessage}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div style={commonStyles.containerSmall}>
      <h1 style={commonStyles.headingMedium}>Shopping Cart</h1>

      {error && <div style={commonStyles.errorMessage}>{error}</div>}
      {success && <div style={commonStyles.successMessage}>{success}</div>}

      {cartItems.length === 0 ? (
        <div style={commonStyles.emptyMessage}>
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
          <table style={commonStyles.table}>
            <thead style={commonStyles.tableHeader}>
              <tr>
                <th style={commonStyles.tableHeaderCell}>Product</th>
                <th style={commonStyles.tableHeaderCell}>Price</th>
                <th style={commonStyles.tableHeaderCell}>Quantity</th>
                <th style={commonStyles.tableHeaderCell}>Subtotal</th>
                <th style={commonStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr
                  key={item.product_id}
                  style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <td style={commonStyles.tableCell}>{item.name}</td>
                  <td style={commonStyles.tableCell}>
                    ₹{item.price?.toLocaleString() || 'N/A'}
                  </td>
                  <td style={commonStyles.tableCell}>
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
                      style={commonStyles.quantityInput}
                      disabled={actionLoading}
                    />
                  </td>
                  <td style={commonStyles.tableCell}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </td>
                  <td style={commonStyles.tableCell}>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      style={commonStyles.buttonSmall}
                      disabled={actionLoading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={commonStyles.totalContainer}>
            <div style={commonStyles.totalLabel}>
              Total: <span style={commonStyles.totalAmount}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}

      <div style={commonStyles.buttonContainerFlex}>
        <button
          onClick={() => onNavigate('products')}
          style={commonStyles.button}
        >
          Continue Shopping
        </button>
        {cartItems.length > 0 && (
          <button
            onClick={handlePlaceOrder}
            disabled={actionLoading || cartItems.length === 0}
            style={{
              ...commonStyles.button,
              ...commonStyles.buttonSuccess,
              ...(actionLoading || cartItems.length === 0
                ? commonStyles.buttonDisabled
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
