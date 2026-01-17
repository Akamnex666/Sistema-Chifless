import { create } from 'zustand';
import { NotificationMessage, WebSocketEventType } from '@/types';

interface NotificationStore {
  notifications: NotificationMessage[];
  unreadCount: number;
  addNotification: (notification: NotificationMessage) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) =>
    set((state) => {
      const newNotifications = [notification, ...state.notifications].slice(0, 100);
      const unreadCount = newNotifications.filter(n => !n.read).length;
      return { notifications: newNotifications, unreadCount };
    }),
    
  removeNotification: (id) =>
    set((state) => {
      const newNotifications = state.notifications.filter((n) => n.id !== id);
      const unreadCount = newNotifications.filter(n => !n.read).length;
      return { notifications: newNotifications, unreadCount };
    }),
    
  markAsRead: (id) =>
    set((state) => {
      const newNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = newNotifications.filter(n => !n.read).length;
      return { notifications: newNotifications, unreadCount };
    }),
    
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
    
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// Helper para convertir eventos WebSocket a notificaciones con mensaje legible
export function createNotificationFromEvent(
  type: WebSocketEventType,
  payload: Record<string, unknown>
): NotificationMessage {
  const timestamp = new Date();
  const id = `${type}-${timestamp.getTime()}-${Math.random()}`;
  
  let title = '';
  let message = '';
  let severity: 'info' | 'success' | 'warning' | 'error' = 'info';

  switch (type) {
    // Productos
    case 'product.created':
      title = '✨ Nuevo Producto';
      message = `Se creó el producto: ${payload.nombre || 'Sin nombre'}`;
      severity = 'success';
      break;
    case 'product.updated':
      title = '📝 Producto Actualizado';
      message = `Se actualizó: ${payload.nombre || 'Producto'}`;
      severity = 'info';
      break;
    case 'product.deleted':
      title = '🗑️ Producto Eliminado';
      message = `Se eliminó: ${payload.nombre || 'Producto'}`;
      severity = 'warning';
      break;
    case 'product.enabled':
      title = '✅ Producto Habilitado';
      message = `Se habilitó: ${payload.nombre || 'Producto'}`;
      severity = 'success';
      break;
    case 'product.disabled':
      title = '⛔ Producto Deshabilitado';
      message = `Se deshabilitó: ${payload.nombre || 'Producto'}`;
      severity = 'warning';
      break;

    // Recetas
    case 'recipe.created':
      title = '🧪 Nueva Receta';
      message = 'Se creó una nueva receta de producto';
      severity = 'success';
      break;
    case 'recipe.updated':
      title = '📝 Receta Actualizada';
      message = 'Se actualizó una receta de producto';
      severity = 'info';
      break;
    case 'recipe.deleted':
      title = '🗑️ Receta Eliminada';
      message = 'Se eliminó una receta de producto';
      severity = 'warning';
      break;

    // Insumos
    case 'supply.restocked':
      title = '📦 Insumo Reabastecido';
      message = `Se reabastecieron: ${payload.nombre || 'Insumos'}`;
      severity = 'success';
      break;
    case 'supply.updated':
      title = '📝 Insumo Actualizado';
      message = `Se actualizó: ${payload.nombre || 'Insumo'}`;
      severity = 'info';
      break;
    case 'supply.deleted':
      title = '🗑️ Insumo Eliminado';
      message = `Se eliminó: ${payload.nombre || 'Insumo'}`;
      severity = 'warning';
      break;
    case 'supply.low':
      title = '⚠️ Stock Bajo';
      message = `¡Atención! Stock bajo de: ${payload.nombre || 'Insumo'}`;
      severity = 'error';
      break;

    // Pedidos
    case 'order.created':
      title = '🛒 Nuevo Pedido';
      message = `Pedido #${payload.id || payload.pedido_id || '?'} creado`;
      severity = 'success';
      break;
    case 'order.updated':
      title = '📝 Pedido Actualizado';
      message = `Pedido #${payload.id || payload.pedido_id || '?'} actualizado`;
      severity = 'info';
      break;
    case 'order.completed':
      title = '✅ Pedido Completado';
      message = `Pedido #${payload.id || payload.pedido_id || '?'} completado`;
      severity = 'success';
      break;
    case 'order.cancelled':
      title = '❌ Pedido Cancelado';
      message = `Pedido #${payload.id || payload.pedido_id || '?'} cancelado`;
      severity = 'error';
      break;

    // Producción
    case 'production.started':
      title = '🏭 Producción Iniciada';
      message = `Orden de producción #${payload.id || payload.orden_id || '?'} iniciada`;
      severity = 'success';
      break;
    case 'production.completed':
      title = '✅ Producción Completada';
      message = `Orden #${payload.id || payload.orden_id || '?'} completada`;
      severity = 'success';
      break;
    case 'production.cancelled':
      title = '❌ Producción Cancelada';
      message = `Orden #${payload.id || payload.orden_id || '?'} cancelada`;
      severity = 'error';
      break;
    case 'production.delayed':
      title = '⏰ Producción Retrasada';
      message = `Orden #${payload.id || payload.orden_id || '?'} retrasada`;
      severity = 'warning';
      break;

    // Clientes
    case 'client.created':
      title = '👤 Nuevo Cliente';
      message = `Cliente registrado: ${payload.nombre || 'Sin nombre'} ${payload.apellido || ''}`;
      severity = 'success';
      break;
    case 'client.updated':
      title = '📝 Cliente Actualizado';
      message = `Se actualizó: ${payload.nombre || 'Cliente'} ${payload.apellido || ''}`;
      severity = 'info';
      break;
    case 'client.deleted':
      title = '🗑️ Cliente Eliminado';
      message = `Se eliminó: ${payload.nombre || 'Cliente'}`;
      severity = 'warning';
      break;

    // Facturas
    case 'invoice.created':
      title = '🧾 Nueva Factura';
      message = `Factura ${payload.numero_factura || '#?'} generada`;
      severity = 'success';
      break;
    case 'invoice.paid':
      title = '💰 Factura Pagada';
      message = `Factura ${payload.numero_factura || '#?'} pagada`;
      severity = 'success';
      break;
    case 'invoice.deleted':
      title = '🗑️ Factura Eliminada';
      message = `Se eliminó factura ${payload.numero_factura || '#?'}`;
      severity = 'warning';
      break;

    // AI Orchestrator
    case 'order.created.ai':
      title = '🤖 Pedido creado vía IA';
      message = payload.mensaje || `Pedido #${payload.pedidoId || '?'} creado por el asistente`;
      severity = 'success';
      break;
    case 'ai.tool.executed':
      title = '🔧 Herramienta IA Ejecutada';
      message = payload.mensaje || `Se ejecutó: ${payload.tool || 'herramienta'}`;
      severity = 'info';
      break;
    case 'ai.analysis.completed':
      title = '📊 Análisis IA Completado';
      message = payload.mensaje || 'El asistente completó un análisis';
      severity = 'success';
      break;

    default:
      title = '📢 Notificación';
      message = `Evento: ${type}`;
      severity = 'info';
  }

  return {
    id,
    type,
    title,
    message,
    timestamp,
    read: false,
    severity,
  };
}
