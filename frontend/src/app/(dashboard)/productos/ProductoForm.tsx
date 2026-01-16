'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateProducto, useUpdateProducto } from '@/hooks/useProductos';
import { Producto } from '@/types';
import { Button, Input } from '@/components/ui';

interface ProductoFormProps {
  producto: Producto | null;
  onSuccess: () => void;
}

interface ProductoFormData {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  unidad_medida: string;
  estado: string;
}

export default function ProductoForm({ producto, onSuccess }: ProductoFormProps) {
  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductoFormData>({
    defaultValues: producto || { 
      precio: 0, 
      categoria: '', 
      unidad_medida: '', 
      estado: 'disponible' 
    },
  });

  useEffect(() => {
    if (producto) {
      reset(producto);
    }
  }, [producto, reset]);

  const onSubmit = async (data: ProductoFormData) => {
    try {
      if (producto) {
        await updateProducto.mutateAsync({ id: producto.id, ...data });
      } else {
        await createProducto.mutateAsync(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar producto:', error);
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
        label="Descripción"
        {...register('descripcion')}
        error={errors.descripcion?.message}
      />

      <Input
        label="Precio *"
        type="number"
        step="0.01"
        {...register('precio', { 
          required: 'El precio es requerido',
          valueAsNumber: true,
          min: { value: 0, message: 'El precio debe ser mayor a 0' }
        })}
        error={errors.precio?.message}
      />

      <Input
        label="Categoría *"
        {...register('categoria', { 
          required: 'La categoría es requerida'
        })}
        error={errors.categoria?.message}
      />

      <Input
        label="Unidad de Medida *"
        {...register('unidad_medida', { 
          required: 'La unidad de medida es requerida'
        })}
        error={errors.unidad_medida?.message}
        placeholder="Ej: Bolsa, Kg, Unidad"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Estado *</label>
        <select
          {...register('estado', { required: 'El estado es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
          isLoading={createProducto.isPending || updateProducto.isPending}
        >
          {producto ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
