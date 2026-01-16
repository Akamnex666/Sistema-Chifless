import axios from 'axios';

const apiClient = axios.create({
  // Por defecto incluir el prefijo global del API ('/chifles') para evitar
  // solicitudes a rutas sin el prefijo cuando no se define la variable de env.
  baseURL: process.env.NEXT_PUBLIC_API_REST_URL || 'http://localhost:3000/chifles',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
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
    // Si no hay respuesta (error de red/conexión), no redirigir
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(error);
    }
    
    const status = error.response?.status;
    console.error('API Error:', status, error.response?.data || error.message);
    
    // NO redirigir automáticamente - dejar que los componentes manejen los errores
    // Solo limpiar tokens si es 401 para que el AuthContext detecte el cambio
    if (typeof window !== 'undefined' && status === 401) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } catch (e) {
        console.warn('Error clearing tokens', e);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
