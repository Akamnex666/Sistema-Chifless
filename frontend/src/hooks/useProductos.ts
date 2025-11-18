import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Producto } from '@/types';

export function useProductos() {
  return useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await apiClient.get('/productos');
      return data;
    },
  });
}

export function useProducto(id: number) {
  return useQuery<Producto>({
    queryKey: ['productos', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/productos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (producto: Omit<Producto, 'id'>) => {
      const { data } = await apiClient.post('/productos', producto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...producto }: Partial<Producto> & { id: number }) => {
      const { data } = await apiClient.put(`/productos/${id}`, producto);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos', variables.id] });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
