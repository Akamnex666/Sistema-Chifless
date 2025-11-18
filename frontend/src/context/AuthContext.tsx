"use client";

import React, { createContext, useCallback, useEffect, useState } from 'react';

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('access_token');
      if (t) setToken(t);
    } catch (e) {
      // ignore
    }
  }, []);

  const login = useCallback((t: string) => {
    try {
      localStorage.setItem('access_token', t);
    } catch (e) {
      console.warn('No se pudo guardar token en localStorage', e);
    }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('access_token');
    } catch (e) {
      console.warn('No se pudo borrar token de localStorage', e);
    }
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
