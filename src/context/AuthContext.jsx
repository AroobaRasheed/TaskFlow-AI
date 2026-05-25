// src/context/AuthContext.jsx
// Simple session-based auth — stores user in localStorage so
// sign-in, sign-out, and profile updates all persist correctly.

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('taskflow_user');
      if (!s) return null;
      const parsed = JSON.parse(s);
      // Check token expiry
      if (parsed?.token) {
        try {
          const payload = JSON.parse(atob(parsed.token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('taskflow_user');
            return null;
          }
        } catch { /* invalid token format, clear it */
          localStorage.removeItem('taskflow_user');
          return null;
        }
      }
      return parsed;
    } catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskflow_user');
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('taskflow_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
