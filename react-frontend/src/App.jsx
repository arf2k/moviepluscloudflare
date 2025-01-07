// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('authToken');
  };

  return (
    <Routes>
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <HomePage token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:imdbID"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MovieDetailPage token={token} />
          </ProtectedRoute>
        }
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
