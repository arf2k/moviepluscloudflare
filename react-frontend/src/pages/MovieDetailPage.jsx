import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;
export default function MovieDetailPage({ token }) {
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
          console.log(data)
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
    <><div className="movie-detail-page">
            <h1>{movie.Title}</h1>
            <img src={movie.Poster} alt={`${movie.Title} Poster`} />
            <p>Released: {movie.Released}</p>
            <p>Runtime: {movie.Runtime}</p>
            <p>Genre: {movie.Genre}</p>
            <p>Director: {movie.Director}</p>
            <p>IMDB Rating: {movie.imdbRating}</p>
            <p>Plot: {movie.Plot}</p>
       </div>
       <div>
       <button onClick={() => navigate(-1)}>Back</button>
       </div>
    </>
  );
}
