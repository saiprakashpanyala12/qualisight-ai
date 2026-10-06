import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qualisight_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('qualisight_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('qualisight_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem('qualisight_user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('qualisight_token', token);
    localStorage.setItem('qualisight_user', JSON.stringify(user));
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('qualisight_token', token);
    localStorage.setItem('qualisight_user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('qualisight_token');
    localStorage.removeItem('qualisight_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
