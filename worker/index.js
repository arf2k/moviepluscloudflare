export default {
	async fetch(request, env) {
		try {
			const apiKey = env.movieApiKey;

			// Parse the request URL and extract the search query
			const url = new URL(request.url);
			const query = url.searchParams.get('s');
			const origin = request.headers.get('Origin');

			// Allowed origins
			const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000','https://moviepluscloudflare.pages.dev'];

			// Debugging logs
			console.log('Incoming request:', { url: request.url, origin, query });

			// Validate search query
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

			// Check if the origin is allowed
			if (!allowedOrigins.includes(origin)) {
				return new Response('Forbidden', {
					status: 403,
					headers: { 'Content-Type': 'text/plain' },
				});
			}

			// Fetch from cache or API
			const cacheKey = new Request(request.url, request);
			const cache = caches.default;
			let response = await cache.match(cacheKey);

			if (!response) {
				// Fetch data from OMDb API
				const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
				const apiResponse = await fetch(apiUrl);

				if (!apiResponse.ok) {
					return new Response('Error fetching data from OMDb API', { status: apiResponse.status });
				}

				const data = await apiResponse.json();

				// Create a response with CORS headers
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
				await cache.put(cacheKey, response.clone());
			} else {
				// Add CORS headers to the cached response
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
		} catch (error) {
			console.error('Worker error:', error.message, error.stack);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
};
