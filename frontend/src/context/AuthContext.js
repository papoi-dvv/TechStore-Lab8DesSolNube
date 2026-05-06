import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('techstore_user');
    const storedToken = localStorage.getItem('techstore_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  function saveSession(session) {
    setUser(session.user);
    setToken(session.token);
    localStorage.setItem('techstore_user', JSON.stringify(session.user));
    localStorage.setItem('techstore_token', session.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techstore_user');
    localStorage.removeItem('techstore_token');
  }

  async function login(email, password) {
    return apiLogin(email, password);
  }

  const value = {
    user,
    token,
    login,
    logout,
    saveSession,
    isAuthenticated: Boolean(user && token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
