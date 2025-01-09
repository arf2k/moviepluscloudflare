import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [loading, setLoading] = useState(false); // Added loading state

  useEffect(() => {
    console.log('Token changed:', token);
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setLoading(true); // Indicate state is updating
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    setLoading(false); // Reset loading once state is updated
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('authToken');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}>
            <HomePage token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:imdbID"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}>
            <MovieDetailPage token={token} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
      />
      <Route path="/register" element={<RegistrationPage />} />
    </Routes>
  );
}
