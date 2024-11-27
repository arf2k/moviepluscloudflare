const apiKey = '11f2c5e1'; // Replace with your OMDb API key
const baseApiUrl = 'https://www.omdbapi.com/';
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');

let favorites = [];

// Fetch movies from API
const fetchMovies = async (query) => {
  try {
    const response = await fetch(`${baseApiUrl}?apikey=${apiKey}&s=${query}`);
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

// Display movie results with posters
const displayMovies = (movies) => {
  movieResults.innerHTML = movies
    .map(
      (movie) => `
      <div class="movie">
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/100x150'}" alt="${movie.Title}" class="movie-poster">
        <div class="movie-info">
          <span>${movie.Title} (${movie.Year})</span>
          <button onclick="addToFavorites('${movie.Title}')">Add to Favorites</button>
        </div>
      </div>
    `
    )
    .join('');
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
