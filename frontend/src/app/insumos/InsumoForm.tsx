'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateInsumo, useUpdateInsumo } from '@/hooks/useInsumos';
import { Insumo } from '@/types';
import { Button, Input } from '@/components/ui';

interface InsumoFormProps {
  insumo: Insumo | null;
  onSuccess: () => void;
}

interface InsumoFormData {
  nombre: string;
  unidad_medida: string;
  stock: number;
  estado: string;
}

export default function InsumoForm({ insumo, onSuccess }: InsumoFormProps) {
  const createInsumo = useCreateInsumo();
  const updateInsumo = useUpdateInsumo();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsumoFormData>({
    defaultValues: insumo || { stock: 0, estado: 'disponible' },
  });

  useEffect(() => {
    if (insumo) {
      reset(insumo);
    }
  }, [insumo, reset]);

  const onSubmit = async (data: InsumoFormData) => {
    try {
      if (insumo) {
        await updateInsumo.mutateAsync({ id: insumo.id, ...data });
      } else {
        await createInsumo.mutateAsync(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar insumo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre *"
        {...register('nombre', { required: 'El nombre es requerido' })}
        error={errors.nombre?.message}
      />

      <Input
        label="Unidad de Medida *"
        placeholder="Ej: kg, litros, unidades"
        {...register('unidad_medida', { required: 'La unidad de medida es requerida' })}
        error={errors.unidad_medida?.message}
      />

      <Input
        label="Stock *"
        type="number"
        step="0.01"
        {...register('stock', { 
          required: 'El stock es requerido',
          valueAsNumber: true,
          min: { value: 0, message: 'El stock debe ser mayor o igual a 0' }
        })}
        error={errors.stock?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Estado *</label>
        <select
          {...register('estado', { required: 'El estado es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
          <option value="descontinuado">Descontinuado</option>
        </select>
        {errors.estado && (
          <p className="text-sm text-red-600">{errors.estado.message}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="submit"
          isLoading={createInsumo.isPending || updateInsumo.isPending}
        >
          {insumo ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
