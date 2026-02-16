import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/api';

const ProductDetails = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details - memoized to avoid recreating on every render
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall(`/products/${productId}`);
      setProduct(data);
    } catch (err) {
      setError('Failed to load product: ' + err.message);
      console.error('Product details error:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch product details on component mount or when productId changes
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      setAddingToCart(true);
      setError('');
      setSuccess('');

      await apiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      setSuccess(`${product.name} added to cart!`);
      setQuantity(1);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add to cart: ' + err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    backButton: {
      color: '#007bff',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '30px',
      border: 'none',
      background: 'none',
      textDecoration: 'underline',
      padding: 0,
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    loadingMessage: {
      textAlign: 'center',
      fontSize: '18px',
      color: '#666',
      padding: '40px',
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
    layout: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      marginTop: '20px',
    },
    image: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
      backgroundColor: '#f0f0f0',
      maxHeight: '400px',
      objectFit: 'cover',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px',
    },
    category: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '20px',
    },
    price: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '20px',
    },
    stock: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
    },
    description: {
      fontSize: '16px',
      color: '#555',
      lineHeight: '1.6',
      marginBottom: '30px',
    },
    quantityContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
    },
    quantityLabel: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      minWidth: '80px',
    },
    quantityInput: {
      width: '80px',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      textAlign: 'center',
    },
    addButton: {
      padding: '15px 30px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'background-color 0.3s',
      width: '100%',
    },
    addButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    backLink: {
      padding: '10px 0',
      color: '#007bff',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      background: 'none',
      textDecoration: 'none',
      textAlign: 'left',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>Product not found</div>
        <button
          style={styles.backLink}
          onClick={() => onNavigate('products')}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        style={styles.backLink}
        onClick={() => onNavigate('products')}
      >
        ← Back to Products
      </button>

      <div style={styles.card}>
        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <div style={styles.layout}>
          <div>
            <img
              src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.name}
              style={styles.image}
            />
          </div>

          <div style={styles.details}>
            <h1 style={styles.title}>{product.name}</h1>
            {product.category && (
              <p style={styles.category}>Category: {product.category}</p>
            )}
            <p style={styles.price}>
              ₹{product.price?.toLocaleString() || 'N/A'}
            </p>
            <div style={styles.stock}>
              <strong>Stock:</strong> {product.stock || 0} units available
            </div>

            <p style={styles.description}>
              {product.description || 'No description available'}
            </p>

            <div style={styles.quantityContainer}>
              <label style={styles.quantityLabel}>Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.quantityInput}
                disabled={addingToCart}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              style={{
                ...styles.addButton,
                ...(addingToCart || product.stock === 0 ? styles.addButtonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.target.style.backgroundColor = '#218838';
                }
              }}
              onMouseLeave={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.target.style.backgroundColor = '#28a745';
                }
              }}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            {product.stock === 0 && (
              <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                This product is out of stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
