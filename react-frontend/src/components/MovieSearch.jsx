import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieSearch() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  async function fetchMovies(searchTerm) {
    const searchUrl = `${baseWorkerUrl}/search?query=${encodeURIComponent(searchTerm)}`;
    console.log('Search URL:', searchUrl);
    console.log('Authorization Token:', token);

    try {
      const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response Status:', response.status);

      const data = await response.json();
      console.log('Response Data:', data);

      if (response.ok && data.results) {
        setResults(data.results);
      } else {
        setResults([]);
        console.error('No results found:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  }

  function handleInputChange(e) {
    const val = e.target.value.trim();
    setQuery(val);
    if (val.length > 2) fetchMovies(val);
    else setResults([]);
  }

  return (
    <div>
      <label htmlFor="movie-search">Search for a Movie:</label>
      <input
        id="movie-search"
        placeholder="Type to search..."
        value={query}
        onChange={handleInputChange}
      />

      <div>
        <h2>Search Results</h2>
        <div>
          {results.length > 0 ? (
            results.map((movie) => (
              <div key={movie.id} className="movie">
                {movie.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={`${movie.title} Poster`} />
                ) : (
                  <div className="placeholder">No Image Available</div>
                )}
                <Link to={`/movie/${movie.id}`}>
                  {movie.title} ({movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})
                </Link>
              </div>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
