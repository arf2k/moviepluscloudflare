import jwt from '@tsndr/cloudflare-worker-jwt';

// Simple in-memory storage for testing (for production, use a DB)
const users = new Map();

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      const allowedOrigins = ['https://foremanalex.com', 'https://dev.moviepluscloudflare.pages.dev', 'https://moviepluscloudflare.pages.dev'];
      const origin = request.headers.get('Origin');

      // Handle CORS preflight request
      if (request.method === 'OPTIONS') {
        return handleCorsPreflight(origin, allowedOrigins);
      }

      if (!allowedOrigins.includes(origin)) {
        console.log(`Origin not allowed: ${origin}`);
        return new Response('Forbidden', {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': origin },
        });
      }

      if (path === '/auth/register' && request.method === 'POST') {
        console.log('Incoming request to /auth/register');
        return await registerUser(request, origin);
      } 
      else if (path === '/auth/login' && request.method === 'POST') {
        console.log('Incoming request to /auth/login');
        return await loginUser(request, env, origin);
      } 
      else if (path === '/auth/verify' && request.method === 'GET') {
        console.log('Incoming request to /auth/verify');
        return await verifyToken(request, env, origin);
      } 
      else {
        console.log(`No matching route for path: ${path}`);
        return new Response('Not Found', { 
          status: 404, 
          headers: { 
            'Access-Control-Allow-Origin': origin, 
            'Content-Type': 'application/json' 
          } 
        });
      }
    } catch (error) {
      console.error('Worker Error:', error);
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
  console.log('Handling CORS preflight for origin:', origin);
  if (!allowedOrigins.includes(origin)) {
    console.log('CORS Preflight failed for origin:', origin);
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
    console.log('Missing username or password');
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  if (users.has(username)) {
    console.log(`User already exists: ${username}`);
    return new Response(JSON.stringify({ error: 'User already exists' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  users.set(username, password);
  console.log(`User registered successfully: ${username}`);
  return new Response(JSON.stringify({ message: 'User registered successfully' }), { 
    status: 201, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
  });
}

async function loginUser(request, env, origin) {
  const { username, password } = await request.json();

  if (!username || !password) {
    console.log('Missing username or password');
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  const storedPassword = users.get(username);
  if (!storedPassword || storedPassword !== password) {
    console.log('Invalid credentials for user:', username);
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  const token = await jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '1h' });
  console.log(`User ${username} logged in successfully with JWT`);
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
    console.log('Invalid token');
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
    });
  }

  console.log('Token is valid');
  return new Response(JSON.stringify({ message: 'Token is valid' }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } 
  });
}
