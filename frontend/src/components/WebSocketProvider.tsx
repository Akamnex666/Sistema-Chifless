'use client';

import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { wsService } from '@/services/websocket';
import { useNotificationStore, createNotificationFromEvent } from '@/store/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketEventType } from '@/types';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWebSocket();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Registrar handler único para mensajes; así evitamos múltiples handlers desde varios componentes
    const messageHandler = (event: unknown) => {
      const wsEvent = event as { type?: string; payload?: Record<string, unknown> };
      if (wsEvent?.type && wsEvent?.payload) {
        const notification = createNotificationFromEvent(wsEvent.type as WebSocketEventType, wsEvent.payload);
        addNotification(notification);

        try {
          if (wsEvent.type === 'client.updated' || wsEvent.type === 'client.created') {
            const cliente = wsEvent.payload as Record<string, unknown>;
            const id = cliente?.id ? Number(cliente.id) : undefined;

            if (id !== undefined) {
              queryClient.setQueryData(['clientes', id], cliente);
            }

              queryClient.setQueryData(['clientes'], (old: Record<string, unknown>[] | undefined) => {
                if (!old) return old;
                if (wsEvent.type === 'client.created') {
                  // Upsert: eliminar cualquier cliente con el mismo id antes de añadir
                  const filtered = old.filter((c) => Number(c.id) !== Number(cliente.id));
                  return [cliente, ...filtered];
                }
                return old.map((c) => (Number(c.id) === id ? cliente : c));
              });

            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            if (id !== undefined) queryClient.invalidateQueries({ queryKey: ['clientes', id] });
          }
        } catch (err) {
          console.warn('Error actualizando cache desde WebSocket (provider):', err);
        }
      }
    };

    wsService.on('message', messageHandler);
    return () => wsService.off('message', messageHandler);
  }, [addNotification, queryClient]);

  useEffect(() => {
    console.log(
      isConnected 
        ? '✅ WebSocket: Conectado y escuchando notificaciones' 
        : '⏳ WebSocket: Conectando...'
    );
  }, [isConnected]);

  return <>{children}</>;
}
