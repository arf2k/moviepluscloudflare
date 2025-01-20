import React from 'react';
import { useAuth } from '../context/AuthContext';
import MovieSearch from '../components/MovieSearch';
import FavoritesList from '../components/FavoritesList';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <div>
      <header>
        <h1>Movie Finder TESTING FRONTEND DEV CHANGE</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="container">
        <MovieSearch />
        <FavoritesList />
      </div>
    </div>
  );
}
