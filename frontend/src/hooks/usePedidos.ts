import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Pedido } from '@/types';

export function usePedidos() {
  return useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const { data } = await apiClient.get('/pedidos');
      return data;
    },
  });
}

export function usePedido(id: number) {
  return useQuery<Pedido>({
    queryKey: ['pedidos', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/pedidos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Tipo para crear pedido (sin IDs autogenerados)
interface CreatePedidoInput {
  fecha: string;
  total: number;
  estado: string;
  clienteId: number;
  detalles: {
    productoId: number;
    cantidad_solicitada: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export function useCreatePedido() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pedido: CreatePedidoInput) => {
      const { data } = await apiClient.post('/pedidos', pedido);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}

export function useUpdatePedido() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...pedido }: Partial<Pedido> & { id: number }) => {
      const { data } = await apiClient.put(`/pedidos/${id}`, pedido);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos', variables.id] });
    },
  });
}

export function useDeletePedido() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/pedidos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}
