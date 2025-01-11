import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleMovieDetail(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Query parameter "id" is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify JWT
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
    // Fetch movie details from TMDb
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const tmdbData = await tmdbResponse.json();

    if (tmdbResponse.ok) {
      console.log(`Movie details fetched successfully for ID: ${id}`);
      return new Response(JSON.stringify(tmdbData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error(
        `Failed to fetch movie details for ID: ${id}, Reason: ${tmdbData.status_message}`
      );
      return new Response(
        JSON.stringify({
          error: tmdbData.status_message || 'Unable to fetch movie details',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error during TMDb API call:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
