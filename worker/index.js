export default {
	async fetch(request, env) {
	  const apiKey = env.movieApiKey; // Securely retrieved from Cloudflare secrets
  
	  // Parse the request URL and extract the search query
	  const url = new URL(request.url);
	  const query = url.searchParams.get('s');
  
	  if (!query) {
		return new Response('Missing search query', { status: 400 });
	  }
  
	  // Validate the Origin header to ensure only requests from your frontend are allowed
	  const allowedOrigin = 'https://foremanalex.com'; 
	  const origin = request.headers.get('Origin');
  
	 ///if (origin !== allowedOrigin) {
		///return new Response('Forbidden', {
		  ///status: 403,
		  ///headers: { 'Content-Type': 'text/plain' },
		///});
	  ///}
	  const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000'];
	  if (!allowedOrigins.includes(origin)) {
		  return new Response('Forbidden', { status: 403 });
	  }
	  

	  // Fetch data from the OMDb API
	  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
	  const apiResponse = await fetch(apiUrl);
	  const data = await apiResponse.json();
  
	  // Return the response with secure CORS headers
	  return new Response(JSON.stringify(data), {
		headers: {
		  'Content-Type': 'application/json',
		  'Access-Control-Allow-Origin': allowedOrigin,
		  'Access-Control-Allow-Methods': 'GET, OPTIONS',
		  'Access-Control-Allow-Headers': 'Content-Type',
		},
	  });
	},
  };
  