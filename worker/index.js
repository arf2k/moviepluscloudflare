export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
  
	  // Handle favicon requests
	  if (url.pathname === '/favicon.ico') {
		return new Response(null, { status: 204 }); // No Content
	  }
  
	  const apiKey = env.movieApiKey;
	  const query = url.searchParams.get('s');
  
	  if (!query) {
		return new Response('Missing search query', { status: 400 });
	  }
  
	  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
	  const apiResponse = await fetch(apiUrl);
	  const data = await apiResponse.json();
  
	  return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	  });
	},
  };
  