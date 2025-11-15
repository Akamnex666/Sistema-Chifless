import { useEffect, useState, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import { WebSocketEventType } from '@/types';
import { useNotificationStore, createNotificationFromEvent } from '@/store/notifications';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Conectar al WebSocket
    wsService.connect();
    setIsConnected(wsService.isConnected());

    // Handlers de conexión
    const connectHandler = () => {
      setIsConnected(true);
      console.log('✅ WebSocket conectado al servidor');
    };
    
    const disconnectHandler = () => {
      setIsConnected(false);
      console.log('❌ WebSocket desconectado');
    };

    // Handler para todos los mensajes
    const messageHandler = (event: any) => {
      if (event.type && event.payload) {
        const notification = createNotificationFromEvent(
          event.type as WebSocketEventType,
          event.payload
        );
        addNotification(notification);
      }
    };

    wsService.on('connect', connectHandler);
    wsService.on('disconnect', disconnectHandler);
    wsService.on('message', messageHandler);

    // Cleanup
    return () => {
      wsService.off('connect', connectHandler);
      wsService.off('disconnect', disconnectHandler);
      wsService.off('message', messageHandler);
    };
  }, [addNotification]);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    wsService.on(eventType, callback);
    return () => wsService.off(eventType, callback);
  }, []);

  return {
    isConnected,
    subscribe,
  };
}
