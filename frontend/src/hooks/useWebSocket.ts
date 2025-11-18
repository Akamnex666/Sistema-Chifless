import { useEffect, useState, useCallback } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Conectar al WebSocket (idempotente)
    wsService.connect();
    setIsConnected(wsService.isConnected());

    const connectHandler = () => {
      setIsConnected(true);
      console.log('✅ WebSocket conectado al servidor');
    };

    const disconnectHandler = () => {
      setIsConnected(false);
      console.log('❌ WebSocket desconectado');
    };

    wsService.on('connect', connectHandler);
    wsService.on('disconnect', disconnectHandler);

    return () => {
      wsService.off('connect', connectHandler);
      wsService.off('disconnect', disconnectHandler);
    };
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    wsService.on(eventType, callback);
    return () => wsService.off(eventType, callback);
  }, []);

  return {
    isConnected,
    subscribe,
  };
}
