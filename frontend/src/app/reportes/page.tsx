'use client';

import React, { useState } from 'react';
import { useReporteVentas, useReporteProduccion, useReporteInventario } from '@/hooks/useReportes';
import { Card } from '@/components/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Factory, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function ReportesPage() {
  const [fechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: reporteVentas, isLoading: loadingVentas } = useReporteVentas(fechaInicio, fechaFin);
  const { data: reporteProduccion, isLoading: loadingProduccion } = useReporteProduccion(fechaInicio, fechaFin);
  const { data: reporteInventario, isLoading: loadingInventario } = useReporteInventario();

  if (loadingVentas || loadingProduccion || loadingInventario) {
    return <div className="text-center py-8">Cargando reportes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Reportes</h1>
        <p className="text-gray-600">Reportes generados con GraphQL</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Ventas</p>
              <p className="text-3xl font-bold">
                S/. {reporteVentas?.totalVentas.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign size={40} className="text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Pedidos</p>
              <p className="text-3xl font-bold">{reporteVentas?.cantidadPedidos || 0}</p>
            </div>
            <ShoppingCart size={40} className="text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Órdenes Producción</p>
              <p className="text-3xl font-bold">
                {reporteProduccion?.totalOrdenesProduccion || 0}
              </p>
            </div>
            <Factory size={40} className="text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Insumos Stock Bajo</p>
              <p className="text-3xl font-bold">
                {reporteInventario?.insumosStockBajo.length || 0}
              </p>
            </div>
            <AlertTriangle size={40} className="text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Ventas por Día */}
      <Card title="Ventas por Día (Últimos 30 días)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reporteVentas?.ventasPorDia || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total (S/.)" />
            <Line type="monotone" dataKey="cantidad" stroke="#10b981" name="Cantidad" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Productos Más Vendidos */}
      <Card title="Productos Más Vendidos">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reporteVentas?.productosMasVendidos || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad_vendida" fill="#3b82f6" name="Cantidad Vendida" />
            <Bar dataKey="total_vendido" fill="#10b981" name="Total Vendido (S/.)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insumos Más Utilizados */}
      <Card title="Insumos Más Utilizados en Producción">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reporteProduccion?.insumosMasUtilizados || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad_utilizada" fill="#8b5cf6" name="Cantidad Utilizada" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insumos con Stock Bajo */}
      {reporteInventario && reporteInventario.insumosStockBajo.length > 0 && (
        <Card title="⚠️ Insumos con Stock Bajo" className="border-red-300">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Insumo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Stock Actual</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Stock Mínimo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reporteInventario.insumosStockBajo.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{insumo.nombre}</td>
                    <td className="px-4 py-2 text-sm text-red-600 font-semibold">{insumo.stock}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{insumo.stock_minimo}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{insumo.unidad_medida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Resumen de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Package size={32} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold">{reporteInventario?.totalProductos || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Package size={32} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Insumos</p>
              <p className="text-2xl font-bold">{reporteInventario?.totalInsumos || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp size={32} className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold">
                S/. {reporteInventario?.valorInventario.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
