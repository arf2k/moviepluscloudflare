import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleRecommendations(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Query parameter "id" is required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Ensure CORS is handled
        },
      }
    );
  }

  // Verify JWT
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
          'Access-Control-Allow-Origin': '*', // Ensure CORS is handled
        },
      }
    );
  }

  try {
    // Fetch recommendations from TMDb
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}/recommendations`,
      {
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const tmdbData = await tmdbResponse.json();

    if (tmdbResponse.ok) {
      console.log(`Recommendations fetched successfully for ID: ${id}`);
      return new Response(JSON.stringify(tmdbData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Add CORS header
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      console.error(
        `Failed to fetch recommendations for ID: ${id}, Reason: ${tmdbData.status_message}`
      );
      return new Response(
        JSON.stringify({
          error: tmdbData.status_message || 'Unable to fetch recommendations',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Add CORS header
          },
        }
      );
    }
  } catch (error) {
    console.error('Error during TMDb API call:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Add CORS header
      },
    });
  }
}
