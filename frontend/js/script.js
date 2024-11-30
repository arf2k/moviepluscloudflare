const baseWorkerUrl = 'https://api.foremanalex.com'; // Use your working Worker URL
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');

let favorites = [];

// Fetch movies via the Cloudflare Worker
const fetchMovies = async (query) => {
  try {
    const response = await fetch(`${baseWorkerUrl}?s=${query}`);
    const data = await response.json();

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
    .map((movie) => {
      console.log('Processing movie:', movie.Title, 'Poster URL:', movie.Poster); // Debugging
      return `
        <div class="movie">
          <img src="${movie.Poster}" alt="${movie.Title} Poster" />
          <span>${movie.Title} (${movie.Year})</span>
          <button onclick="addToFavorites('${movie.Title}')">Add to Favorites</button>
        </div>
      `;
    })
    .join('');

  console.log('Generated HTML:', html); // Log the generated HTML
  movieResults.innerHTML = html; // Add to DOM
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
  if (query.length > 2) {
    fetchMovies(query);
  } else {
    movieResults.innerHTML = '';
  }
});
