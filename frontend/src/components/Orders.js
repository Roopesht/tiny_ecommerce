import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

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

  const styles = {
    container: {
      maxWidth: '900px',
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
    orderCard: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '15px',
      overflow: 'hidden',
      backgroundColor: 'white',
    },
    orderHeader: {
      padding: '15px',
      backgroundColor: '#f8f9fa',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #ddd',
      transition: 'background-color 0.3s',
    },
    orderHeaderHover: {
      backgroundColor: '#e9ecef',
    },
    orderInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '20px',
      alignItems: 'center',
      flex: 1,
    },
    orderLabel: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px',
    },
    orderValue: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
    },
    statusBadge: {
      padding: '5px 12px',
      borderRadius: '4px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px',
      display: 'inline-block',
    },
    expandIcon: {
      fontSize: '20px',
      color: '#666',
      marginLeft: '20px',
    },
    orderDetails: {
      padding: '15px',
      backgroundColor: '#fafafa',
      borderTop: '1px solid #ddd',
    },
    itemsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '15px',
    },
    tableHeader: {
      backgroundColor: '#f0f0f0',
      borderBottom: '1px solid #ddd',
    },
    tableHeaderCell: {
      padding: '10px',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: '12px',
      color: '#333',
    },
    tableCell: {
      padding: '10px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
    },
    totalSection: {
      textAlign: 'right',
      padding: '10px',
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#007bff',
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
      width: '100%',
      marginTop: '20px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Order History</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {orders.length === 0 ? (
        <div style={styles.emptyMessage}>
          You have no orders yet.
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div
              style={styles.orderHeader}
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
              <div style={styles.orderInfo}>
                <div>
                  <div style={styles.orderLabel}>Order ID</div>
                  <div style={styles.orderValue}>{order.id}</div>
                </div>
                <div>
                  <div style={styles.orderLabel}>Date</div>
                  <div style={styles.orderValue}>
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div>
                  <div style={styles.orderLabel}>Status</div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    {order.status || 'PLACED'}
                  </div>
                </div>
                <div>
                  <div style={styles.orderLabel}>Total</div>
                  <div style={styles.orderValue}>
                    ₹{order.total_amount?.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={styles.expandIcon}>
                {expandedOrderId === order.id ? '▼' : '▶'}
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div style={styles.orderDetails}>
                <h4 style={{ marginTop: 0, color: '#333' }}>
                  Order Items
                </h4>
                <table style={styles.itemsTable}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Product</th>
                      <th style={styles.tableHeaderCell}>Price</th>
                      <th style={styles.tableHeaderCell}>Quantity</th>
                      <th style={styles.tableHeaderCell}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, index) => (
                      <tr key={index}>
                        <td style={styles.tableCell}>{item.name}</td>
                        <td style={styles.tableCell}>
                          ₹{item.price?.toLocaleString()}
                        </td>
                        <td style={styles.tableCell}>{item.quantity}</td>
                        <td style={styles.tableCell}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={styles.totalSection}>
                  Order Total: ₹{order.total_amount?.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={() => onNavigate('dashboard')}
        style={styles.button}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Orders;
