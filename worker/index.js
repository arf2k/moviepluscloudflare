import { handleAuthRequest } from './workerAuth';
import jwt from '@tsndr/cloudflare-worker-jwt';

export default {
	async fetch(request, env) {
		try {
			const { JWT_SECRET, movieApiKey } = env;

			// Parse the request URL and extract the path, query, and origin
			const url = new URL(request.url);
			const path = url.pathname;
			const query = url.searchParams.get('s');
			const origin = request.headers.get('Origin');

			// Allowed origins
			const allowedOrigins = ['https://foremanalex.com', 'http://localhost:8000', 'https://moviepluscloudflare.pages.dev'];

			// Handle CORS preflight requests
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

			// Handle Authentication Requests (login/register)
			if (path.startsWith('/auth')) {
				return await handleAuthRequest(request, env);
			}

			// **2️⃣ AUTHENTICATE JWT FOR PROTECTED ENDPOINTS**
			const authHeader = request.headers.get('Authorization');
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return new Response('Missing or invalid Authorization header', { status: 401 });
			}

			const token = authHeader.split(' ')[1];
			const isValid = await jwt.verify(token, JWT_SECRET);

			if (!isValid) {
				return new Response('Invalid or expired token', { status: 403 });
			}

			// **3️⃣ PROTECTED API ENDPOINT**
			if (path === '/api/search' && query) {
				const cacheKey = new Request(request.url, request);
				const cache = caches.default;
				let response = await cache.match(cacheKey);

				if (!response) {
					console.log('Cache miss, fetching from OMDb API');

					// Fetch data from OMDb API
					const apiUrl = `https://www.omdbapi.com/?apikey=${movieApiKey}&s=${query}`;
					const apiResponse = await fetch(apiUrl);

					if (!apiResponse.ok) {
						return new Response('Error fetching data from OMDb API', { status: apiResponse.status });
					}

					const data = await apiResponse.json();

					response = new Response(JSON.stringify(data), {
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': origin,
							'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
							'Access-Control-Allow-Headers': 'Content-Type, Authorization',
							'Cache-Control': 'public, max-age=3600',
						},
					});

					await cache.put(cacheKey, response.clone());
				} else {
					response = new Response(response.body, {
						...response,
						headers: {
							...response.headers,
							'Access-Control-Allow-Origin': origin,
							'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
							'Access-Control-Allow-Headers': 'Content-Type, Authorization',
						},
					});
				}

				return response;
			}

			return new Response('Not Found', { status: 404 });
		} catch (error) {
			console.error('Worker error:', error.message, error.stack);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
};
