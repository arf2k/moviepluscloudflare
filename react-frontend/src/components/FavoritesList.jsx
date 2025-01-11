import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesList() {
  const { favorites } = useFavorites();

  return (
    <div id="favorites-section">
      <h2>Your Favorites</h2>
      {favorites.length > 0 ? (
        <div id="favorites-list">
          {favorites.map((movie) => (
            <div key={movie.movieId} className="favorite-item">
              {movie.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                  alt={`${movie.title} Poster`}
                />
              ) : (
                <div className="placeholder">No Image Available</div>
              )}
              <Link to={`/movie/${movie.movieId}`}>{movie.title}</Link>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no favorites yet.</p>
      )}
    </div>
  );
}
