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

      // Log the incoming Origin and Path for debugging
      console.log('Origin:', origin);
      console.log('Path:', path);

      if (allowedOrigins.includes(origin)) {
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

        const response = await handleRequest(request, env, origin);
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      } else {
        console.log('Forbidden Origin:', origin);
        return new Response('Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
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


async function handleRequest(request, env, origin) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/') {
      return new Response('Welcome to MoviePlus Cloudflare Worker!', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    if (path === '/kv-test' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token || token.split('.').length !== 3) {
        return new Response('Unauthorized', {
          status: 401,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': origin,
          },
        });
      }

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        return new Response('Invalid token', {
          status: 401,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': origin,
          },
        });
      }

      try {
        // Test writing to KV
        await env.USERS_KV.put('test_key', 'test_value');

        // Test reading from KV
        const value = await env.USERS_KV.get('test_key');

        return new Response(`KV Test Success! Value: ${value}`, {
          status: 200,
          headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': origin },
        });
      } catch (err) {
        console.error('KV Test Error:', err);
        return new Response('KV Test Failed', { status: 500 });
      }
    }

    // Other logic follows here (register, login, verify, etc.)

    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': origin,
      },
    });
  } catch (err) {
    console.error('Handle request error:', err);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': origin,
      },
    });
  }
}
