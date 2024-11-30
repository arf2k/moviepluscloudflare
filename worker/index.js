export default {
	async fetch(request, env) {
		const apiKey = env.movieApiKey;

		// Parse the request URL and extract the search query
		const url = new URL(request.url);
		const query = url.searchParams.get('s');

		if (!query) {
			return new Response('Missing search query', { status: 400 });
		}

		// Validate the Origin header to ensure only requests from allowed origins are permitted
		const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000'];
		const origin = request.headers.get('Origin');

		if (!allowedOrigins.includes(origin)) {
			return new Response('Forbidden', {
				status: 403,
				headers: { 'Content-Type': 'text/plain' },
			});
		}

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// Check the cache for a stored response
		const cacheKey = new Request(request.url, request);
		const cache = caches.default;
		let response = await cache.match(cacheKey);

		if (!response) {
			console.log('Cache miss, fetching from OMDb API');

			// Fetch data from the OMDb API
			const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
			const apiResponse = await fetch(apiUrl);

			if (!apiResponse.ok) {
				return new Response('Error fetching data from OMDb API', { status: apiResponse.status });
			}

			const data = await apiResponse.json();

			// Create a new Response and set the necessary headers
			response = new Response(JSON.stringify(data), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': origin, // Dynamically allow the request origin
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
				},
			});

			// Store the response in the cache
			event.waitUntil(cache.put(cacheKey, response.clone()));
		} else {
			console.log('Cache hit, returning cached response');
			// Add CORS headers to the cached response
			response = new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'Access-Control-Allow-Origin': origin,
				},
			});
		}

		return response;
	},
};
