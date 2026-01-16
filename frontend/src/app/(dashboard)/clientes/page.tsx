'use client';

import React, { useState } from 'react';
import { useClientes, useDeleteCliente } from '@/hooks/useClientes';
import { Cliente } from '@/types';
import { Card, Table, Button, Modal } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ClienteForm from './ClienteForm';

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes();
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
            onClick={() => handleEdit(row)}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowDeleteConfirm(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Cargando clientes...</div>;
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
