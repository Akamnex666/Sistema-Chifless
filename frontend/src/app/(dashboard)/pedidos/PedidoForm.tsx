'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Input } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useCreatePedido, useUpdatePedido } from '@/hooks/usePedidos';
import { Pedido } from '@/types';

interface PedidoFormProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoToEdit?: Pedido | null;
}

interface DetallePedidoForm {
  productoId: string;
  cantidad_solicitada: string;
  precio_unitario: string;
}

interface NuevoPedidoForm {
  fecha: string;
  estado: string;
  clienteId: string;
  detalles: DetallePedidoForm[];
}

const getFormDataFromPedido = (pedido: Pedido | null | undefined): NuevoPedidoForm => {
  if (pedido) {
    return {
      fecha: pedido.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
      estado: pedido.estado || 'pendiente',
      clienteId: pedido.clienteId?.toString() || '',
      detalles: pedido.detalles && pedido.detalles.length > 0
        ? pedido.detalles.map((d) => ({
            productoId: d.productoId?.toString() || '',
            cantidad_solicitada: d.cantidad?.toString() || '',
            precio_unitario: d.precio_unitario?.toString() || '',
          }))
        : [{ productoId: '', cantidad_solicitada: '', precio_unitario: '' }],
    };
  }
  return {
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    clienteId: '',
    detalles: [{ productoId: '', cantidad_solicitada: '', precio_unitario: '' }],
  };
};

export function PedidoForm({ isOpen, onClose, pedidoToEdit }: PedidoFormProps) {
  const createPedido = useCreatePedido();
  const updatePedido = useUpdatePedido();
  
  const isEditing = !!pedidoToEdit;

  const [formData, setFormData] = useState<NuevoPedidoForm>(() => getFormDataFromPedido(pedidoToEdit));

  // Sincronizar cuando cambia pedidoToEdit - esto es necesario para el modal
  useEffect(() => {
    setFormData(getFormDataFromPedido(pedidoToEdit));
  }, [pedidoToEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetalleChange = (
    index: number,
    field: keyof DetallePedidoForm,
    value: string
  ) => {
    setFormData((prev) => {
      const newDetalles = [...prev.detalles];
      newDetalles[index] = { ...newDetalles[index], [field]: value };
      return { ...prev, detalles: newDetalles };
    });
  };

  const addDetalle = () => {
    setFormData((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { productoId: '', cantidad_solicitada: '', precio_unitario: '' },
      ],
    }));
  };

  const removeDetalle = (index: number) => {
    if (formData.detalles.length > 1) {
      setFormData((prev) => ({
        ...prev,
        detalles: prev.detalles.filter((_, i) => i !== index),
      }));
    }
  };

  const calcularSubtotal = (detalle: DetallePedidoForm) => {
    const cantidad = parseFloat(detalle.cantidad_solicitada) || 0;
    const precio = parseFloat(detalle.precio_unitario) || 0;
    return cantidad * precio;
  };

  const calcularTotal = () => {
    return formData.detalles.reduce(
      (acc, detalle) => acc + calcularSubtotal(detalle),
      0
    );
  };

  const resetForm = () => {
    setFormData(getFormDataFromPedido(null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const detallesFormateados = formData.detalles.map((detalle) => ({
      productoId: parseInt(detalle.productoId),
      cantidad_solicitada: parseInt(detalle.cantidad_solicitada),
      precio_unitario: parseFloat(detalle.precio_unitario),
      subtotal: calcularSubtotal(detalle),
    }));

    try {
      if (isEditing && pedidoToEdit) {
        await updatePedido.mutateAsync({
          id: pedidoToEdit.id,
          fecha: formData.fecha,
          estado: formData.estado,
          clienteId: parseInt(formData.clienteId),
          total: calcularTotal(),
        });
      } else {
        await createPedido.mutateAsync({
          fecha: formData.fecha,
          estado: formData.estado,
          clienteId: parseInt(formData.clienteId),
          total: calcularTotal(),
          detalles: detallesFormateados,
        });
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error('Error al guardar pedido:', err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Editar Pedido' : 'Nuevo Pedido'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <Input
              type="date"
              name="fecha"
              value={formData.fecha}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="pendiente" className="text-black">
              Pendiente
            </option>
            <option value="en proceso" className="text-black">
              En Proceso
            </option>
            <option value="completado" className="text-black">
              Completado
            </option>
          </select>
        </div>

        {/* Detalles del pedido */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Detalles del Pedido
            </h3>
            <Button type="button" variant="secondary" size="sm" onClick={addDetalle}>
              <Plus size={16} className="mr-1" />
              Agregar Producto
            </Button>
          </div>

          <div className="space-y-3">
            {formData.detalles.map((detalle, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg"
              >
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Producto ID
                  </label>
                  <Input
                    type="number"
                    value={detalle.productoId}
                    onChange={(e) =>
                      handleDetalleChange(index, 'productoId', e.target.value)
                    }
                    placeholder="ID"
                    required
                    min="1"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Cantidad
                  </label>
                  <Input
                    type="number"
                    value={detalle.cantidad_solicitada}
                    onChange={(e) =>
                      handleDetalleChange(index, 'cantidad_solicitada', e.target.value)
                    }
                    placeholder="Cant."
                    required
                    min="1"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Precio Unit.
                  </label>
                  <Input
                    type="number"
                    value={detalle.precio_unitario}
                    onChange={(e) =>
                      handleDetalleChange(index, 'precio_unitario', e.target.value)
                    }
                    placeholder="S/"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                    {formatCurrency(calcularSubtotal(detalle))}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeDetalle(index)}
                    disabled={formData.detalles.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-blue-900">Total del Pedido</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calcularTotal())}
            </span>
          </div>
        </div>

        {(createPedido.error || updatePedido.error) && (
          <div className="text-red-500 text-sm">
            Error: {((createPedido.error || updatePedido.error) as Error).message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={createPedido.isPending || updatePedido.isPending}>
            {isEditing ? 'Guardar Cambios' : 'Crear Pedido'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
