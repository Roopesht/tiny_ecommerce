import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import commonStyles from '../styles/commonStyles';

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


  return (
    <div style={commonStyles.containerLargeForm}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '28px', fontWeight: 'bold' }}>Register</h2>

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
            placeholder="At least 6 characters"
            style={commonStyles.input}
            required
          />
        </div>

        <div style={commonStyles.formGroup}>
          <label htmlFor="confirmPassword" style={commonStyles.label}>
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
            style={commonStyles.input}
            required
          />
        </div>

        <div style={commonStyles.twoColumnGroup}>
          <div>
            <label htmlFor="firstname" style={commonStyles.label}>
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
              style={commonStyles.input}
              required
            />
          </div>
          <div>
            <label htmlFor="lastname" style={commonStyles.label}>
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
              style={commonStyles.input}
              required
            />
          </div>
        </div>

        <div style={commonStyles.formGroup}>
          <label htmlFor="mobilenumber" style={commonStyles.label}>
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={commonStyles.linkContainer}>
        Already have an account?
        <span
          style={commonStyles.link}
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
