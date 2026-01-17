'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal } from '@/components/ui';
import { FileText, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useFacturas, useDeleteFactura } from '@/hooks/useFacturas';
import { Factura } from '@/types';
import { FacturaForm } from './FacturaForm';
import { FacturaView } from './FacturaView';

export default function FacturasPage() {
  const { data: facturas, isLoading, error } = useFacturas();
  const deleteFactura = useDeleteFactura();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [facturaToEdit, setFacturaToEdit] = useState<Factura | null>(null);

  const handleViewFactura = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsViewOpen(true);
  };

  const handleEditFactura = (factura: Factura) => {
    setFacturaToEdit(factura);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedFactura) {
      try {
        await deleteFactura.mutateAsync(selectedFactura.id);
        setIsDeleteOpen(false);
        setSelectedFactura(null);
      } catch (err) {
        console.error('Error al eliminar factura:', err);
      }
    }
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setFacturaToEdit(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: (row: Factura) => <span className="font-medium">#{row.id}</span>,
    },
    {
      header: 'Fecha Emisión',
      accessor: (row: Factura) => formatDate(row.fecha_emision),
    },
    {
      header: 'Cliente ID',
      accessor: 'clienteId' as keyof Factura,
    },
    {
      header: 'Pedido ID',
      accessor: 'pedidoId' as keyof Factura,
    },
    {
      header: 'Total',
      accessor: (row: Factura) => (
        <span className="font-semibold">{formatCurrency(Number(row.total))}</span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row: Factura) => getEstadoBadge(row.estado_pago),
    },
    {
      header: 'Acciones',
      accessor: (row: Factura) => (
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            title="Ver detalle"
            onClick={() => handleViewFactura(row)}
          >
            <Eye size={16} />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            title="Editar"
            onClick={() => handleEditFactura(row)}
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
        <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
        <Card>
          <div className="text-center py-12 text-red-500">
            Error al cargar las facturas: {(error as Error).message}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nueva Factura
        </Button>
      </div>

      {facturas && facturas.length > 0 ? (
        <Card>
          <Table data={facturas} columns={columns} />
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay facturas
            </h3>
            <p className="text-gray-500 mb-4">
              Aún no se han emitido facturas en el sistema
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Crear Primera Factura
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear/editar factura */}
      <FacturaForm
        isOpen={isModalOpen}
        onClose={handleCloseForm}
        facturaToEdit={facturaToEdit}
      />

      {/* Modal para ver detalle de factura */}
      <FacturaView
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        factura={selectedFactura}
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
            ¿Está seguro de que desea eliminar la factura #{selectedFactura?.id}?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteFactura.isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
