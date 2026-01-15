// Tipos para las entidades del sistema

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  unidad_medida: string;
  estado: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Insumo {
  id: number;
  nombre: string;
  unidad_medida: string;
  stock: number;
  estado: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductoInsumo {
  id: number;
  id_producto: number;
  id_insumo: number;
  cantidad_necesaria: number;
  producto?: Producto;
  insumo?: Insumo;
}

export interface Pedido {
  id: number;
  id_cliente: number;
  fecha_pedido: Date;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  total: number;
  cliente?: Cliente;
  detalles?: DetallePedido[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DetallePedido {
  id: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface OrdenProduccion {
  id: number;
  id_pedido: number;
  fecha_orden: Date;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  pedido?: Pedido;
  detalles?: DetalleOrdenProduccion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DetalleOrdenProduccion {
  id: number;
  id_orden: number;
  id_insumo: number;
  cantidad_utilizada: number;
  insumo?: Insumo;
}

export interface Factura {
  id: number;
  id_pedido: number;
  numero_factura: string;
  fecha_emision: Date;
  subtotal: number;
  igv: number;
  total: number;
  pedido?: Pedido;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para notificaciones WebSocket
export type WebSocketEventType =
  // Productos
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.enabled'
  | 'product.disabled'
  // Recetas (Producto-Insumo)
  | 'recipe.created'
  | 'recipe.updated'
  | 'recipe.deleted'
  // Insumos
  | 'supply.restocked'
  | 'supply.updated'
  | 'supply.deleted'
  | 'supply.low'
  // Pedidos
  | 'order.created'
  | 'order.updated'
  | 'order.completed'
  | 'order.cancelled'
  // Producción
  | 'production.started'
  | 'production.cancelled'
  | 'production.completed'
  | 'production.delayed'
  // Clientes
  | 'client.created'
  | 'client.updated'
  | 'client.deleted'
  // Facturas
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.deleted'
  // AI Orchestrator
  | 'order.created.ai'
  | 'ai.tool.executed'
  | 'ai.analysis.completed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp?: string;
}

export interface NotificationMessage {
  id: string;
  type: WebSocketEventType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'error';
}

// Tipos para reportes GraphQL
export interface ReporteVentas {
  totalVentas: number;
  cantidadPedidos: number;
  totalPedidos: number;
  pedidosCompletados: number;
  pedidosPendientes: number;
  ventasPorDia: VentaDiaria[];
  productosMasVendidos: ProductoVendido[];
}

export interface VentaDiaria {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface ProductoVendido {
  idProducto: number;
  nombre: string;
  cantidadVendida: number;
  totalVendido: number;
}

export interface ReporteProduccion {
  totalOrdenesProduccion: number;
  ordenesCompletadas: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
  insumosMasUtilizados: InsumoUtilizado[];
  produccionPorDia: ProduccionDiaria[];
}

export interface InsumoUtilizado {
  idInsumo: number;
  nombre: string;
  cantidadUtilizada: number;
}

export interface ProduccionDiaria {
  fecha: string;
  cantidadOrdenes: number;
}

export interface ReporteInventario {
  totalProductos: number;
  totalInsumos: number;
  insumosStockBajo: InsumoStockBajo[];
  valorInventario: number;
  productos: ProductoInventario[];
  insumos: InsumoInventario[];
}

export interface InsumoStockBajo {
  id: number;
  nombre: string;
  unidadMedida: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
}

export interface ProductoInventario {
  id: number;
  nombre: string;
  stock: number;
  precioVenta: number;
}

export interface InsumoInventario {
  id: number;
  nombre: string;
  stock: number;
  unidadMedida: string;
  stockMinimo: number;
}
