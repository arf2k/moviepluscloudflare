// src/pages/MovieDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function MovieDetailPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${baseWorkerUrl}/movie?id=${imdbID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setMovie(data);
        }
      })
      .catch((err) => {
        console.error('Movie detail fetch error:', err);
        setError('Could not fetch movie details.');
      });
  }, [imdbID, token]);

  if (error) return <p>{error}</p>;
  if (!movie) return <p>Loading...</p>;

  return (
    <div className="movie-detail-page">
 <h1>{movie.Title}</h1>
        <img src={movie.Poster} alt={`${movie.Title} Poster`} />
        <p>Released: {movie.Released}</p>
        <p>Runtime: {movie.Runtime}</p>
        <p>Language: {movie.Language}</p>
        <p>Country: {movie.Country}</p>
        <p>BoxOffice: {movie.BoxOffice}</p>
        <p>Production: {movie.Production}</p>
        <p>Writer: {movie.Writer}</p>
        <p>Year: {movie.Year}</p>
        <p>Rated: {movie.Rated}</p>
        <p>Metascore: {movie.Metascore}</p>
        <p>imdbVotes: {movie.imdbVotes}</p>
        <p>Genre: {movie.Genre}</p>
        <p>Director: {movie.Director}</p>
        <p>Actors: {movie.Actors} </p>
        <p>Awards: {movie.Awards} </p>
        <p>IMDB Rating: {movie.imdbRating}</p>
        <p></p>
        <p>Plot: {movie.Plot}</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
