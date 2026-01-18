'use client';

import React, { useState } from 'react';
import { useClientes, useDeleteCliente } from '@/hooks/useClientes';
import { Cliente } from '@/types';
import { Card, Table, Button, Modal } from '@/components/ui';
import { Plus, Pencil, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import ClienteForm from './ClienteForm';

export default function ClientesPage() {
  const { data: clientes = [], isLoading, error, refetch } = useClientes();
  const deleteCliente = useDeleteCliente();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCliente.mutateAsync(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Cliente },
    { header: 'Nombre', accessor: 'nombre' as keyof Cliente },
    { header: 'Apellido', accessor: 'apellido' as keyof Cliente },
    { header: 'DNI', accessor: 'dni' as keyof Cliente },
    { header: 'Teléfono', accessor: 'telefono' as keyof Cliente },
    { header: 'Email', accessor: 'email' as keyof Cliente },
    {
      header: 'Acciones',
      accessor: (row: Cliente) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            title="Editar"
            onClick={() => handleEdit(row)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            title="Eliminar"
            onClick={() => setShowDeleteConfirm(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar clientes</h3>
          <p className="text-red-600 text-sm mb-4">
            {(error as Error).message || 'No se pudo conectar con el servidor'}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Asegúrate de que el API Rest esté corriendo en el puerto 3000
          </p>
          <Button onClick={() => refetch()} variant="primary">
            <RefreshCw size={16} className="mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={handleNew}>
          <Plus size={20} className="mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <Table data={clientes} columns={columns} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <ClienteForm
          cliente={selectedCliente}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedCliente(null);
          }}
        />
      </Modal>

      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirmar eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-900">¿Está seguro de que desea eliminar este cliente?</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                isLoading={deleteCliente.isPending}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
