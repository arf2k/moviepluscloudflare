const baseWorkerUrl = 'https://api.foremanalex.com';
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');
const logoutButton = document.getElementById('logout-button');
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');

let favorites = [];

// Retrieve JWT from localStorage
let token = localStorage.getItem('authToken');

// Check if token exists and update UI accordingly
if (token) {
  verifyToken(token);
} else {
  loginSection.style.display = 'block';
  appSection.style.display = 'none';
}

// Logout Functionality
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  token = null;

  loginSection.style.display = 'block';
  appSection.style.display = 'none';
  alert('You have logged out.');
});

// Fetch movies via the Cloudflare Worker
const fetchMovies = async (query) => {
  if (!token) {
    alert('You need to log in to search for movies.');
    return;
  }

  try {
    const response = await fetch(`${baseWorkerUrl}/api/search?s=${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.Search) {
      displayMovies(data.Search);
    } else {
      movieResults.innerHTML = '<p>No movies found.</p>';
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    movieResults.innerHTML = '<p>Error fetching movies. Please try again later.</p>';
  }
};

// Verify JWT
const verifyToken = async (token) => {
  try {
    const response = await fetch(`${baseWorkerUrl}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      appSection.style.display = 'block';
      loginSection.style.display = 'none';
      console.log('Token verified successfully');
    } else {
      localStorage.removeItem('authToken');
      appSection.style.display = 'none';
      loginSection.style.display = 'block';
      console.error('Token verification failed:', data.error);
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
  }
};

// Display movie results
const displayMovies = (movies) => {
  movieResults.innerHTML = movies
    .map((movie) => `
      <div class="movie">
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title} Poster" />
        <span>${movie.Title} (${movie.Year})</span>
        <button onclick="addToFavorites('${movie.Title}')">Add to Favorites</button>
      </div>
    `)
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
    .map((title) => `
      <div class="movie">
        <span>${title}</span>
        <button onclick="removeFromFavorites('${title}')">Remove</button>
      </div>
    `)
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded. Ready to execute scripts.');
});
