import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieSearch from '../components/MovieSearch';
import FavoritesList from '../components/FavoritesList';

export default function HomePage({ token, isLoggedIn }) {
  const navigate = useNavigate();

  // Optional: If you want to force login
  if (!isLoggedIn) {
    // e.g., navigate('/login');
    return <p>You must be logged in. <a href="/login">Go to Login</a></p>;
  }

  return (
    <div className="container">
      <MovieSearch token={token} />
      <FavoritesList token={token} />
    </div>
  );
}
