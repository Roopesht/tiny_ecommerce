import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import commonStyles from '../styles/commonStyles';

const Orders = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error('Orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(
      expandedOrderId === orderId ? null : orderId
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED':
        return '#007bff';
      case 'PROCESSING':
        return '#ffc107';
      case 'SHIPPED':
        return '#ff9800';
      case 'DELIVERED':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };


  if (loading) {
    return (
      <div style={commonStyles.containerMedium}>
        <div style={commonStyles.loadingMessage}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={commonStyles.containerMedium}>
      <h1 style={commonStyles.headingMedium}>Order History</h1>

      {error && <div style={commonStyles.errorMessage}>{error}</div>}

      {orders.length === 0 ? (
        <div style={commonStyles.emptyMessage}>
          You have no orders yet.
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={commonStyles.orderCard}>
            <div
              style={commonStyles.orderHeader}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onClick={() => toggleExpand(order.id)}
              role="button"
              tabIndex={0}
            >
              <div style={commonStyles.orderInfo}>
                <div>
                  <div style={commonStyles.orderLabel}>Order ID</div>
                  <div style={commonStyles.orderValue}>{order.id}</div>
                </div>
                <div>
                  <div style={commonStyles.orderLabel}>Date</div>
                  <div style={commonStyles.orderValue}>
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div>
                  <div style={commonStyles.orderLabel}>Status</div>
                  <div
                    style={{
                      ...commonStyles.statusBadge,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    {order.status || 'PLACED'}
                  </div>
                </div>
                <div>
                  <div style={commonStyles.orderLabel}>Total</div>
                  <div style={commonStyles.orderValue}>
                    ₹{order.total_amount?.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#666', marginLeft: '20px' }}>
                {expandedOrderId === order.id ? '▼' : '▶'}
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div style={commonStyles.orderDetails}>
                <h4 style={{ marginTop: 0, color: '#333' }}>
                  Order Items
                </h4>
                <table style={commonStyles.table}>
                  <thead style={commonStyles.tableHeader}>
                    <tr>
                      <th style={commonStyles.tableHeaderCell}>Product</th>
                      <th style={commonStyles.tableHeaderCell}>Price</th>
                      <th style={commonStyles.tableHeaderCell}>Quantity</th>
                      <th style={commonStyles.tableHeaderCell}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, index) => (
                      <tr key={index}>
                        <td style={commonStyles.tableCell}>{item.name}</td>
                        <td style={commonStyles.tableCell}>
                          ₹{item.price?.toLocaleString()}
                        </td>
                        <td style={commonStyles.tableCell}>{item.quantity}</td>
                        <td style={commonStyles.tableCell}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', fontSize: '16px', color: '#007bff' }}>
                  Order Total: ₹{order.total_amount?.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={() => onNavigate('dashboard')}
        style={{ ...commonStyles.button, width: '100%', marginTop: '20px' }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Orders;
