import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieDetailPage() {
  const navigate = useNavigate();
  const { movieID } = useParams();
  const { token } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieID) {
      setError('Movie ID is missing.');
      return;
    }

    async function fetchMovieDetails() {
      try {
        const response = await fetch(`${baseWorkerUrl}/movie?id=${encodeURIComponent(movieID)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Unable to fetch movie details.');
        }

        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error('Movie detail fetch error:', err);
        setError(err.message || 'Could not fetch movie details.');
      }
    }

    fetchMovieDetails();
  }, [movieID, token]);

  const isFavorite = favorites.some((fav) => fav.movieId === parseInt(movieID, 10));

  if (error) return <p>{error}</p>;
  if (!movie) return <p>Loading...</p>;

  return (
    <>
      <div className="movie-detail-page">
        <h1>{movie.title}</h1>
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={`${movie.title} Poster`}
          />
        ) : (
          <div className="placeholder">No Image Available</div>
        )}
        <p>Released: {movie.release_date || 'N/A'}</p>
        <p>Runtime: {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
        <p>Rating: {movie.vote_average ? `${movie.vote_average}/10` : 'N/A'}</p>
        <p>
          Genres: {movie.genres ? movie.genres.map((g) => g.name).join(', ') : 'N/A'}
        </p>
        <p>Plot: {movie.overview || 'N/A'}</p>
        {isFavorite ? (
          <button onClick={() => removeFavorite(movie.movieId)}>Remove from Favorites</button>
        ) : (
          <button
            onClick={() =>
              addFavorite({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path, // Use `poster_path` here
              })
            }
          >
            Add to Favorites
          </button>
        )}
      </div>
      <div>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </>
  );
}
