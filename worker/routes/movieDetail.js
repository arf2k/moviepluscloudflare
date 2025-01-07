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

  // Verify JWT (similar to how you do in searchMovies.js)
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const isValid = await jwt.verify(token, env.JWT_SECRET);
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Fetch movie details from OMDB by ID
  const omdbResponse = await fetch(
    `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&i=${encodeURIComponent(id)}`
  );
  const omdbData = await omdbResponse.json();

  if (omdbResponse.ok && omdbData.Response === 'True') {
    // Return the full omdbData (Title, Plot, etc.)
    return new Response(JSON.stringify(omdbData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(
      JSON.stringify({
        error: omdbData.Error || 'Unable to fetch movie details',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
