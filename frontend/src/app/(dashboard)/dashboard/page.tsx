"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  Layers, 
  ShoppingCart, 
  Factory, 
  FileText, 
  BarChart3, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const modules = [
  {
    icon: Users,
    title: 'Clientes',
    description: 'Gestiona tu cartera de clientes',
    href: '/clientes',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Package,
    title: 'Productos',
    description: 'Catálogo de productos',
    href: '/productos',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Layers,
    title: 'Insumos',
    description: 'Control de inventario',
    href: '/insumos',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: ShoppingCart,
    title: 'Pedidos',
    description: 'Gestión de pedidos',
    href: '/pedidos',
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Factory,
    title: 'Producción',
    description: 'Órdenes de producción',
    href: '/ordenes-produccion',
    color: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    icon: FileText,
    title: 'Facturas',
    description: 'Facturación del negocio',
    href: '/facturas',
    color: 'from-pink-500 to-pink-600',
    bgLight: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

const stats = [
  { label: 'Pedidos Hoy', value: '24', icon: ShoppingCart, change: '+12%', positive: true },
  { label: 'En Producción', value: '8', icon: Factory, change: '3 pendientes', positive: null },
  { label: 'Completados', value: '156', icon: CheckCircle, change: '+8%', positive: true },
  { label: 'Alertas', value: '2', icon: AlertCircle, change: 'Stock bajo', positive: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bienvenido al Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Sistema de Gestión Integral de Chifles
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                {stat.positive !== null && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.change}
                  </span>
                )}
                {stat.positive === null && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Módulos del Sistema</h2>
          <Link href="/reportes" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Ver reportes
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${module.bgLight}`}>
                      <Icon className={`w-6 h-6 ${module.iconColor}`} />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-4">{module.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900">REST API</p>
              <p className="text-xs text-gray-500">NestJS - Puerto 3000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900">GraphQL</p>
              <p className="text-xs text-gray-500">FastAPI - Puerto 8000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900">WebSocket</p>
              <p className="text-xs text-gray-500">Go - Puerto 8080</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
