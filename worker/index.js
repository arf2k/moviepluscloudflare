import { handleAuthRequest } from './workerAuth';
import jwt from '@tsndr/cloudflare-worker-jwt';

export default {
  async fetch(request, env) {
    try {
      const { JWT_SECRET, movieApiKey } = env;
      const url = new URL(request.url);
      const path = url.pathname;
      const origin = request.headers.get('Origin');

      const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000', 'https://moviepluscloudflare.pages.dev', 'https://dev.moviepluscloudflare.pages.dev'];

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      if (!allowedOrigins.includes(origin)) {
        return new Response('Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Handle Authentication Requests
      if (path.startsWith('/auth')) {
        return await handleAuthRequest(request, env);
      }

      if (path === '/api/search') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response('Missing or invalid Authorization header', { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const isValid = await jwt.verify(token, JWT_SECRET);
        if (!isValid) {
          return new Response('Invalid or expired token', { status: 403 });
        }

        const query = url.searchParams.get('s');
        if (!query) {
          return new Response('Missing search query', { status: 400 });
        }

        const apiUrl = `https://www.omdbapi.com/?apikey=${movieApiKey}&s=${query}`;
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error.message, error.stack);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
