import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Custom Hook to Access Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');

  const login = (newToken) => {
    console.log('Login called with token:', newToken);
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    console.log('Logout called');
    setToken('');
    localStorage.removeItem('authToken');
  };

  useEffect(() => {
    console.log('Token updated in context:', token);
  }, [token]);

  const value = {
    token,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
