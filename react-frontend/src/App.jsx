import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import RecommendationsPage from './pages/RecommendationsPage';
import FavoritesPage from './pages/FavoritesPage';
import BlurGuessGamePage from './pages/BlurGuessGamePage';

export default function App() {
  const baseWorkerUrl = import.meta.env.VITE_API_URL;

  return (
    <AuthProvider>
      <FavoritesProvider baseWorkerUrl={baseWorkerUrl}>
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
            path="/movie/:movieID"
            element={
              <ProtectedRoute>
                <MovieDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations/:movieID"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blur-guess-game"
            element={
              <ProtectedRoute>
                <BlurGuessGamePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </FavoritesProvider>
    </AuthProvider>
  );
}
