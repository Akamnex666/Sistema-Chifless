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

  const { data: reporteVentas, isLoading: loadingVentas, error: errorVentas } = useReporteVentas(fechaInicio, fechaFin);
  const { data: reporteProduccion, isLoading: loadingProduccion, error: errorProduccion } = useReporteProduccion(fechaInicio, fechaFin);
  const { data: reporteInventario, isLoading: loadingInventario, error: errorInventario } = useReporteInventario();

  if (loadingVentas || loadingProduccion || loadingInventario) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes desde GraphQL...</p>
        </div>
      </div>
    );
  }

  if (errorVentas || errorProduccion || errorInventario) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar reportes</h2>
        <p className="text-red-600">
          Verifica que el servidor GraphQL esté corriendo en el puerto 8000
        </p>
        <p className="text-sm text-red-500 mt-2">
          {errorVentas?.message || errorProduccion?.message || errorInventario?.message}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Reportes</h1>
        <p className="text-gray-600">Reportes generados con GraphQL • Datos en tiempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Ventas</p>
              <p className="text-3xl font-bold">
                $ {reporteVentas?.totalVentas?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign size={40} className="text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Pedidos</p>
              <p className="text-3xl font-bold">{reporteVentas?.totalPedidos || 0}</p>
              <p className="text-xs text-green-200 mt-1">
                {reporteVentas?.pedidosCompletados || 0} completados
              </p>
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
              <p className="text-xs text-purple-200 mt-1">
                {reporteProduccion?.ordenesCompletadas || 0} completadas
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
                {reporteInventario?.insumosStockBajo?.length || 0}
              </p>
              <p className="text-xs text-orange-200 mt-1">
                Requieren atención
              </p>
            </div>
            <AlertTriangle size={40} className="text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Ventas por Día */}
      {reporteVentas?.ventasPorDia && reporteVentas.ventasPorDia.length > 0 && (
        <Card title="📈 Ventas por Día (Últimos 30 días)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reporteVentas.ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total ($)" strokeWidth={2} />
              <Line type="monotone" dataKey="cantidad" stroke="#10b981" name="Cantidad Pedidos" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Productos Más Vendidos */}
      {reporteVentas?.productosMasVendidos && reporteVentas.productosMasVendidos.length > 0 && (
        <Card title="🏆 Productos Más Vendidos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reporteVentas.productosMasVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
            <Bar dataKey="cantidadVendida" fill="#3b82f6" name="Cantidad Vendida" />
            <Bar dataKey="totalVendido" fill="#10b981" name="Total Vendido ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Insumos Más Utilizados */}
      {reporteProduccion?.insumosMasUtilizados && reporteProduccion.insumosMasUtilizados.length > 0 && (
        <Card title="🏭 Insumos Más Utilizados en Producción">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reporteProduccion.insumosMasUtilizados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidadUtilizada" fill="#8b5cf6" name="Cantidad Utilizada" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Insumos con Stock Bajo */}
      {reporteInventario?.insumosStockBajo && reporteInventario.insumosStockBajo.length > 0 && (
        <Card title="⚠️ Insumos con Stock Bajo" className="border-red-300 border-2">
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
                  <tr key={insumo.id} className="hover:bg-red-25">
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{insumo.nombre}</td>
                    <td className="px-4 py-2 text-sm text-red-600 font-bold">{insumo.stock}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{insumo.stockMinimo}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{insumo.unidadMedida}</td>
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
                $ {reporteInventario?.valorInventario?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Estado de Producción */}
      {reporteProduccion && (
        <Card title="📊 Estado de Órdenes de Producción">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">{reporteProduccion.totalOrdenesProduccion}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{reporteProduccion.ordenesCompletadas}</p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{reporteProduccion.ordenesEnProceso}</p>
              <p className="text-sm text-gray-600">En Proceso</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{reporteProduccion.ordenesPendientes}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
