import axios, { AxiosInstance } from 'axios';

// Cliente HTTP dedicado para el Auth-Service
const authClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos para el Auth-Service
export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
  expiresIn: number;
}

export interface ValidateResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
  };
}

// Servicio de autenticación
class AuthService {
  private refreshPromise: Promise<string> | null = null;

  /**
   * Registrar un nuevo usuario
   */
  async register(email: string, password: string, nombre: string): Promise<RegisterResponse> {
    const response = await authClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      nombre,
    });
    return response.data;
  }

  /**
   * Iniciar sesión y obtener tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await authClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  /**
   * Renovar el access token usando el refresh token
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    // Evitar múltiples llamadas de refresh simultáneas
    if (this.refreshPromise) {
      const newToken = await this.refreshPromise;
      return { message: 'Token renovado', accessToken: newToken, expiresIn: 900000 };
    }

    this.refreshPromise = (async () => {
      try {
        const response = await authClient.post<RefreshResponse>('/auth/refresh', {
          refreshToken,
        });
        return response.data.accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    const accessToken = await this.refreshPromise;
    return { message: 'Token renovado exitosamente', accessToken, expiresIn: 900000 };
  }

  /**
   * Cerrar sesión (revocar refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await authClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Ignorar errores de logout (el token podría estar expirado)
      console.warn('Error en logout:', error);
    }
  }

  /**
   * Obtener datos del usuario autenticado
   */
  async me(accessToken: string): Promise<AuthUser> {
    const response = await authClient.get<AuthUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  /**
   * Validar si un token es válido
   */
  async validate(accessToken: string): Promise<ValidateResponse> {
    const response = await authClient.get<ValidateResponse>('/auth/validate', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  /**
   * Guardar tokens en localStorage
   */
  saveTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      // Guardar tiempo de expiración para auto-refresh
      const expiresAt = Date.now() + tokens.accessExpiresIn;
      localStorage.setItem('token_expires_at', expiresAt.toString());
    } catch (e) {
      console.warn('Error guardando tokens:', e);
    }
  }

  /**
   * Obtener tokens de localStorage
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null; expiresAt: number | null } {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null, expiresAt: null };
    }
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const expiresAtStr = localStorage.getItem('token_expires_at');
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      return { accessToken, refreshToken, expiresAt };
    } catch (e) {
      console.warn('Error obteniendo tokens:', e);
      return { accessToken: null, refreshToken: null, expiresAt: null };
    }
  }

  /**
   * Limpiar todos los tokens de localStorage
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
    } catch (e) {
      console.warn('Error limpiando tokens:', e);
    }
  }

  /**
   * Verificar si el token está próximo a expirar (5 minutos antes)
   */
  isTokenExpiringSoon(): boolean {
    const { expiresAt } = this.getTokens();
    if (!expiresAt) return true;
    // Considerar expirado si faltan menos de 5 minutos
    return Date.now() > expiresAt - 5 * 60 * 1000;
  }

  /**
   * Verificar si el token ya expiró
   */
  isTokenExpired(): boolean {
    const { expiresAt } = this.getTokens();
    if (!expiresAt) return true;
    return Date.now() > expiresAt;
  }
}

export const authService = new AuthService();
export default authService;
