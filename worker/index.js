export default {
	async fetch(request, env) {
	  // Retrieve the movieApiKey from Cloudflare secrets
	  const apiKey = env.movieApiKey;
  
	  // Parse the request URL and extract the query parameter
	  const url = new URL(request.url);
	  const query = url.searchParams.get('s'); // Get the search query parameter
  
	  if (!query) {
		return new Response('Missing search query', { status: 400 });
	  }
  
	  // Call the OMDb API securely with the movieApiKey
	  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
	  const apiResponse = await fetch(apiUrl);
	  const data = await apiResponse.json();
  
	  // Return the response from the OMDb API
	  return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	  });
	},
  };
  