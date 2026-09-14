import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vb_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.me(token)
      .then(setUser)
      .catch(() => { setToken(null); localStorage.removeItem('vb_token'); })
      .finally(() => setLoading(false));
  }, [token]);

  function login(nextToken, nextUser) {
    localStorage.setItem('vb_token', nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  function updateUser(patch) {
    setUser((prev) => ({ ...prev, ...patch }));
  }

  function logout() {
    localStorage.removeItem('vb_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}