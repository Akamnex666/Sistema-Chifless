import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Insumo } from '@/types';

export function useInsumos() {
  return useQuery<Insumo[]>({
    queryKey: ['insumos'],
    queryFn: async () => {
      const { data } = await apiClient.get('/insumos');
      return data;
    },
  });
}

export function useInsumo(id: number) {
  return useQuery<Insumo>({
    queryKey: ['insumos', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/insumos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateInsumo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (insumo: Omit<Insumo, 'id'>) => {
      const { data } = await apiClient.post('/insumos', insumo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...insumo }: Partial<Insumo> & { id: number }) => {
      const { data } = await apiClient.put(`/insumos/${id}`, insumo);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos', variables.id] });
    },
  });
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/insumos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}
