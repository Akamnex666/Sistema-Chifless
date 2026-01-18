'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Wifi, WifiOff, LogOut, User, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isConnected } = useWebSocket();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* WebSocket Status - Hidden on small screens */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            {isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-600 font-medium">En línea</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600 font-medium">Desconectado</span>
              </>
            )}
          </div>

          {/* Mobile WebSocket indicator */}
          <div className="sm:hidden">
            {isConnected ? (
              <Wifi size={18} className="text-green-500" />
            ) : (
              <WifiOff size={18} className="text-red-500" />
            )}
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          {isAuthenticated && user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.nombre}</p>
                  <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={16} className="text-gray-400" />
                      Mi Perfil
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={16} className="text-gray-400" />
                      Configuración
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <HelpCircle size={16} className="text-gray-400" />
                      Ayuda
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
