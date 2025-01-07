import React, { useState } from 'react';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

async function handleAuth(endpoint, body) {
  try {
    const response = await fetch(`${baseWorkerUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    console.error(`Error during ${endpoint}:`, error);
    alert('Authentication failed. Please try again.');
    return null;
  }
}

export default function AuthForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      return alert('Both fields are required.');
    }
    const data = await handleAuth('register', { username, password });
    if (data?.message) {
      alert('User registered successfully. You can now log in.');
    } else {
      alert(data?.error || 'Registration failed.');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      return alert('Both fields are required.');
    }
    const data = await handleAuth('login', { username, password });
    if (data?.token) {
      onLoginSuccess(data.token);
    } else {
      alert(data?.error || 'Login failed.');
    }
  };

  return (
    <section className="auth-section">
      <h2>Login / Register</h2>
      <div>
        <input 
          type="text" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
    </section>
  );
}
