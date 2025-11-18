import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Factura } from '@/types';

export function useFacturas() {
  return useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: async () => {
      const { data } = await apiClient.get('/factura');
      return data;
    },
  });
}

export function useFactura(id: number) {
  return useQuery<Factura>({
    queryKey: ['facturas', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/factura/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (factura: Omit<Factura, 'id'>) => {
      const { data } = await apiClient.post('/factura', factura);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
}

export function useUpdateFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...factura }: Partial<Factura> & { id: number }) => {
      const { data } = await apiClient.put(`/factura/${id}`, factura);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['facturas', variables.id] });
    },
  });
}

export function useDeleteFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/factura/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
}
