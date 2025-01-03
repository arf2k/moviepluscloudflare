const baseWorkerUrl = 'https://api.foremanalex.com';

const registerButton = document.getElementById('register-btn');
const loginButton = document.getElementById('login-btn');
const movieSearchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const favoritesList = document.getElementById('favorites-list');
const loginSection = document.getElementById('auth-section');
const appSection = document.querySelector('.container');

let token = localStorage.getItem('authToken');
let favorites = [];

const toggleUI = (isLoggedIn) => {
  loginSection.style.display = isLoggedIn ? 'none' : 'block';
  appSection.style.display = isLoggedIn ? 'block' : 'none';
};

const handleAuth = async (endpoint, body) => {
  try {
    const response = await fetch(`${baseWorkerUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    console.error(`Error during ${endpoint}:`, error);
    alert('Authentication failed. Please try again.');
  }
};

registerButton.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    return alert('Both fields are required.');
  }

  const data = await handleAuth('register', { username, password });
  if (data.message) alert('User registered successfully.');
  else alert(data.error || 'Registration failed.');
});

loginButton.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    return alert('Both fields are required.');
  }

  const data = await handleAuth('login', { username, password });
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    token = data.token;
    toggleUI(true);
  } else {
    alert(data.error || 'Login failed.');
  }
});

const fetchMovies = async (query) => {
  if (!token) {
    return alert('You must log in to search for movies.');
  }

  try {
    const response = await fetch(`${baseWorkerUrl}/api/search?s=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.Search) displayMovies(data.Search);
    else movieResults.innerHTML = '<p>No results found.</p>';
  } catch (error) {
    console.error('Error fetching movies:', error);
    movieResults.innerHTML = '<p>Error occurred. Try again later.</p>';
  }
};

movieSearchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) fetchMovies(query);
  else movieResults.innerHTML = '';
});

const displayMovies = (movies) => {
  movieResults.innerHTML = movies
    .map(
      (movie) =>
        `<div class="movie"><img src="${movie.Poster}" alt="${movie.Title} Poster"><span>${movie.Title} (${movie.Year})</span></div>`
    )
    .join('');
};

document.addEventListener('DOMContentLoaded', () => {
  toggleUI(!!token);
});
