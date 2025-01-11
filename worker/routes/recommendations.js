import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleRecommendations(request, env) {
  const url = new URL(request.url);
  const movieId = url.searchParams.get('id');

  if (!movieId) {
    return new Response(
      JSON.stringify({ error: 'Query parameter "id" is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const isValid = await jwt.verify(token, env.JWT_SECRET);

  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations`,
      {
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tmdbData = await tmdbResponse.json();

    if (tmdbResponse.ok) {
      return new Response(JSON.stringify(tmdbData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({
          error: tmdbData.status_message || 'Unable to fetch recommendations',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
