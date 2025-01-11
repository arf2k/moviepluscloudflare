import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieDetailPage({ token }) {
  const navigate = useNavigate();
  const { movieID } = useParams();
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
        <p>
          Production Companies:{' '}
          {movie.production_companies
            ? movie.production_companies.map((p) => p.name).join(', ')
            : 'N/A'}
        </p>
        <p>
          Languages:{' '}
          {movie.spoken_languages
            ? movie.spoken_languages.map((l) => l.english_name).join(', ')
            : 'N/A'}
        </p>
      </div>
      <div>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </>
  );
}
