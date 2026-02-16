import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { apiCall } from '../utils/api';

// Create the AuthContext
const AuthContext = createContext(null);

/**
 * AuthProvider component - wraps the app to provide authentication state
 * Must be placed at the top level of your app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Auto-refresh ID token every 50 minutes (tokens valid for 1 hour)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await user.getIdToken(true);
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  /**
   * Register new user with email, password, and profile data
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} profileData - {firstname, lastname, mobilenumber}
   */
  const register = async (email, password, profileData) => {
    try {
      setError(null);

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Create user profile in backend
      await apiCall('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          mobilenumber: profileData.mobilenumber,
        }),
      });

      setUser(newUser);
      return newUser;
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Handle Firebase authentication errors and return user-friendly messages
   */
  const handleAuthError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many login attempts, try again later',
      'auth/user-disabled': 'User account is disabled',
      'auth/operation-not-allowed': 'Operation not allowed',
    };

    return errorMessages[error.code] || error.message || 'An error occurred';
  };

  // Context value object
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context in components
 * Must be called inside a component wrapped by AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
