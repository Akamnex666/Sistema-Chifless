'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { FileText } from 'lucide-react';

export default function FacturasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
      </div>

      <Card>
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Módulo de Facturas
          </h3>
          <p className="text-gray-500">
            Emisión y gestión de facturas electrónicas con cálculo de IGV
          </p>
        </div>
      </Card>
    </div>
  );
}
