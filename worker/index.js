import { handleAuth } from './routes/auth.js';
import { handleSearch } from './routes/searchMovies.js';
import { handleMovieDetail } from './routes/movieDetail.js';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      console.log("Incoming request:", {
        method: request.method,
        url: request.url,
        origin: request.headers.get('Origin'),
      });

      // Manage allowed origins for CORS
      const allowedOrigins = [
        'https://foremanalex.com',
        'https://dev.moviepluscloudflare.pages.dev',
        'https://moviepluscloudflare.pages.dev',
      ];
      const origin = request.headers.get('Origin');

      // Handle OPTIONS (preflight) requests
      if (request.method === 'OPTIONS') {
        return handlePreflight(request, origin, allowedOrigins);
      }

      // Proceed with routing
      let response;

      // AUTH routes (/register, /login, /verify)
      if (path === '/register' || path === '/login' || path === '/verify') {
        response = await handleAuth(request, env, path);
      }
      // SEARCH route
      else if (path === '/search') {
        response = await handleSearch(request, env, path);
      }
      // MOVIE DETAIL route
      else if (path === '/movie') {
        response = await handleMovieDetail(request, env);
      }
      // Add more routes here, e.g. favorites
      else {
        console.warn("API path not found:", path);
        response = new Response('Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Set CORS headers on the final response
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else {
        // or set '*', depending on your preference
        response.headers.set('Access-Control-Allow-Origin', '*');
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    } catch (err) {
      console.error('Fetch error:', err);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

// Handle preflight
function handlePreflight(request, origin, allowedOrigins) {
  console.log("Handling preflight request for origin:", origin);
  if (origin && allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } else {
    console.warn("Preflight request from disallowed origin:", origin);
    return new Response('Forbidden', { status: 403 });
  }
}
