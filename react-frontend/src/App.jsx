import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import AuthForm from './components/AuthForm';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const navigate = useNavigate();

  useEffect(() => {
    // If token changes, update isLoggedIn
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    navigate('/'); // Navigate to home page after login
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePage token={token} isLoggedIn={isLoggedIn} />} 
      />
      <Route 
        path="/login" 
        element={
          <AuthForm 
            onLoginSuccess={handleLoginSuccess} 
          />
        } 
      />
      <Route 
        path="/movie/:imdbID" 
        element={<MovieDetailPage token={token} isLoggedIn={isLoggedIn} />} 
      />
    </Routes>
  );
}
