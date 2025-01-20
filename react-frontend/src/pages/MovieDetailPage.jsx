import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieDetailPage() {
  const navigate = useNavigate();
  const { movieID } = useParams();
  const { token } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(true);

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

    async function fetchRecommendations() {
      try {
        const response = await fetch(`${baseWorkerUrl}/recommendations?id=${encodeURIComponent(movieID)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Unable to fetch recommendations.');
        }

        const data = await response.json();
        setRecommendations(data.results || []);
      } catch (err) {
        console.error('Recommendations fetch error:', err);
      } finally {
        setLoadingRecs(false);
      }
    }

    fetchMovieDetails();
    fetchRecommendations();
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
            onClick={() => {
              console.log('Adding favorite with data:', {
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
              });
              console.log(movie)
              addFavorite({
                movieId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
              });
            }}
          >
            Add to Favorites
          </button>
        )}
      </div>

      <div className="recommendations-section">
        <h2>Recommended Movies</h2>
        {loadingRecs ? (
          <p>Loading recommendations...</p>
        ) : recommendations.length > 0 ? (
          <div className="recommendations-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item">
                {rec.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                    alt={`${rec.title} Poster`}
                  />
                ) : (
                  <div className="placeholder">No Image Available</div>
                )}
                <Link to={`/movie/${rec.id}`}>
                  {rec.title} ({rec.release_date ? new Date(rec.release_date).getFullYear() : 'N/A'})
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendations found.</p>
        )}
      </div>

      <div>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </>
  );
}
