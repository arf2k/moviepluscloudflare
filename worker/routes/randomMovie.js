import jwt from '@tsndr/cloudflare-worker-jwt';

export async function getRandomMoviePoster(request, env) {
     const authHeader = request.headers.get('Authorization') || '';
     const token = authHeader.replace('Bearer ', '');
   
     console.log("Fetching random movie with token:", token);
   
     // Verify JWT
     const isValid = await jwt.verify(token, env.JWT_SECRET);
     if (!isValid) {
       console.warn("Invalid token during random movie fetch:", token);
       return new Response(
         JSON.stringify({ error: 'Invalid token' }),
         {
           status: 401,
           headers: { 'Content-Type': 'application/json' },
         }
       );
     }
   
     try {
       const randomPage = Math.floor(Math.random() * 500) + 1;
       const response = await fetch(
         `https://api.themoviedb.org/3/movie/popular?page=${randomPage}`,
         {
           headers: {
             Authorization: `Bearer ${env.TMDB_API_KEY}`,
             'Content-Type': 'application/json',
           },
         }
       );
       const data = await response.json();
   
       // Select a random movie and include additional details
       const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
   
       const movieDetails = {
         title: randomMovie.title,
         poster_path: randomMovie.poster_path,
         release_date: randomMovie.release_date,
         overview: randomMovie.overview,
         original_language: randomMovie.original_language,
       };
   
       return new Response(JSON.stringify(movieDetails), {
         status: 200,
         headers: {
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*',
         },
       });
     } catch (error) {
       console.error('Error during TMDb API call:', error);
       return new Response('Internal Server Error', {
         status: 500,
         headers: {
           'Content-Type': 'text/plain',
           'Access-Control-Allow-Origin': '*',
         },
       });
     }
   }
   