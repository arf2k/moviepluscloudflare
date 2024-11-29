export default {
	async fetch(request, env) {
	  // Retrieve the movieApiKey from Cloudflare secrets
	  const apiKey = env.movieApiKey;
  
	  // Debug log
	  console.log(`Using API Key: ${apiKey}`);
  
	  // Parse the request URL
	  const url = new URL(request.url);
	  const query = url.searchParams.get('s');
  
	  if (!query) {
		return new Response('Missing search query', { status: 400 });
	  }
  
	  // Fetch movies from OMDb API
	  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
	  const apiResponse = await fetch(apiUrl);
  
	  if (!apiResponse.ok) {
		return new Response('Failed to fetch from OMDb', { status: apiResponse.status });
	  }
  
	  const data = await apiResponse.json();
  
	  return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	  });
	},
  };
  