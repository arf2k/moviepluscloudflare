import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault(); // Prevent form reload if this is inside a <form>
    setError('');
    setLoading(true); // Indicate loading state
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

      if (!response.ok) {
        throw new Error(data?.error || 'Login failed.');
      }

      if (data.token) {
        onLoginSuccess(data.token); // Update app state
        navigate('/'); // Redirect to home
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'Login failed, please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <div>
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
    </div>
  );
}
