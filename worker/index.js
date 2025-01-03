import jwt from '@tsndr/cloudflare-worker-jwt';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path.startsWith('/api/')) {
        const response = await handleAPIRequest(request, env);
        return response;
      } else {
        return new Response('Not Found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};

async function handleAPIRequest(request, env) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api', '');

    if (path === '/register' && request.method === 'POST') {
      const { username, password } = await request.json();

      const userExists = await env.USERS_KV.get(username);
      if (userExists) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      await env.USERS_KV.put(username, password);
      return new Response(
        JSON.stringify({ message: 'User registered successfully' }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const token = await jwt.sign({ username }, env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/verify' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token || token.split('.').length !== 3) {
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
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Token is valid' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === '/search' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
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
        return new Response(
          JSON.stringify({ error: 'Query parameter "s" is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const searchResults = [
        {
          Title: 'Rambo',
          Year: '1982',
          imdbID: 'tt0083944',
          Type: 'movie',
        },
        {
          Title: 'Terminator',
          Year: '1984',
          imdbID: 'tt0088247',
          Type: 'movie',
        },
      ];

      return new Response(
        JSON.stringify({ Search: searchResults }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
