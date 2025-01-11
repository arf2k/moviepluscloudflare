import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div>
      <h1>Your Favorites</h1>
      {favorites.length > 0 ? (
        <div>
          {favorites.map((movie) => (
            <div key={movie.id} className="favorite-movie">
              {movie.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                  alt={`${movie.title} Poster`}
                />
              ) : (
                <div className="placeholder">No Image Available</div>
              )}
              <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
              <button onClick={() => removeFavorite(movie.id)}>Remove</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No favorites yet.</p>
      )}
      <Link to="/">Back to Search</Link>
    </div>
  );
}
