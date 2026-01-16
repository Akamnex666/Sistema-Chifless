'use client';

import React, { useState } from 'react';
import { useProductos, useDeleteProducto } from '@/hooks/useProductos';
import { Producto } from '@/types';
import { Card, Table, Button, Modal } from '@/components/ui';
import { Plus, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import ProductoForm from './ProductoForm';

export default function ProductosPage() {
  const { data: productos = [], isLoading, error, refetch } = useProductos();
  const deleteProducto = useDeleteProducto();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProducto(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto.mutateAsync(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Producto },
    { header: 'Nombre', accessor: 'nombre' as keyof Producto },
    { header: 'Descripción', accessor: 'descripcion' as keyof Producto },
    { 
      header: 'Precio', 
      accessor: (row: Producto) => `S/. ${Number(row.precio).toFixed(2)}` 
    },
    { header: 'Categoría', accessor: 'categoria' as keyof Producto },
    { header: 'Estado', accessor: 'estado' as keyof Producto },
    {
      header: 'Acciones',
      accessor: (row: Producto) => (
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando productos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar productos</h3>
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
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <Button onClick={handleNew}>
          <Plus size={20} className="mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <Table data={productos} columns={columns} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProducto(null);
        }}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductoForm
          producto={selectedProducto}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedProducto(null);
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
            <p className="text-gray-900">¿Está seguro de que desea eliminar este producto?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                isLoading={deleteProducto.isPending}
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
