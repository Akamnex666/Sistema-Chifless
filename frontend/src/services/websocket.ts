class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string = '';

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.url = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws');
    
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('✓ WebSocket conectado');
        this.reconnectAttempts = 0;
        this.notifyListeners('connect', {});
      };

      this.socket.onclose = () => {
        console.log('WebSocket desconectado');
        this.notifyListeners('disconnect', {});
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', error);
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
  on(eventName: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);
  }

  // Desuscribirse de eventos
  off(eventName: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  // Notificar a todos los listeners de un evento
  private notifyListeners(eventName: string, data: any) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  send(data: any) {
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
