import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const { register, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    mobilenumber: '',
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

  // Validate phone number (10 digits)
  const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
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
      setError('Please enter a password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.firstname.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!formData.lastname.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!formData.mobilenumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!isValidPhone(formData.mobilenumber)) {
      setError('Mobile number must be 10 digits');
      return;
    }

    try {
      await register(formData.email, formData.password, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        mobilenumber: formData.mobilenumber,
      });
      setSuccess('Registration successful! Redirecting to dashboard...');
      // Navigation happens in App.js via useAuth hook
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const styles = {
    container: {
      maxWidth: '450px',
      margin: '30px auto',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    heading: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px',
      fontSize: '28px',
      fontWeight: 'bold',
    },
    formGroup: {
      marginBottom: '20px',
    },
    twoColumnGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#333',
      fontWeight: '500',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      marginTop: '10px',
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    errorMessage: {
      padding: '12px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      marginBottom: '20px',
      fontSize: '14px',
    },
    successMessage: {
      padding: '12px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '4px',
      marginBottom: '20px',
      fontSize: '14px',
    },
    linkContainer: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '14px',
      color: '#666',
    },
    link: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 'bold',
      marginLeft: '5px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Register</h2>

      {(error || authError) && (
        <div style={styles.errorMessage}>
          {error || authError}
        </div>
      )}

      {success && (
        <div style={styles.successMessage}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
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
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="At least 6 characters"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            placeholder="Confirm your password"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.twoColumnGroup}>
          <div>
            <label htmlFor="firstname" style={styles.label}>
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={loading}
              placeholder="John"
              style={styles.input}
              required
            />
          </div>
          <div>
            <label htmlFor="lastname" style={styles.label}>
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={loading}
              placeholder="Doe"
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="mobilenumber" style={styles.label}>
            Mobile Number (10 digits)
          </label>
          <input
            type="tel"
            id="mobilenumber"
            name="mobilenumber"
            value={formData.mobilenumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="1234567890"
            style={styles.input}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading && styles.buttonDisabled),
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={styles.linkContainer}>
        Already have an account?
        <span
          style={styles.link}
          onClick={onSwitchToLogin}
          role="button"
          tabIndex={0}
        >
          Login
        </span>
      </div>
    </div>
  );
};

export default Register;
