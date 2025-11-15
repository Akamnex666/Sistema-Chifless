'use client';

import React from 'react';
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
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Package, label: 'Productos', href: '/productos' },
  { icon: Layers, label: 'Insumos', href: '/insumos' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/pedidos' },
  { icon: Factory, label: 'Órdenes de Producción', href: '/ordenes-produccion' },
  { icon: FileText, label: 'Facturas', href: '/facturas' },
  { icon: BarChart3, label: 'Reportes', href: '/reportes' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Sistema Chifles</h1>
        <p className="text-sm text-gray-400">Gestión Integral</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
