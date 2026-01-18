class WebSocketService {
  private socket: WebSocket | null = null;
  private connecting: boolean = false;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string = '';

  connect() {
    // Evitar crear múltiples conexiones cuando ya existe una abierta o en proceso
    if (this.socket) {
      const state = this.socket.readyState;
      // 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return;
      }
      // Si estaba en CLOSING/CLOSED, continuamos y creamos una nueva conexión
    }
    if (this.connecting) {
      // Ya hay un intento de conexión en curso
      return;
    }
    this.connecting = true;

    this.url = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws');

    // Normalize the URL so it always targets the WebSocket endpoint '/ws'
    try {
      this.url = String(this.url).trim();
      if (!/\/ws$/.test(this.url)) {
        this.url = this.url.replace(/\/+$/, '') + '/ws';
      }
    } catch {
      this.url = 'ws://localhost:8081/ws';
    }

    // Añadir token como query param si existe en localStorage (navegador)
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Evitar duplicar query params
          this.url = this.url.includes('?') ? `${this.url}&token=${encodeURIComponent(token)}` : `${this.url}?token=${encodeURIComponent(token)}`;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer token desde localStorage para WebSocket', e);
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('✓ WebSocket conectado');
        this.reconnectAttempts = 0;
        this.connecting = false;
        this.notifyListeners('connect', {});
      };

      this.socket.onclose = () => {
        console.log('WebSocket desconectado');
        this.notifyListeners('disconnect', {});
        this.connecting = false;
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', error);
        this.connecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Evento recibido:', message);
          
          // Notificar al listener general
          this.notifyListeners('message', message);
          
          // Notificar a listeners específicos del tipo de evento
          if (message.type) {
            this.notifyListeners(message.type, message);
          }
        } catch (error) {
          console.error('Error parseando mensaje WebSocket:', error);
        }
      };
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      this.connecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo de intentos de reconexión alcanzado');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Suscribirse a eventos específicos
  on(eventName: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    const set = this.listeners.get(eventName)!;
    // Evitar añadir el mismo callback más de una vez
    if (!set.has(callback)) {
      set.add(callback);
    }
  }

  // Desuscribirse de eventos
  off(eventName: string, callback: (data: unknown) => void) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  // Notificar a todos los listeners de un evento
  private notifyListeners(eventName: string, data: unknown) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  send(data: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
