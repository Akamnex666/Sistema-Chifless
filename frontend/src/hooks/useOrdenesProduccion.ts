import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { OrdenProduccion } from '@/types';

export function useOrdenesProduccion() {
  return useQuery<OrdenProduccion[]>({
    queryKey: ['ordenes-produccion'],
    queryFn: async () => {
      const { data } = await apiClient.get('/ordenes-produccion');
      return data;
    },
  });
}

export function useOrdenProduccion(id: number) {
  return useQuery<OrdenProduccion>({
    queryKey: ['ordenes-produccion', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/ordenes-produccion/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrdenProduccion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orden: Omit<OrdenProduccion, 'id'>) => {
      const { data } = await apiClient.post('/ordenes-produccion', orden);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-produccion'] });
    },
  });
}

export function useUpdateOrdenProduccion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...orden }: Partial<OrdenProduccion> & { id: number }) => {
      const { data } = await apiClient.patch(`/ordenes-produccion/${id}`, orden);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-produccion'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-produccion', variables.id] });
    },
  });
}

export function useDeleteOrdenProduccion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/ordenes-produccion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-produccion'] });
    },
  });
}
