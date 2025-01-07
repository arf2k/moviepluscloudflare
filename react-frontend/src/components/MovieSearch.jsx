import React, { useState } from 'react';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieSearch({ token }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const fetchMovies = async (searchTerm) => {
    try {
      const response = await fetch(`${baseWorkerUrl}/search?s=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.Search) setResults(data.Search);
      else setResults([]);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setResults([]);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.trim();
    setQuery(val);
    if (val.length > 2) fetchMovies(val);
    else setResults([]);
  };

  return (
    <div id="search-section">
      <label htmlFor="movie-search">Search for a Movie:</label>
      <input 
        type="text"
        id="movie-search"
        placeholder="Type to search..."
        value={query}
        onChange={handleInputChange}
      />

      <div id="results-section">
        <h2>Search Results</h2>
        <div className="results">
          {results.length > 0 ? (
            results.map((movie) => (
              <div className="movie" key={movie.imdbID}>
                <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                {/* Link to detail page */}
                <a href={`/movie/${movie.imdbID}`}>
                  {movie.Title} ({movie.Year})
                </a>
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
