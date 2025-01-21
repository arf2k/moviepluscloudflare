import React from 'react';
import { useAuth } from '../context/AuthContext';
import MovieSearch from '../components/MovieSearch';
import FavoritesList from '../components/FavoritesList';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <div>
      <header>
        <h1>Movie Finder</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="container">
        <MovieSearch />
        <FavoritesList />
        <div className="game-link">
          <Link to="/random-movie">Play Blur Guess Game</Link>
        </div>
      </div>
    </div>
  );
}
