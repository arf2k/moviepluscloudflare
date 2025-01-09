// src/components/MovieSearch.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieSearch({ token }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  async function fetchMovies(searchTerm) {
    try {
      const response = await fetch(`${baseWorkerUrl}/search?s=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data)
      setResults(data.Search || []);
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
              <div key={movie.imdbID} className="movie">
                <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                <Link to={`/movie/${movie.imdbID}`}>
                  {movie.Title} ({movie.Year})
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
