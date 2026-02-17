import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import commonStyles from '../styles/commonStyles';

const Login = ({ onSwitchToRegister }) => {
  const { login, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await login(formData.email, formData.password);
      setSuccess('Login successful!');
      // Navigation to dashboard will happen in App.js via useAuth hook
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };


  return (
    <div style={commonStyles.containerForm}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '28px', fontWeight: 'bold' }}>Login</h2>

      {(error || authError) && (
        <div style={commonStyles.errorMessage}>
          {error || authError}
        </div>
      )}

      {success && (
        <div style={commonStyles.successMessage}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={commonStyles.formGroup}>
          <label htmlFor="email" style={commonStyles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="you@example.com"
            style={commonStyles.input}
            required
          />
        </div>

        <div style={commonStyles.formGroup}>
          <label htmlFor="password" style={commonStyles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your password"
            style={commonStyles.input}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...commonStyles.buttonFull,
            ...(loading && commonStyles.buttonDisabled),
            marginTop: '10px',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={commonStyles.linkContainer}>
        Don't have an account?
        <span
          style={commonStyles.link}
          onClick={onSwitchToRegister}
          role="button"
          tabIndex={0}
        >
          Register
        </span>
      </div>
    </div>
  );
};

export default Login;
