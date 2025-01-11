import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleSearch(request, env, path) {
  const { method } = request;

  // /search (GET)
  if (path === '/search' && method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      console.log("Searching with token:", token);

      // Verify JWT
      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        console.warn("Invalid token during search:", token);
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Extract query param "query"
      const url = new URL(request.url);
      const query = url.searchParams.get('query');
      if (!query) {
        console.warn("Missing search query parameter.");
        return new Response(
          JSON.stringify({ error: 'Query parameter "query" is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log("Performing search for query:", query);

      // Fetch from TMDb
      const apiResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${env.TMDB_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const apiData = await apiResponse.json();

      if (apiResponse.ok) {
        console.log("Search successful for query:", query);
        return new Response(
          JSON.stringify({ results: apiData.results }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.error("Search failed for query:", query, apiData.status_message);
        return new Response(
          JSON.stringify({ error: apiData.status_message || 'Unable to fetch results' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // If none matched, return 404
  return new Response('Not Found in search routes', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}
