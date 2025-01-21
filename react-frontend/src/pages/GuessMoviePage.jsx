import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function BlurGuessPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [randomMovie, setRandomMovie] = useState(null);
  const [blurLevel, setBlurLevel] = useState(20);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [hint, setHint] = useState('');
  const [gameState, setGameState] = useState('playing'); // 'playing', 'hint', 'correct', 'failed'

  const fetchRandomMovie = async () => {
    try {
      const response = await fetch(`${baseWorkerUrl}/random-movie`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch random movie.');

      const data = await response.json();
      if (!data.id) {
        throw new Error('Random movie does not contain a valid ID.');
      }

      setRandomMovie(data);
      resetGame();
    } catch (error) {
      console.error('Error fetching random movie:', error);
    }
  };

  const resetGame = () => {
    setBlurLevel(20);
    setGuess('');
    setGuesses(0);
    setHint('');
    setGameState('playing');
  };

  const handleGuess = () => {
    if (!randomMovie || gameState === 'correct' || gameState === 'failed') return;

    if (guess.trim().toLowerCase() === randomMovie.title.toLowerCase()) {
      setGameState('correct');
      setBlurLevel(0); // Unblur the image on correct guess
    } else {
      const newGuesses = guesses + 1;
      setGuesses(newGuesses);

      if (newGuesses === 2 && gameState === 'playing') {
        provideHint(); // Provide a hint after 2 wrong guesses
        setGameState('hint');
      } else if (newGuesses === 3) {
        setGameState('failed');
        setBlurLevel(0); // Unblur the image on failure
      } else {
        setBlurLevel((prev) => Math.max(0, prev - 10)); // Reduce blur for each wrong guess
      }
    }

    setGuess(''); // Clear the input for the next guess
  };

  const provideHint = () => {
    if (!randomMovie) return;

    const hints = [];
    if (randomMovie.release_date) hints.push(`Year: ${new Date(randomMovie.release_date).getFullYear()}`);
    if (randomMovie.genres && randomMovie.genres.length > 0) hints.push(`Genres: ${randomMovie.genres.join(', ')}`);
    if (randomMovie.overview) hints.push(`Overview: ${randomMovie.overview.split(' ').slice(0, 10).join(' ')}...`);
    if (randomMovie.original_language) hints.push(`Language: ${randomMovie.original_language}`);

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setHint(randomHint || 'No hint available.');
  };

  return (
    <div>
      <h1>Guess the Movie</h1>
      {!randomMovie ? (
        <button onClick={fetchRandomMovie}>Load Random Movie</button>
      ) : (
        <>
          <div
            style={{
              width: '300px',
              height: '450px',
              backgroundImage: `url(https://image.tmdb.org/t/p/w500${randomMovie.poster_path})`,
              backgroundSize: 'cover',
              filter: `blur(${blurLevel}px)`,
            }}
          />
          <p>Guesses: {guesses}/3</p>
          {hint && <p>Hint: {hint}</p>}
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            disabled={gameState === 'correct' || gameState === 'failed'}
          />
          <button onClick={handleGuess} disabled={gameState === 'correct' || gameState === 'failed'}>
            Submit Guess
          </button>
          {gameState === 'correct' && (
            <>
              <p>🎉 Correct! The movie was {randomMovie.title}.</p>
              <button onClick={() => navigate(`/movie/${randomMovie.id}`)}>Go to Movie Details</button>
            </>
          )}
          {gameState === 'failed' && (
            <>
              <p>❌ Failed! The movie was {randomMovie.title}. The full image is revealed.</p>
              <button onClick={() => navigate(`/movie/${randomMovie.id}`)}>Go to Movie Details</button>
            </>
          )}
          {(gameState === 'correct' || gameState === 'failed') && (
            <button onClick={fetchRandomMovie}>Play Again</button>
          )}
        </>
      )}
    </div>
  );
}
