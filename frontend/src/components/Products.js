import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const Products = ({ onNavigate, onViewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    heading: {
      fontSize: '32px',
      color: '#333',
      marginBottom: '30px',
      fontWeight: 'bold',
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
      fontSize: '18px',
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
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'box-shadow 0.3s, transform 0.3s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    cardImage: {
      width: '100%',
      height: '200px',
      backgroundColor: '#f0f0f0',
      objectFit: 'cover',
      display: 'block',
    },
    cardContent: {
      padding: '15px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
      minHeight: '40px',
    },
    cardPrice: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '10px',
    },
    cardStock: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
    },
    cardButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
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
      transition: 'background-color 0.3s',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Products</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {products.length === 0 ? (
        <div style={styles.emptyMessage}>No products available</div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 2px 4px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img
                src={product.image_url || 'https://via.placeholder.com/250x200?text=No+Image'}
                alt={product.name}
                style={styles.cardImage}
              />
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{product.name}</h3>
                <p style={styles.cardPrice}>
                  ₹{product.price?.toLocaleString() || 'N/A'}
                </p>
                <p style={styles.cardStock}>
                  Stock: {product.stock || 0} available
                </p>
                <button
                  style={styles.cardButton}
                  onClick={() => onViewProduct(product.id)}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = '#0056b3')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = '#007bff')
                  }
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => onNavigate('dashboard')}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = '#0056b3')
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = '#007bff')
          }
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Products;
