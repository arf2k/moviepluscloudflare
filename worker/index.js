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

      if (allowedOrigins.includes(origin)) {
        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
          return new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          });
        }

        // Process the request
        const response = await handleRequest(request, env, origin);
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

async function handleRequest(request, env, origin) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/') {
      return new Response('Welcome to MoviePlus Cloudflare Worker!', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (path === '/register' && request.method === 'POST') {
      const { username, password } = await request.json();
      const userExists = await env.USERS_KV.get(username);

      if (userExists) {
        console.log(`User already exists: ${username}`);
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': origin,
            },
          }
        );
      }

      await env.USERS_KV.put(username, password);
      return new Response(
        JSON.stringify({ message: 'User registered successfully' }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    if (path === '/login' && request.method === 'POST') {
      const { username, password } = await request.json();
      const storedPassword = await env.USERS_KV.get(username);

      if (!storedPassword || storedPassword !== password) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': origin,
            },
          }
        );
      }

      const token = await jwt.sign({ username }, env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    if (path === '/verify' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': origin,
            },
          }
        );
      }

      return new Response(JSON.stringify({ message: 'Token is valid' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (err) {
    console.error('Handle request error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
