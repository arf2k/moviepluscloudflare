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
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('authToken');
  };

  // Ensure state sync with localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const value = {
    token,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
