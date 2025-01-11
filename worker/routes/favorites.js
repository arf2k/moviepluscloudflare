import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleFavorites(request, env) {
  const { method } = request;

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

  // Extract username from the token
  const decoded = await jwt.decode(token);
  const username = decoded.payload.username;

  if (method === 'POST') {
    try {
      const { movieId, title, posterPath } = await request.json();

      if (!movieId || !title || !posterPath) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];
      if (favorites.some((fav) => fav.movieId === movieId)) {
        return new Response(
          JSON.stringify({ message: 'Movie already in favorites' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      favorites.push({ movieId, title, posterPath });
      await env.FAVORITES_KV.put(username, JSON.stringify(favorites));

console.log('Payload received in POST request:', { movieId, title, posterPath });
console.log('Favorites before update:', favorites);

return new Response(
  JSON.stringify({ message: 'Movie added to favorites' }),
  {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  }
);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  if (method === 'GET') {
    try {
      const favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];
      return new Response(
        JSON.stringify(favorites),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error retrieving favorites:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  if (method === 'DELETE') {
    try {
      const { movieId } = await request.json();

      if (!movieId) {
        return new Response(
          JSON.stringify({ error: 'Missing movieId' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      let favorites = (await env.FAVORITES_KV.get(username, { type: 'json' })) || [];
      favorites = favorites.filter((fav) => fav.movieId !== movieId);
      await env.FAVORITES_KV.put(username, JSON.stringify(favorites));

      return new Response(
        JSON.stringify({ message: 'Movie removed from favorites' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Not Found in favorites routes', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}
