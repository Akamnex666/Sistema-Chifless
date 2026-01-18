'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal } from '@/components/ui';
import { Factory, Plus, Pencil, Trash2 } from 'lucide-react';
import { useOrdenesProduccion, useDeleteOrdenProduccion } from '@/hooks/useOrdenesProduccion';
import { OrdenProduccion } from '@/types';
import { OrdenProduccionForm } from './OrdenProduccionForm';

export default function OrdenesProduccionPage() {
  const { data: ordenes, isLoading, error } = useOrdenesProduccion();
  const deleteOrden = useDeleteOrdenProduccion();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenProduccion | null>(null);
  const [ordenToEdit, setOrdenToEdit] = useState<OrdenProduccion | null>(null);

  const handleEditOrden = (orden: OrdenProduccion) => {
    setOrdenToEdit(orden);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (orden: OrdenProduccion) => {
    setSelectedOrden(orden);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedOrden) {
      try {
        await deleteOrden.mutateAsync(selectedOrden.id);
        setIsDeleteOpen(false);
        setSelectedOrden(null);
      } catch (err) {
        console.error('Error al eliminar orden:', err);
      }
    }
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setOrdenToEdit(null);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'completada':
        return <Badge variant="success">Completada</Badge>;
      case 'pendiente':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'en_proceso':
        return <Badge variant="info">En Proceso</Badge>;
      case 'cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: (row: OrdenProduccion) => <span className="font-medium">#{row.id}</span>,
    },
    {
      header: 'Pedido ID',
      accessor: 'id_pedido' as keyof OrdenProduccion,
    },
    {
      header: 'Fecha Orden',
      accessor: (row: OrdenProduccion) => formatDate(row.fecha_orden),
    },
    {
      header: 'Estado',
      accessor: (row: OrdenProduccion) => getEstadoBadge(row.estado),
    },
    {
      header: 'Acciones',
      accessor: (row: OrdenProduccion) => (
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            title="Editar"
            onClick={() => handleEditOrden(row)}
          >
            <Pencil size={16} />
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            title="Eliminar"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Producción</h1>
        <Card>
          <div className="text-center py-12 text-red-500">
            Error al cargar las órdenes: {(error as Error).message}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Producción</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nueva Orden
        </Button>
      </div>

      {ordenes && ordenes.length > 0 ? (
        <Card>
          <Table data={ordenes} columns={columns} />
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Factory size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay órdenes de producción
            </h3>
            <p className="text-gray-500 mb-4">
              Aún no se han creado órdenes de producción en el sistema
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Crear Primera Orden
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear/editar orden */}
      <OrdenProduccionForm
        isOpen={isModalOpen}
        onClose={handleCloseForm}
        ordenToEdit={ordenToEdit}
      />

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-900">
            ¿Está seguro de que desea eliminar la orden de producción #{selectedOrden?.id}?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteOrden.isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
