"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import authService, { AuthUser, AuthTokens } from '@/services/authService';

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshAuth: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar desde localStorage al montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { accessToken, refreshToken } = authService.getTokens();
        
        if (accessToken && !authService.isTokenExpired()) {
          // Token válido, obtener datos del usuario
          setToken(accessToken);
          try {
            const userData = await authService.me(accessToken);
            setUser(userData);
          } catch (e) {
            console.warn('Error obteniendo datos de usuario:', e);
          }
        } else if (refreshToken) {
          // Token expirado pero hay refresh token, intentar renovar
          try {
            const refreshResponse = await authService.refresh(refreshToken);
            const newTokens: AuthTokens = {
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshToken,
              accessExpiresIn: refreshResponse.expiresIn,
              refreshExpiresIn: 604800000, // 7 días por defecto
            };
            authService.saveTokens(newTokens);
            setToken(refreshResponse.accessToken);
            
            const userData = await authService.me(refreshResponse.accessToken);
            setUser(userData);
          } catch (e) {
            console.warn('Error renovando token:', e);
            authService.clearTokens();
          }
        }
      } catch (e) {
        console.error('Error inicializando auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Configurar auto-refresh del token
  useEffect(() => {
    if (!token) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Verificar y renovar token cada 4 minutos
    refreshIntervalRef.current = setInterval(async () => {
      if (authService.isTokenExpiringSoon()) {
        const { refreshToken } = authService.getTokens();
        if (refreshToken) {
          try {
            const refreshResponse = await authService.refresh(refreshToken);
            const newTokens: AuthTokens = {
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshToken,
              accessExpiresIn: refreshResponse.expiresIn,
              refreshExpiresIn: 604800000,
            };
            authService.saveTokens(newTokens);
            setToken(refreshResponse.accessToken);
          } catch (e) {
            console.warn('Error en auto-refresh:', e);
            // Si falla el refresh, hacer logout
            authService.clearTokens();
            setToken(null);
            setUser(null);
            router.push('/login');
          }
        }
      }
    }, 4 * 60 * 1000); // Cada 4 minutos

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, router]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    authService.saveTokens(response.tokens);
    setToken(response.tokens.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, password: string, nombre: string) => {
    await authService.register(email, password, nombre);
    // Después de registrar, hacer login automático
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    const { refreshToken } = authService.getTokens();
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    authService.clearTokens();
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const { refreshToken } = authService.getTokens();
    if (!refreshToken) return false;

    try {
      const refreshResponse = await authService.refresh(refreshToken);
      const newTokens: AuthTokens = {
        accessToken: refreshResponse.accessToken,
        refreshToken: refreshToken,
        accessExpiresIn: refreshResponse.expiresIn,
        refreshExpiresIn: 604800000,
      };
      authService.saveTokens(newTokens);
      setToken(refreshResponse.accessToken);
      return true;
    } catch (e) {
      console.warn('Error en refreshAuth:', e);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
