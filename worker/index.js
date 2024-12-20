import jwt from '@tsndr/cloudflare-worker-jwt';

const users = new Map(); // Simple in-memory user storage (this resets on worker restarts)

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Define allowed origins for CORS
      const allowedOrigins = ['https://foremanalex.com', 'https://dev.moviepluscloudflare.pages.dev', 'https://moviepluscloudflare.pages.dev'];

      const origin = request.headers.get('Origin');

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

      // Handle /auth routes
      if (path === '/auth/register' && request.method === 'POST') {
        return await registerUser(request);
      } 
      else if (path === '/auth/login' && request.method === 'POST') {
        return await loginUser(request, env);
      } 
      else if (path === '/auth/verify' && request.method === 'GET') {
        return await verifyToken(request, env);
      } 
      else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

// 1️⃣ Register User
async function registerUser(request) {
  const { username, password } = await request.json();
  
  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  if (users.has(username)) {
    return new Response(JSON.stringify({ error: 'User already exists' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  users.set(username, password);
  return new Response(JSON.stringify({ message: 'User registered successfully' }), { 
    status: 201, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
}

// 2️⃣ Login User
async function loginUser(request, env) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const storedPassword = users.get(username);
  if (!storedPassword || storedPassword !== password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const token = await jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '1h' });

  return new Response(JSON.stringify({ token }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
}

// 3️⃣ Verify Token
async function verifyToken(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  const isValid = await jwt.verify(token, env.JWT_SECRET);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  return new Response(JSON.stringify({ message: 'Token is valid' }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
}
