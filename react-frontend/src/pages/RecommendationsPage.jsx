import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function RecommendationsPage() {
  const { movieID } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
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
        setError(err.message || 'Could not fetch recommendations.');
      }
    }

    fetchRecommendations();
  }, [movieID, token]);

  if (error) return <p>{error}</p>;
  if (recommendations.length === 0) return <p>No recommendations found.</p>;

  return (
    <>
      <h1>Recommended Movies</h1>
      <button onClick={() => navigate(-1)}>Back</button>
      <div className="recommendations-list">
        {recommendations.map((movie) => (
          <div key={movie.id} className="recommendation-item">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={`${movie.title} Poster`}
              />
            ) : (
              <div className="placeholder">No Image Available</div>
            )}
            <Link to={`/movie/${movie.id}`}>
          {movie.title} ({movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})
        </Link>
        <Link to="/">
        <button>Back to Search</button>
      </Link>
      </div>
        ))}
      </div>
    </>
  );
}
