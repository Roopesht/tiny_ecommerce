import { auth } from '../firebase/config';

/**
 * API utility function that wraps fetch and automatically injects Firebase ID token
 * @param {string} endpoint - API endpoint (e.g., '/products', '/cart')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Promise resolving to JSON response
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    // Get Firebase ID token if user is logged in
    let token = null;
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }

    // Build headers with token injection
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // Make the fetch request
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    // Re-throw error with context
    throw error;
  }
};

/**
 * Helper functions for common HTTP methods
 */
export const api = {
  // GET request
  get: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'GET', ...options }),

  // POST request
  post: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  // PUT request
  put: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  // DELETE request
  delete: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'DELETE', ...options }),
};
