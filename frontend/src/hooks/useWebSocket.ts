import { useEffect, useState, useCallback } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(() => wsService.isConnected());

  useEffect(() => {
    // Conectar al WebSocket (idempotente)
    wsService.connect();

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

  const subscribe = useCallback(<T = unknown>(eventType: string, callback: (data: T) => void) => {
    wsService.on(eventType, callback as (data: unknown) => void);
    return () => wsService.off(eventType, callback as (data: unknown) => void);
  }, []);

  return {
    isConnected,
    subscribe,
  };
}
