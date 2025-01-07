// src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../components/LoginForm';

export default function LoginPage({ onLoginSuccess }) {
  return (
    <div>
      <h2>Login</h2>
      <LoginForm onLoginSuccess={onLoginSuccess} />
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
