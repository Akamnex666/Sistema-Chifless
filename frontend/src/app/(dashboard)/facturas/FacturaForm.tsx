'use client';

import React, { useState } from 'react';
import { Button, Modal, Input } from '@/components/ui';
import { useCreateFactura, useUpdateFactura } from '@/hooks/useFacturas';
import { Factura } from '@/types';

interface FacturaFormProps {
  isOpen: boolean;
  onClose: () => void;
  facturaToEdit?: Factura | null;
}

interface NuevaFacturaForm {
  fecha_emision: string;
  total: string;
  estado_pago: string;
  clienteId: string;
  pedidoId: string;
}

// Función para obtener datos iniciales basados en facturaToEdit
const getInitialData = (factura: Factura | null | undefined): NuevaFacturaForm => {
  if (factura) {
    return {
      fecha_emision: factura.fecha_emision?.split('T')[0] || new Date().toISOString().split('T')[0],
      total: String(factura.total || ''),
      estado_pago: factura.estado_pago || 'pendiente',
      clienteId: String(factura.clienteId || ''),
      pedidoId: String(factura.pedidoId || ''),
    };
  }
  return {
    fecha_emision: new Date().toISOString().split('T')[0],
    total: '',
    estado_pago: 'pendiente',
    clienteId: '',
    pedidoId: '',
  };
};

export function FacturaForm({ isOpen, onClose, facturaToEdit }: FacturaFormProps) {
  const createFactura = useCreateFactura();
  const updateFactura = useUpdateFactura();
  const isEditMode = !!facturaToEdit;
  
  // Usar key para resetear el estado cuando cambia facturaToEdit
  const facturaKey = facturaToEdit?.id ?? 'new';
  const [formData, setFormData] = useState<NuevaFacturaForm>(() => getInitialData(facturaToEdit));

  // Sincronizar cuando cambia facturaToEdit usando un ref para evitar el warning
  const prevFacturaRef = React.useRef(facturaToEdit);
  if (prevFacturaRef.current !== facturaToEdit) {
    prevFacturaRef.current = facturaToEdit;
    // El estado se actualiza en el siguiente render
  }

  // Usar useMemo para calcular el valor inicial una vez
  React.useEffect(() => {
    // Solo actualizar si el modal está abierto y facturaToEdit cambió
    if (isOpen) {
      const newData = getInitialData(facturaToEdit);
      setFormData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturaKey, isOpen]);

  const resetForm = () => {
    setFormData(getInitialData(null));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const facturaData = {
      fecha_emision: formData.fecha_emision,
      total: parseFloat(formData.total),
      estado_pago: formData.estado_pago,
      clienteId: parseInt(formData.clienteId),
      pedidoId: parseInt(formData.pedidoId),
    };

    try {
      if (isEditMode && facturaToEdit) {
        await updateFactura.mutateAsync({
          id: facturaToEdit.id,
          ...facturaData,
        });
      } else {
        await createFactura.mutateAsync(facturaData);
      }
      
      resetForm();
      onClose();
    } catch (err) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} factura:`, err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const mutation = isEditMode ? updateFactura : createFactura;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Factura' : 'Nueva Factura'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Emisión
          </label>
          <Input
            type="date"
            name="fecha_emision"
            value={formData.fecha_emision}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID del Cliente
          </label>
          <Input
            type="number"
            name="clienteId"
            value={formData.clienteId}
            onChange={handleInputChange}
            placeholder="Ej: 1"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID del Pedido
          </label>
          <Input
            type="number"
            name="pedidoId"
            value={formData.pedidoId}
            onChange={handleInputChange}
            placeholder="Ej: 1"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total (S/)
          </label>
          <Input
            type="number"
            name="total"
            value={formData.total}
            onChange={handleInputChange}
            placeholder="Ej: 150.00"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de Pago
          </label>
          <select
            name="estado_pago"
            value={formData.estado_pago}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400"
          >
            <option value="pendiente" className="text-black">Pendiente</option>
            <option value="pagado" className="text-black">Pagado</option>
          </select>
        </div>

        {mutation.error && (
          <div className="text-red-500 text-sm">
            Error: {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
          >
            {isEditMode ? 'Guardar Cambios' : 'Crear Factura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
