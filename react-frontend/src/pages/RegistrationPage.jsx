// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseWorkerUrl = import.meta.env.VITE_API_URL;

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleRegister() {
    if (!username || !password) {
      return alert('Both fields are required.');
    }
    try {
      const response = await fetch(`${baseWorkerUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data?.message) {
        alert('User registered successfully. Please login.');
        navigate('/login');
      } else {
        alert(data?.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('Registration failed, please try again.');
    }
  }

  return (
    <div>
      <h2>Register</h2>
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
