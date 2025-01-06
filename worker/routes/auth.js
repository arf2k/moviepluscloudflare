import jwt from '@tsndr/cloudflare-worker-jwt';

// This function handles /register, /login, and /verify requests
export async function handleAuth(request, env, path) {
  const { method } = request;

  // /register
  if (path === '/register' && method === 'POST') {
    try {
      const { username, password } = await request.json();
      console.log("Registering user:", username);

      const userExists = await env.USERS_KV.get(username);
      if (userExists) {
        console.warn("User already exists:", username);
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Store password (note: consider hashing in a real app)
      await env.USERS_KV.put(username, password);
      console.log("User registered successfully:", username);

      return new Response(
        JSON.stringify({ message: 'User registered successfully' }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      console.error("Error during registration:", err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // /login
  if (path === '/login' && method === 'POST') {
    try {
      const { username, password } = await request.json();
      console.log("Attempting login for user:", username);

      const storedPassword = await env.USERS_KV.get(username);
      if (!storedPassword || storedPassword !== password) {
        console.warn("Invalid login credentials for user:", username);
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const token = await jwt.sign({ username }, env.JWT_SECRET, {
        expiresIn: '1h',
      });

      console.log("Login successful for user:", username);
      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error("Error during login:", err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // /verify
  if (path === '/verify' && method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      console.log("Verifying token:", token);

      if (!token || token.split('.').length !== 3) {
        console.warn("Invalid token format:", token);
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) {
        console.warn("Invalid token:", token);
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log("Token is valid:", token);
      return new Response(
        JSON.stringify({ message: 'Token is valid' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      console.error("Error verifying token:", err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // If none matched, return 404
  return new Response('Not Found in auth routes', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}
