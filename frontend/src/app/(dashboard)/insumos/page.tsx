'use client';

import React, { useState } from 'react';
import { useInsumos, useDeleteInsumo } from '@/hooks/useInsumos';
import { Insumo } from '@/types';
import { Card, Table, Button, Modal } from '@/components/ui';
import { Plus, Pencil, Trash2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import InsumoForm from './InsumoForm';

export default function InsumosPage() {
  const { data: insumos = [], isLoading, error, refetch } = useInsumos();
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
          <Button size="sm" variant="secondary" title="Editar" onClick={() => handleEdit(row)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="danger" title="Eliminar" onClick={() => setShowDeleteConfirm(row.id)}>
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
        <span className="ml-3 text-gray-600">Cargando insumos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar insumos</h3>
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
