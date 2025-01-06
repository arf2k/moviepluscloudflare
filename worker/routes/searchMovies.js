import jwt from '@tsndr/cloudflare-worker-jwt';

export async function handleSearch(request, env, path) {
  const { method } = request;

  // /search (GET)
  if (path === '/search' && method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      console.log("Searching with token:", token);

      // Verify token
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

      // Extract query param "s"
      const url = new URL(request.url);
      const query = url.searchParams.get('s');
      if (!query) {
        console.warn("Missing search query parameter.");
        return new Response(
          JSON.stringify({ error: 'Query parameter "s" is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log("Performing search for query:", query);

      // Fetch from OMDB
      const apiResponse = await fetch(
        `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&s=${encodeURIComponent(query)}`
      );
      const apiData = await apiResponse.json();

      if (apiResponse.ok && apiData.Response === "True") {
        console.log("Search successful for query:", query);
        return new Response(
          JSON.stringify({ Search: apiData.Search }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.error("Search failed for query:", query, apiData.Error);
        return new Response(
          JSON.stringify({ error: apiData.Error || 'Unable to fetch results' }),
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
