import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const { login } = useAuth();
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

    if (!username || !password) {
      setLoading(false);
      return setError('Both fields are required.');
    }

    try {
      const response = await fetch(`${baseWorkerUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data?.error || 'Login failed.');
      }

      if (data?.token) {
        console.log('Login successful, calling login context method');
        login(data.token); // Update global auth state
        navigate('/'); // Redirect to home page
      } else {
        setError('Unexpected response. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'Login failed, please try again.');
    } finally {
      setLoading(false);
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
