'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Package,
  Layers,
  ShoppingCart,
  Factory,
  FileText,
  BarChart3,
  CreditCard,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Package, label: 'Productos', href: '/productos' },
  { icon: Layers, label: 'Insumos', href: '/insumos' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/pedidos' },
  { icon: Factory, label: 'Producción', href: '/ordenes-produccion' },
  { icon: FileText, label: 'Facturas', href: '/facturas' },
  { icon: CreditCard, label: 'Pagos', href: '/pagos' },
  { icon: BarChart3, label: 'Reportes', href: '/reportes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🍌</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Sistema Chifles</h1>
              <p className="text-xs text-gray-400">Gestión Integral</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <p className="text-xs font-medium text-blue-900">¿Necesitas ayuda?</p>
            <p className="text-xs text-blue-600 mt-1">Usa el chatbot IA en la esquina inferior derecha</p>
          </div>
        </div>
      </aside>
    </>
  );
}
