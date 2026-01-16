'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Factory } from 'lucide-react';

export default function OrdenesProduccionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Producción</h1>
      </div>

      <Card>
        <div className="text-center py-12">
          <Factory size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Módulo de Órdenes de Producción
          </h3>
          <p className="text-gray-500">
            Control y seguimiento de órdenes de producción con consumo de insumos
          </p>
        </div>
      </Card>
    </div>
  );
}
