import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

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

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
