import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Cliente } from '@/types';

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/clientes');
      return data;
    },
  });
}

export function useCliente(id: number) {
  return useQuery<Cliente>({
    queryKey: ['clientes', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clientes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id'>) => {
      const { data } = await apiClient.post('/clientes', cliente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<Cliente> & { id: number }) => {
      const { data } = await apiClient.patch(`/clientes/${id}`, cliente);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', variables.id] });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/clientes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}
