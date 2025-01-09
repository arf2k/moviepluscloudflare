// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
<Routes>
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    }
  />
  <Route
    path="/movie/:imdbID"
    element={
      <ProtectedRoute>
        <MovieDetailPage />
      </ProtectedRoute>
    }
  />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegistrationPage />} />
  <Route
    path="*"
    element={
      <Navigate to={useAuth().isLoggedIn ? '/' : '/login'} replace />
    }
  />
</Routes>

    </AuthProvider>
  );
}
