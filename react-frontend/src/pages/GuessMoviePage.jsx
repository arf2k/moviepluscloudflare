// // import React, { useState } from 'react';
// // import { useAuth } from '../context/AuthContext';

// // const baseWorkerUrl = import.meta.env.VITE_API_URL;

// // export default function BlurGuessGamePage() {
// //   const [movie, setMovie] = useState(null);
// //   const [blurLevel, setBlurLevel] = useState(20); // Start with maximum blur
// //   const [guess, setGuess] = useState('');
// //   const [result, setResult] = useState('');
// //      const { token } = useAuth();
  

// //   const fetchRandomMovie = async () => {
// //     try {
// //       const response = await fetch(`${baseWorkerUrl}/random-movie`, {
// //         headers: {
// //           Authorization: `Bearer ${(token)}`,
// //         },
// //       });

// //       if (!response.ok) {
// //         const error = await response.json();
// //         throw new Error(error.message || 'Failed to fetch random movie');
// //       }

// //       const data = await response.json();
// //       setMovie(data);
// //       setBlurLevel(20); // Reset blur when fetching a new movie
// //       setResult('');
// //       setGuess('');
// //     } catch (error) {
// //       console.error('Error fetching random movie:', error);
// //     }
// //   };

// //   const handleGuess = () => {
// //     if (!movie) return;
// //     if (guess.toLowerCase() === movie.title.toLowerCase()) {
// //       setResult('Correct!');
// //       setBlurLevel(0); // Reveal the image
// //     } else {
// //       setResult('Try again!');
// //     }
// //   };

// //   const handleBlurChange = (e) => {
// //     setBlurLevel(e.target.value);
// //   };

// //   return (
// //     <div className="blur-guess-game">
// //       <h1>Guess the Movie</h1>
// //       <button onClick={fetchRandomMovie}>Get Random Movie</button>
// //       {movie ? (
// //         <div className="game-container">
// //           <img
// //             src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
// //             alt="Movie Poster"
// //             style={{
// //               filter: `blur(${blurLevel}px)`,
// //               transition: 'filter 0.3s ease',
// //             }}
// //           />
// //           <input
// //             type="range"
// //             min="0"
// //             max="20"
// //             value={blurLevel}
// //             onChange={handleBlurChange}
// //           />
// //           <input
// //             type="text"
// //             placeholder="Your guess..."
// //             value={guess}
// //             onChange={(e) => setGuess(e.target.value)}
// //           />
// //           <button onClick={handleGuess}>Submit Guess</button>
// //           {result && <p>{result}</p>}
// //         </div>
// //       ) : (
// //         <p>Click "Get Random Movie" to start the game!</p>
// //       )}
// //     </div>
// //   );
// // }
// import React, { useState } from 'react';

// const baseWorkerUrl = import.meta.env.VITE_API_URL;

// export default function BlurGuessGamePage() {
//   const [movie, setMovie] = useState(null);
//   const [blurLevel, setBlurLevel] = useState(20); // Start with maximum blur
//   const [guess, setGuess] = useState('');
//   const [result, setResult] = useState('');

//   const fetchRandomMovie = async () => {
//     try {
//       const response = await fetch(`${baseWorkerUrl}/random-movie`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Use stored token
//         },
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Failed to fetch random movie');
//       }

//       const data = await response.json();
//       setMovie(data);
//       setBlurLevel(20); // Reset blur when fetching a new movie
//       setResult('');
//       setGuess('');
//     } catch (error) {
//       console.error('Error fetching random movie:', error);
//     }
//   };

//   const handleGuess = () => {
//     if (!movie) return;

//     if (guess.toLowerCase() === movie.title.toLowerCase()) {
//       setResult('Correct!');
//       setBlurLevel(0); // Reveal the image fully
//     } else {
//       setResult('Try again!');
//       setBlurLevel((prev) => Math.max(prev - 5, 0)); // Reduce blur with each incorrect guess
//     }
//   };

//   return (
//     <div className="blur-guess-game">
//       <h1>Guess the Movie</h1>
//       <button onClick={fetchRandomMovie}>Get Random Movie</button>
//       {movie ? (
//         <div className="game-container">
//           <img
//             src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
//             alt="Movie Poster"
//             style={{
//               filter: `blur(${blurLevel}px)`,
//               transition: 'filter 0.3s ease',
//             }}
//           />
//           <input
//             type="text"
//             placeholder="Your guess..."
//             value={guess}
//             onChange={(e) => setGuess(e.target.value)}
//           />
//           <button onClick={handleGuess}>Submit Guess</button>
//           {result && <p>{result}</p>}
//         </div>
//       ) : (
//         <p>Click "Get Random Movie" to start the game!</p>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function BlurGuessPage() {
  const { token } = useAuth(); // Use token from Auth context
  const [randomMovie, setRandomMovie] = useState(null);
  const [blurLevel, setBlurLevel] = useState(20);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [hint, setHint] = useState('');
  const [gameState, setGameState] = useState('playing'); // 'playing', 'hint', 'correct'

  const fetchRandomMovie = async () => {
    try {
      const response = await fetch(`${baseWorkerUrl}/random-movie`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch random movie.');

      const data = await response.json();
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
    if (!randomMovie || gameState !== 'playing') return;

    if (guess.trim().toLowerCase() === randomMovie.title.toLowerCase()) {
      setGameState('correct');
    } else {
      const newGuesses = guesses + 1;
      setGuesses(newGuesses);

      if (newGuesses === 2) {
        provideHint();
        setGameState('hint');
      } else {
        setBlurLevel((prev) => Math.max(0, prev - 10)); // Reduce blur
      }
    }
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
          <p>Guesses: {guesses}/2</p>
          {gameState === 'hint' && <p>Hint: {hint}</p>}
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            disabled={gameState !== 'playing'}
          />
          <button onClick={handleGuess} disabled={gameState !== 'playing'}>
            Submit Guess
          </button>
          {gameState === 'correct' && <p>🎉 Correct! The movie was {randomMovie.title}.</p>}
        </>
      )}
    </div>
  );
}
