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
      // Log request details for debugging
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        console.log('[useCreateCliente] POST', apiClient.defaults.baseURL + '/clientes', { cliente, token });
      } catch (e) {
        console.warn('[useCreateCliente] no se pudo leer token', e);
      }

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
      // El backend expone PUT para actualizar clientes (no PATCH), usar PUT
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const url = `${apiClient.defaults.baseURL}/clientes/${id}`;
        console.log('[useUpdateCliente] PUT', url, { id, cliente, token });
      } catch (e) {
        console.warn('[useUpdateCliente] no se pudo leer token', e);
      }

      const { data } = await apiClient.put(`/clientes/${id}`, cliente);
      return data;
    },
    onSuccess: (updatedCliente, variables) => {
      // Actualizar la cache localmente para reflejar el cambio inmediatamente
      if (variables?.id) {
        // actualizar lista de clientes
        queryClient.setQueryData<Cliente[] | undefined>(['clientes'], (old) => {
          if (!old) return old;
          return old.map((c) => (c.id === variables.id ? (updatedCliente as Cliente) : c));
        });

        // actualizar cliente individual
        queryClient.setQueryData<Cliente | undefined>(['clientes', variables.id], updatedCliente as Cliente);
      }

      // además invalidar para forzar refetch si es necesario
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', variables?.id] });
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
