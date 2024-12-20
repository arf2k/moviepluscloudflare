import jwt from '@tsndr/cloudflare-worker-jwt';

// Simple in-memory user storage for development
const users = new Map();

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      const allowedOrigins = ['https://foremanalex.com', 'https://dev.moviepluscloudflare.pages.dev', 'https://moviepluscloudflare.pages.dev'];
      const origin = request.headers.get('Origin');

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleCorsPreflight(origin, allowedOrigins);
      }

      if (!allowedOrigins.includes(origin)) {
        return new Response('Forbidden', {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': origin },
        });
      }

      if (path.startsWith('/auth/register') && request.method === 'POST') {
        return await registerUser(request, origin);
      } 
      else if (path.startsWith('/auth/login') && request.method === 'POST') {
        return await loginUser(request, env, origin);
      } 
      else if (path.startsWith('/auth/verify') && request.method === 'GET') {
        return await verifyToken(request, env, origin);
      } 
      else if (path.startsWith('/movies') && request.method === 'GET') {
        return await fetchMovies(request, env, origin);
      } 
      else {
        return new Response('Not Found', { 
          status: 404, 
          headers: { 
            'Access-Control-Allow-Origin': origin, 
            'Content-Type': 'application/json' 
          } 
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        } 
      });
    }
  },
};

async function handleCorsPreflight(origin, allowedOrigins) {
  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function registerUser(request, origin) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  if (users.has(username)) {
    return new Response(JSON.stringify({ error: 'User already exists' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  users.set(username, password);
  return new Response(JSON.stringify({ message: 'User registered successfully' }), { 
    status: 201, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
  });
}

async function loginUser(request, env, origin) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  const storedPassword = users.get(username);
  if (!storedPassword || storedPassword !== password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  const token = await jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '1h' });

  return new Response(JSON.stringify({ token }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
  });
}

async function verifyToken(request, env, origin) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  const isValid = await jwt.verify(token, env.JWT_SECRET);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  return new Response(JSON.stringify({ message: 'Token is valid' }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
  });
}

async function fetchMovies(request, env, origin) {
  const apiKey = env.movieApiKey;
  const url = new URL(request.url);
  const query = url.searchParams.get('s');
  
  if (!query) {
    return new Response('Missing search query', { status: 400 });
  }

  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
  const apiResponse = await fetch(apiUrl);

  if (!apiResponse.ok) {
    return new Response('Error fetching data from OMDb API', { status: apiResponse.status });
  }

  const data = await apiResponse.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
