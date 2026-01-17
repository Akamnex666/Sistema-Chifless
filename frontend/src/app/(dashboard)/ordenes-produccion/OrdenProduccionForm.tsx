'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Input } from '@/components/ui';
import { useCreateOrdenProduccion, useUpdateOrdenProduccion } from '@/hooks/useOrdenesProduccion';
import { OrdenProduccion } from '@/types';

interface OrdenProduccionFormProps {
  isOpen: boolean;
  onClose: () => void;
  ordenToEdit?: OrdenProduccion | null;
}

interface OrdenFormData {
  id_pedido: string;
  fecha_orden: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
}

export function OrdenProduccionForm({ isOpen, onClose, ordenToEdit }: OrdenProduccionFormProps) {
  const createOrden = useCreateOrdenProduccion();
  const updateOrden = useUpdateOrdenProduccion();
  const isEditMode = !!ordenToEdit;
  
  const [formData, setFormData] = useState<OrdenFormData>({
    id_pedido: '',
    fecha_orden: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
  });

  useEffect(() => {
    if (ordenToEdit) {
      const fechaOrden = ordenToEdit.fecha_orden 
        ? new Date(ordenToEdit.fecha_orden).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      setFormData({
        id_pedido: String(ordenToEdit.id_pedido || ''),
        fecha_orden: fechaOrden,
        estado: ordenToEdit.estado || 'pendiente',
      });
    } else {
      resetForm();
    }
  }, [ordenToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id_pedido: '',
      fecha_orden: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ordenData = {
      id_pedido: parseInt(formData.id_pedido),
      fecha_orden: new Date(formData.fecha_orden),
      estado: formData.estado,
    };

    try {
      if (isEditMode && ordenToEdit) {
        await updateOrden.mutateAsync({
          id: ordenToEdit.id,
          ...ordenData,
        });
      } else {
        await createOrden.mutateAsync(ordenData);
      }
      
      resetForm();
      onClose();
    } catch (err) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} orden:`, err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const mutation = isEditMode ? updateOrden : createOrden;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID del Pedido
          </label>
          <Input
            type="number"
            name="id_pedido"
            value={formData.id_pedido}
            onChange={handleInputChange}
            placeholder="Ej: 1"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Orden
          </label>
          <Input
            type="date"
            name="fecha_orden"
            value={formData.fecha_orden}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
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
            {isEditMode ? 'Guardar Cambios' : 'Crear Orden'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
