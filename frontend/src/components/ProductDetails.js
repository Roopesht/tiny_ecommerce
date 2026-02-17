import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/api';
import commonStyles from '../styles/commonStyles';

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


  if (loading) {
    return (
      <div style={commonStyles.containerSmall}>
        <div style={commonStyles.loadingMessage}>Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={commonStyles.containerSmall}>
        <div style={commonStyles.errorMessage}>Product not found</div>
        <button
          style={commonStyles.backLink}
          onClick={() => onNavigate('products')}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={commonStyles.containerSmall}>
      <button
        style={commonStyles.backLink}
        onClick={() => onNavigate('products')}
      >
        ← Back to Products
      </button>

      <div style={commonStyles.card}>
        {error && <div style={commonStyles.errorMessage}>{error}</div>}
        {success && <div style={commonStyles.successMessage}>{success}</div>}

        <div style={commonStyles.gridTwoColumn}>
          <div>
            <img
              src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.name}
              style={commonStyles.productImage}
            />
          </div>

          <div style={commonStyles.productDetails}>
            <h1 style={commonStyles.productTitle}>{product.name}</h1>
            {product.category && (
              <p style={commonStyles.productCategory}>Category: {product.category}</p>
            )}
            <p style={commonStyles.productPrice}>
              ₹{product.price?.toLocaleString() || 'N/A'}
            </p>
            <div style={commonStyles.productStock}>
              <strong>Stock:</strong> {product.stock || 0} units available
            </div>

            <p style={commonStyles.productDescription}>
              {product.description || 'No description available'}
            </p>

            <div style={commonStyles.quantityContainer}>
              <label style={commonStyles.quantityLabel}>Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={commonStyles.quantityInput}
                disabled={addingToCart}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              style={{
                ...commonStyles.buttonSuccess,
                ...commonStyles.buttonFull,
                ...(addingToCart || product.stock === 0 ? commonStyles.buttonDisabled : {}),
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
