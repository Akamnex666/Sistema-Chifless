import axios from 'axios';

const apiClient = axios.create({
  // Por defecto incluir el prefijo global del API ('/chifles') para evitar
  // solicitudes a rutas sin el prefijo cuando no se define la variable de env.
  baseURL: process.env.NEXT_PUBLIC_API_REST_URL || 'http://localhost:3000/chifles',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error.response?.status;
      console.error('API Error:', error.response?.data || error.message);
      if (typeof window !== 'undefined' && status === 401) {
        // Token inválido o expirado: limpiar y forzar login
        try {
          localStorage.removeItem('access_token');
        } catch (e) {
          console.warn('Error clearing access_token', e);
        }
        // Reemplazamos la ubicación para evitar que el historial permita volver a una ruta protegida
        window.location.replace('/login');
      }
    } catch (e) {
      console.error('Error in response interceptor', e);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
