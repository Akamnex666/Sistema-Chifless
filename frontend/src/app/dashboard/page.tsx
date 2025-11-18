"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  Users,
  Package,
  Layers,
  ShoppingCart,
  Factory,
  FileText,
  BarChart3,
  ArrowRight
} from 'lucide-react';

const modules = [
  {
    icon: Users,
    title: 'Clientes',
    description: 'Gestiona tu cartera de clientes',
    href: '/clientes',
    color: 'bg-blue-500',
  },
  {
    icon: Package,
    title: 'Productos',
    description: 'Administra el catálogo de productos',
    href: '/productos',
    color: 'bg-green-500',
  },
  {
    icon: Layers,
    title: 'Insumos',
    description: 'Control de inventario de insumos',
    href: '/insumos',
    color: 'bg-yellow-500',
  },
  {
    icon: ShoppingCart,
    title: 'Pedidos',
    description: 'Gestión de pedidos de clientes',
    href: '/pedidos',
    color: 'bg-purple-500',
  },
  {
    icon: Factory,
    title: 'Órdenes de Producción',
    description: 'Planifica y controla la producción',
    href: '/ordenes-produccion',
    color: 'bg-orange-500',
  },
  {
    icon: FileText,
    title: 'Facturas',
    description: 'Emisión y gestión de facturas',
    href: '/facturas',
    color: 'bg-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    description: 'Análisis y estadísticas del negocio',
    href: '/reportes',
    color: 'bg-indigo-500',
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Bienvenido al Sistema de Gestión de Chifles</h1>
        <p className="text-xl text-gray-600 mt-2">Sistema completo integrado con REST API, GraphQL y WebSocket</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🚀 Características del Sistema</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">📡 REST API</h3>
            <p className="text-blue-100">Operaciones CRUD completas para todas las entidades del sistema</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📊 GraphQL</h3>
            <p className="text-blue-100">Reportes y análisis avanzados con consultas eficientes</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⚡ WebSocket</h3>
            <p className="text-blue-100">Notificaciones en tiempo real de eventos del sistema</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className={`${module.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{module.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                      <div className="flex items-center text-blue-600 text-sm font-medium">Acceder<ArrowRight size={16} className="ml-1" /></div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Card title="Tecnologías Utilizadas" className="bg-gray-50">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Frontend</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Next.js 16 con React 19</li>
              <li>✓ TypeScript</li>
              <li>✓ Tailwind CSS</li>
              <li>✓ React Query (TanStack Query)</li>
              <li>✓ Zustand para estado global</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Backend</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ NestJS (REST API)</li>
              <li>✓ FastAPI + Strawberry (GraphQL)</li>
              <li>✓ Go (WebSocket Server)</li>
              <li>✓ PostgreSQL</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
