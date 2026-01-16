'use client';

import React, { useState } from 'react';
import { useInsumos, useDeleteInsumo } from '@/hooks/useInsumos';
import { Insumo } from '@/types';
import { Card, Table, Button, Modal } from '@/components/ui';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import InsumoForm from './InsumoForm';

export default function InsumosPage() {
  const { data: insumos = [], isLoading } = useInsumos();
  const deleteInsumo = useDeleteInsumo();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedInsumo(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInsumo.mutateAsync(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar insumo:', error);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Insumo },
    { header: 'Nombre', accessor: 'nombre' as keyof Insumo },
    { header: 'Unidad', accessor: 'unidad_medida' as keyof Insumo },
    { header: 'Stock', accessor: 'stock' as keyof Insumo },
    { header: 'Estado', accessor: 'estado' as keyof Insumo },
    {
      header: 'Acciones',
      accessor: (row: Insumo) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleEdit(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(row.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Cargando insumos...</div>;
  }

  // Filtrar insumos con estado "agotado" o stock bajo (menos de 10)
  const insumosAlerta = insumos.filter(i => i.estado === 'agotado' || i.stock < 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Insumos</h1>
        <Button onClick={handleNew}>
          <Plus size={20} className="mr-2" />
          Nuevo Insumo
        </Button>
      </div>

      {insumosAlerta.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertTriangle size={24} />
            <div>
              <h3 className="font-semibold">Alerta de Stock</h3>
              <p className="text-sm">
                {insumosAlerta.length} insumo(s) requieren atención (stock bajo o agotado)
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Table data={insumos} columns={columns} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInsumo(null);
        }}
        title={selectedInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
        size="lg"
      >
        <InsumoForm
          insumo={selectedInsumo}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedInsumo(null);
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
            <p className="text-gray-900">¿Está seguro de que desea eliminar este insumo?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                isLoading={deleteInsumo.isPending}
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
