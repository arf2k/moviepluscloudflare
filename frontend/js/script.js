const baseWorkerUrl = 'https://api.foremanalex.com'; // Your Worker URL
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');

let favorites = [];

// Fetch movies via the Cloudflare Worker
const fetchMovies = async (query) => {
  try {
    console.log(`[v1.0] Fetching movies for query: ${query}`);
    const response = await fetch(`${baseWorkerUrl}?s=${query}`, {
      headers: { 'Origin': window.location.origin },
    });
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
  const html = movies
    .map((movie) => `
        <div class="movie">
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title} Poster" />
          <span>${movie.Title} (${movie.Year})</span>
          <button onclick="addToFavorites('${movie.Title}')">Add to Favorites</button>
        </div>
    `)
    .join('');
  movieResults.innerHTML = html;
};

// Add to favorites
const addToFavorites = (movieTitle) => {
  if (!favorites.includes(movieTitle)) {
    favorites.push(movieTitle);
    updateFavoritesList();
  }
};

// Remove from favorites
const removeFromFavorites = (movieTitle) => {
  favorites = favorites.filter((title) => title !== movieTitle);
  updateFavoritesList();
};

// Update favorites list
const updateFavoritesList = () => {
  const html = favorites
    .map((title) => `
      <div class="movie">
        <span>${title}</span>
        <button onclick="removeFromFavorites('${title}')">Remove</button>
      </div>
    `)
    .join('');
  favoritesList.innerHTML = html;
};

// Event listener for search input
movieSearchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    fetchMovies(query);
  } else {
    movieResults.innerHTML = '';
  }
});
