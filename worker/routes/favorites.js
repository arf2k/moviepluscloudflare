import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleFavorites(request, env, path) {
  const { method } = request;

  // Extract and validate the Authorization token
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token || token.split('.').length !== 3) {
    console.error('Invalid token format:', token);
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
    console.error('Invalid token during favorites operation:', token);
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Decode the token to get the username
  const decoded = jwt.decode(token);
  const username = decoded.payload?.username;

  if (!username) {
    console.error('Username missing from token payload:', decoded);
    return new Response(
      JSON.stringify({ error: 'Invalid token payload' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    if (method === 'POST') {
      // Add a favorite
      const { movieId, title, posterPath } = await request.json();
      const favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];

      if (favorites.some((fav) => fav.movieId === movieId)) {
        return new Response(
          JSON.stringify({ message: 'Movie already in favorites' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      favorites.push({ movieId, title, posterPath });
      await env.FAVORITES_KV.put(username, JSON.stringify(favorites));

      return new Response(
        JSON.stringify({ message: 'Movie added to favorites' }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else if (method === 'GET') {
      // Retrieve all favorites
      const favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];
      return new Response(
        JSON.stringify(favorites),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else if (method === 'DELETE') {
      // Remove a favorite
      const { movieId } = await request.json();
      let favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];
      favorites = favorites.filter((fav) => fav.movieId !== movieId);
      await env.FAVORITES_KV.put(username, JSON.stringify(favorites));

      return new Response(
        JSON.stringify({ message: 'Movie removed from favorites' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error handling favorites:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
