export default {
	async fetch(request, env) {
		const apiKey = env.movieApiKey;

		// Parse the request URL and extract the search query
		const url = new URL(request.url);
		const query = url.searchParams.get('s');
		const origin = request.headers.get('Origin');

		// Allowed origins for CORS
		const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000'];

		if (!query) {
			return new Response('Missing search query', { status: 400 });
		}

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// Check if the request's origin is allowed
		if (!allowedOrigins.includes(origin)) {
			return new Response('Forbidden', { status: 403 });
		}

		// Caching logic
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
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Cache-Control': 'public, max-age=3600',
				},
			});

			// Cache the response
			event.waitUntil(cache.put(cacheKey, response.clone()));
		} else {
			console.log('Cache hit, returning cached response');
			// Re-add CORS headers to the cached response
			response = new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		return response;
	},
};
