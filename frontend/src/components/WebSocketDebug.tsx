'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationStore } from '@/store/notifications';

export function WebSocketDebug() {
  const { isConnected } = useWebSocket();
  const { notifications } = useNotificationStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm text-xs font-mono z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-semibold">WebSocket Debug</span>
      </div>
      <div className="space-y-1">
        <div>Estado: {isConnected ? '✓ Conectado' : '✗ Desconectado'}</div>
        <div>URL: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'}</div>
        <div>Notificaciones: {notifications.length}</div>
        {notifications.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="font-semibold mb-1">Última notificación:</div>
            <div className="text-green-400">{notifications[0]?.title}</div>
          </div>
        )}
      </div>
    </div>
  );
}
