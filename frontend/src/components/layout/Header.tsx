'use client';

import React from 'react';
import { Wifi, WifiOff, LogOut, User } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { isConnected } = useWebSocket();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sistema de Gestión de Chifles
          </h2>
          <p className="text-sm text-gray-500">
            Integración completa: REST + GraphQL + WebSocket
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Estado de conexión WebSocket */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200">
            {isConnected ? (
              <>
                <Wifi size={18} className="text-green-500" />
                <span className="text-sm text-green-600 font-medium">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff size={18} className="text-red-500" />
                <span className="text-sm text-red-600 font-medium">Desconectado</span>
              </>
            )}
          </div>

          {/* Centro de Notificaciones */}
          <NotificationCenter />

          {/* Usuario autenticado */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <User size={18} className="text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{user.nombre}</span>
                  <span className="text-gray-400 ml-1 text-xs">({user.email})</span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={logout}
                className="flex items-center gap-2 text-sm"
              >
                <LogOut size={16} />
                Salir
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
