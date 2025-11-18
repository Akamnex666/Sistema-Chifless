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
    const messageHandler = (event: any) => {
      if (event?.type && event?.payload) {
        const notification = createNotificationFromEvent(event.type as WebSocketEventType, event.payload);
        addNotification(notification);

        try {
          if (event.type === 'client.updated' || event.type === 'client.created') {
            const cliente = event.payload;
            const id = cliente?.id ? Number(cliente.id) : undefined;

            if (id !== undefined) {
              queryClient.setQueryData(['clientes', id], cliente);
            }

              queryClient.setQueryData(['clientes'], (old: any[] | undefined) => {
                if (!old) return old;
                if (event.type === 'client.created') {
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
