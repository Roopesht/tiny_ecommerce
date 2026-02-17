import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import commonStyles from '../styles/commonStyles';

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


  return (
    <div style={commonStyles.container}>
      <h1 style={commonStyles.heading}>Products</h1>

      {error && <div style={commonStyles.errorMessage}>{error}</div>}

      {loading && products.length === 0 ? (
        <div style={commonStyles.loadingMessage}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={commonStyles.emptyMessage}>No products available</div>
      ) : (
        <div style={commonStyles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={commonStyles.card}
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
                style={commonStyles.cardImage}
                loading="lazy"
              />
              <div style={commonStyles.cardContent}>
                <h3 style={commonStyles.cardTitle}>{product.name}</h3>
                <p style={commonStyles.cardPrice}>
                  ₹{product.price?.toLocaleString() || 'N/A'}
                </p>
                <p style={commonStyles.cardStock}>
                  Stock: {product.stock || 0} available
                </p>
                <button
                  style={commonStyles.cardButton}
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

      <div style={commonStyles.buttonContainerFlex}>
        <button
          style={commonStyles.button}
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
