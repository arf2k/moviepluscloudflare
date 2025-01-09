import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, token } = useAuth();
  console.log('ProtectedRoute check:', { isLoggedIn, token });

  if (!isLoggedIn) {
    console.log('Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('Access granted to protected route');
  return children;
}
