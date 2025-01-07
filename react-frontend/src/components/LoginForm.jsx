// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleLogin() {
    if (!username || !password) {
      return alert('Both fields are required.');
    }
    try {
      const response = await fetch(`${baseWorkerUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data?.token) {
        onLoginSuccess(data.token);
        navigate('/'); // redirect to home
      } else {
        alert(data?.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Login failed, please try again.');
    }
  }

  return (
    <div>
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
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
