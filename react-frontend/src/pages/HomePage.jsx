import React from 'react';
import MovieSearch from '../components/MovieSearch';
import FavoritesList from '../components/FavoritesList';

export default function HomePage({ token, onLogout }) {
  return (
    <div>
      <header>
        <h1>Movie Finder</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <div className="container">
        <MovieSearch token={token} />
        <FavoritesList token={token} />
      </div>
    </div>
  );
}
