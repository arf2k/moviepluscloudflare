import jwt from '@tsndr/cloudflare-worker-jwt';

// Simple in-memory storage for testing (for production, use a DB)
const users = new Map();

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const allowedOrigins = ['https://foremanalex.com', 'https://dev.moviepluscloudflare.pages.dev', 'https://moviepluscloudflare.pages.dev'];
      const origin = request.headers.get('Origin') || '*';

      // Handle CORS preflight request
      if (request.method === 'OPTIONS') {
        return handleCorsPreflight(origin, allowedOrigins);
      }

      // Check if the origin is allowed
      if (!allowedOrigins.includes(origin)) {
        console.log(`Origin not allowed: ${origin}`);
        return new Response('Forbidden', {
          status: 403,
          headers: corsHeaders(origin),
        });
      }

      // Route-based logic
      if (path.startsWith('/auth/register') && request.method === 'POST') {
        console.log('Incoming request to /auth/register');
        return await registerUser(request, origin);
      } 
      else if (path.startsWith('/auth/login') && request.method === 'POST') {
        console.log('Incoming request to /auth/login');
        return await loginUser(request, env, origin);
      } 
      else if (path.startsWith('/auth/verify') && request.method === 'GET') {
        console.log('Incoming request to /auth/verify');
        return await verifyToken(request, env, origin);
      } 
      else {
        console.log(`No matching route for path: ${path}`);
        return new Response('Not Found', { 
          status: 404, 
          headers: corsHeaders(origin),
        });
      }
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
        status: 500, 
        headers: corsHeaders('*')
      });
    }
  },
};

async function handleCorsPreflight(origin, allowedOrigins) {
  if (!allowedOrigins.includes(origin)) {
    console.log('CORS Preflight failed for origin:', origin);
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

async function registerUser(request, origin) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: corsHeaders(origin) 
    });
  }

  if (users.has(username)) {
    return new Response(JSON.stringify({ error: 'User already exists' }), { 
      status: 400, 
      headers: corsHeaders(origin) 
    });
  }

  users.set(username, password);
  return new Response(JSON.stringify({ message: 'User registered successfully' }), { 
    status: 201, 
    headers: corsHeaders(origin) 
  });
}

async function loginUser(request, env, origin) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { 
      status: 400, 
      headers: corsHeaders(origin) 
    });
  }

  const storedPassword = users.get(username);
  if (!storedPassword || storedPassword !== password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: corsHeaders(origin) 
    });
  }

  const token = await jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '1h' });
  return new Response(JSON.stringify({ token }), { 
    status: 200, 
    headers: corsHeaders(origin) 
  });
}

async function verifyToken(request, env, origin) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  const isValid = await jwt.verify(token, env.JWT_SECRET);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, 
      headers: corsHeaders(origin) 
    });
  }

  return new Response(JSON.stringify({ message: 'Token is valid' }), { 
    status: 200, 
    headers: corsHeaders(origin) 
  });
}

function corsHeaders(origin) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
