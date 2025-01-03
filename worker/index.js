import jwt from '@tsndr/cloudflare-worker-jwt';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      const allowedOrigins = [
        'https://foremanalex.com',
        'https://dev.moviepluscloudflare.pages.dev',
        'https://moviepluscloudflare.pages.dev',
      ];

      const origin = request.headers.get('Origin');

      console.log(`Incoming request: ${request.method} ${path} from ${origin}`);

      // Handle preflight (OPTIONS) requests
      if (request.method === 'OPTIONS') {
        console.log('Handling preflight request');
        return handlePreflight(request, origin, allowedOrigins);
      }

      // Proceed with API logic
      if (path.startsWith('/api/')) {
        const response = await handleAPIRequest(request, env, origin);
        if (origin && allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        } else {
          response.headers.set('Access-Control-Allow-Origin', '*');
        }
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      } else {
        console.log('Request does not match /api/* route');
        return new Response('Not Found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': origin || '*',
          },
        });
      }
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

function handlePreflight(request, origin, allowedOrigins) {
  console.log(`Preflight request from origin: ${origin}`);
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
    return new Response('Forbidden', { status: 403 });
  }
}

async function handleAPIRequest(request, env, origin) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api', '');

    console.log(`Handling API request for path: ${path}`);

    if (path === '/register' && request.method === 'POST') {
      console.log('Processing registration request');
      const { username, password } = await request.json();

      const userExists = await env.USERS_KV.get(username);
      if (userExists) {
        console.log('User already exists');
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      await env.USERS_KV.put(username, password);
      console.log('User registered successfully');
      return new Response(
        JSON.stringify({ message: 'User registered successfully' }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === '/login' && request.method === 'POST') {
      console.log('Processing login request');
      const { username, password } = await request.json();

      const storedPassword = await env.USERS_KV.get(username);
      if (!storedPassword || storedPassword !== password) {
        console.log('Invalid credentials');
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const token = await jwt.sign({ username }, env.JWT_SECRET, {
        expiresIn: '1h',
      });

      console.log('Login successful, token generated');
      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/verify' && request.method === 'GET') {
      console.log('Processing token verification');
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token || token.split('.').length !== 3) {
        console.log('Invalid token format');
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        console.log('Invalid token');
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Token is valid');
      return new Response(
        JSON.stringify({ message: 'Token is valid' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === '/search' && request.method === 'GET') {
      console.log('Processing movie search request');
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        console.log('Invalid token');
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const query = url.searchParams.get('s');
      if (!query) {
        console.log('Query parameter missing');
        return new Response(
          JSON.stringify({ error: 'Query parameter "s" is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const apiResponse = await fetch(
        `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&s=${encodeURIComponent(query)}`
      );
      const apiData = await apiResponse.json();

      if (apiResponse.ok && apiData.Response === "True") {
        console.log('Search results retrieved successfully');
        return new Response(
          JSON.stringify({ Search: apiData.Search }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.log('Error retrieving search results');
        return new Response(
          JSON.stringify({ error: apiData.Error || 'Unable to fetch results' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    console.log('API path not found');
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error('API request error:', err);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
