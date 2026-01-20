import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authService from './authService';

const apiClient = axios.create({
  // Por defecto incluir el prefijo global del API ('/chifles') para evitar
  // solicitudes a rutas sin el prefijo cuando no se define la variable de env.
  baseURL: process.env.NEXT_PUBLIC_API_REST_URL || 'http://localhost:3000/chifles',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para añadir Authorization desde localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // No bloquear si localStorage falla
      console.warn('api request interceptor error', e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejo de errores con auto-refresh de token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Si no hay respuesta (error de red/conexión), no intentar refresh
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(error);
    }
    
    const status = error.response?.status;
    
    // Si es 401 y no hemos reintentado aún
    if (status === 401 && !originalRequest._retry) {
      // Marcar que ya intentamos retry
      originalRequest._retry = true;
      
      // Obtener refresh token
      const { refreshToken } = authService.getTokens();
      
      // Si no hay refresh token, redirigir al login
      if (!refreshToken) {
        console.warn('No refresh token available, redirecting to login');
        authService.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // Si ya está refrescando, encolar esta petición
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      isRefreshing = true;
      
      try {
        console.log('Token expirado, intentando renovar...');
        const refreshResponse = await authService.refresh(refreshToken);
        const newAccessToken = refreshResponse.accessToken;
        
        // Guardar nuevos tokens
        authService.saveTokens({
          accessToken: newAccessToken,
          refreshToken: refreshToken,
          accessExpiresIn: refreshResponse.expiresIn,
          refreshExpiresIn: 604800000, // 7 días
        });
        
        console.log('Token renovado exitosamente');
        
        // Procesar cola de peticiones pendientes
        processQueue(null, newAccessToken);
        
        // Reintentar la petición original con el nuevo token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Error renovando token:', refreshError);
        processQueue(refreshError as Error, null);
        
        // Limpiar tokens y redirigir al login
        authService.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Para otros errores, solo loggear
    console.error('API Error:', status, error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export default apiClient;
