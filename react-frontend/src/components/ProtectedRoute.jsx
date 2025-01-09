import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  // Handle undefined auth gracefully
  if (!auth) {
    console.error('Auth context is undefined. Ensure AuthProvider is properly wrapping the component tree.');
    return <Navigate to="/login" replace />;
  }

  const { isLoggedIn } = auth;

  if (!isLoggedIn) {
    console.log('Redirecting to /login because user is not logged in.');
    return <Navigate to="/login" replace />;
  }

  console.log('Access granted to protected route.');
  return children;
}
