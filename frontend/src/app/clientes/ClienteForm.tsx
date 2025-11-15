'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateCliente, useUpdateCliente } from '@/hooks/useClientes';
import { Cliente } from '@/types';
import { Button, Input } from '@/components/ui';

interface ClienteFormProps {
  cliente: Cliente | null;
  onSuccess: () => void;
}

interface ClienteFormData {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
}

export default function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    defaultValues: cliente || {},
  });

  useEffect(() => {
    if (cliente) {
      reset(cliente);
    }
  }, [cliente, reset]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (cliente) {
        await updateCliente.mutateAsync({ id: cliente.id, ...data });
      } else {
        await createCliente.mutateAsync(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
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
        label="Apellido *"
        {...register('apellido', { required: 'El apellido es requerido' })}
        error={errors.apellido?.message}
      />

      <Input
        label="DNI *"
        {...register('dni', { required: 'El DNI es requerido' })}
        error={errors.dni?.message}
        placeholder="Ej: 1234567890"
      />

      <Input
        label="Teléfono *"
        type="tel"
        {...register('telefono', { required: 'El teléfono es requerido' })}
        error={errors.telefono?.message}
      />

      <Input
        label="Email *"
        type="email"
        {...register('email', { required: 'El email es requerido' })}
        error={errors.email?.message}
      />

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="submit"
          isLoading={createCliente.isPending || updateCliente.isPending}
        >
          {cliente ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
