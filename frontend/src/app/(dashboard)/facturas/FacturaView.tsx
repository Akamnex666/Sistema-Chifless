'use client';

import React from 'react';
import { Button, Modal, Badge } from '@/components/ui';
import { FileText, Calendar, User, Package, DollarSign } from 'lucide-react';
import { Factura } from '@/types';

interface FacturaViewProps {
  isOpen: boolean;
  onClose: () => void;
  factura: Factura | null;
}

export function FacturaView({ isOpen, onClose, factura }: FacturaViewProps) {
  if (!factura) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pagado':
        return <Badge variant="success">Pagado</Badge>;
      case 'pendiente':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'anulado':
        return <Badge variant="danger">Anulado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Factura"
      size="md"
    >
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Factura #{factura.id}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(factura.fecha_emision)}
              </p>
            </div>
          </div>
          {getEstadoBadge(factura.estado_pago)}
        </div>

        {/* Información de la factura */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">Fecha de Emisión</span>
            </div>
            <p className="font-medium text-gray-900">
              {formatDate(factura.fecha_emision)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <User size={16} />
              <span className="text-sm">Cliente</span>
            </div>
            <p className="font-medium text-gray-900">
              ID: {factura.clienteId}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Package size={16} />
              <span className="text-sm">Pedido</span>
            </div>
            <p className="font-medium text-gray-900">
              ID: {factura.pedidoId}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DollarSign size={16} />
              <span className="text-sm">Estado de Pago</span>
            </div>
            <p className="font-medium text-gray-900 capitalize">
              {factura.estado_pago}
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-blue-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(factura.total))}
            </span>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
