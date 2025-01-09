import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Attempting login with:', { username, password });

    try {
      const response = await fetch(`${baseWorkerUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data?.error || 'Login failed.');
      }

      if (data?.token) {
        console.log('Login successful, calling onLoginSuccess');
        onLoginSuccess(data.token);
        console.log('Navigating to /');
        navigate('/');
      } else {
        console.warn('Login response missing token:', data);
        setError('Unexpected response. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'Login failed, please try again.');
    } finally {
      setLoading(false);
      console.log('Login attempt completed, loading reset.');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Username:</label>
        <input 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
