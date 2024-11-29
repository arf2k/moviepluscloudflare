const baseWorkerUrl = 'https://moviepluscloudflare-worker.foreman-alexander.workers.dev';
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');

let favorites = [];

// Fetch movies via the Cloudflare Worker
const fetchMovies = async (query) => {
  try {
    console.log(`Fetching movies for query: ${query}`);
    const response = await fetch(`${baseWorkerUrl}?s=${query}`);
    const data = await response.json();

    console.log('API Response:', data);

    if (data.Search) {
      displayMovies(data.Search);
    } else {
      movieResults.innerHTML = '<p>No movies found.</p>';
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    movieResults.innerHTML = '<p>Error fetching movies. Please try again later.</p>';
  }
};

// Display movie results
const displayMovies = (movies) => {
  console.log('Movies to display:', movies);
  movieResults.innerHTML = movies
    .map(
      (movie) => `
        <div class="movie">
          <span>${movie.Title} (${movie.Year})</span>
          <button onclick="addToFavorites('${movie.Title}')">Add to Favorites</button>
        </div>
      `
    )
    .join('');
};

// Add to favorites
const addToFavorites = (movieTitle) => {
  console.log(`Adding to favorites: ${movieTitle}`);
  if (!favorites.includes(movieTitle)) {
    favorites.push(movieTitle);
    updateFavoritesList();
  }
};

// Remove from favorites
const removeFromFavorites = (movieTitle) => {
  console.log(`Removing from favorites: ${movieTitle}`);
  favorites = favorites.filter((title) => title !== movieTitle);
  updateFavoritesList();
};

// Update favorites list
const updateFavoritesList = () => {
  console.log('Favorites updated:', favorites);
  favoritesList.innerHTML = favorites
    .map(
      (title) => `
        <div class="movie">
          <span>${title}</span>
          <button onclick="removeFromFavorites('${title}')">Remove</button>
        </div>
      `
    )
    .join('');
};

// Event listener for search input
movieSearchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  console.log(`Search input: ${query}`);
  if (query.length > 2) {
    fetchMovies(query);
  } else {
    movieResults.innerHTML = '';
  }
});

console.log('Script end');
