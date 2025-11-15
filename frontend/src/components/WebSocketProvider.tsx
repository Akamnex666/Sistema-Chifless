'use client';

import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWebSocket();

  useEffect(() => {
    console.log(
      isConnected 
        ? '✅ WebSocket: Conectado y escuchando notificaciones' 
        : '⏳ WebSocket: Conectando...'
    );
  }, [isConnected]);

  return <>{children}</>;
}
