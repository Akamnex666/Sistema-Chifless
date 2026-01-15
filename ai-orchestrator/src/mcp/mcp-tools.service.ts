import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ToolCall } from '../llm/interfaces/llm-provider.interface';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);
  private readonly apiBaseUrl: string;
  private readonly wsServerUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('API_REST_URL') || 'http://localhost:3000';
    this.wsServerUrl = this.configService.get<string>('WEBSOCKET_URL') || 'http://localhost:8080';
  }

  /**
   * Ejecuta una herramienta MCP basada en la llamada del LLM
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    this.logger.log(`Ejecutando herramienta: ${toolCall.name}`);
    this.logger.debug(`Argumentos: ${JSON.stringify(toolCall.args)}`);

    try {
      switch (toolCall.name) {
        case 'consultar_productos':
          return await this.consultarProductos(toolCall.args);
        case 'estado_pedido':
          return await this.estadoPedido(toolCall.args);
        case 'crear_pedido':
          return await this.crearPedido(toolCall.args);
        case 'registrar_cliente':
          return await this.registrarCliente(toolCall.args);
        case 'analisis_ventas':
          return await this.analisisVentas(toolCall.args);
        default:
          return {
            success: false,
            error: `Herramienta desconocida: ${toolCall.name}`,
          };
      }
    } catch (error) {
      this.logger.error(`Error ejecutando herramienta ${toolCall.name}:`, error);
      return {
        success: false,
        error: error.message || 'Error desconocido al ejecutar la herramienta',
      };
    }
  }

  /**
   * Herramienta 1: Consultar Productos
   * GET /productos
   */
  private async consultarProductos(args: Record<string, any>): Promise<ToolResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/productos`),
      );

      let productos = response.data;

      // Filtrar por categoría si se especifica
      if (args.categoria) {
        productos = productos.filter((p: any) =>
          p.nombre?.toLowerCase().includes(args.categoria.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(args.categoria.toLowerCase()),
        );
      }

      return {
        success: true,
        data: {
          total: productos.length,
          productos: productos.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            stock: p.stock,
          })),
        },
      };
    } catch (error) {
      throw new Error(`Error al consultar productos: ${error.message}`);
    }
  }

  /**
   * Herramienta 2: Estado de Pedido
   * GET /pedidos/:id
   */
  private async estadoPedido(args: Record<string, any>): Promise<ToolResult> {
    if (!args.pedido_id) {
      return { success: false, error: 'Se requiere el ID del pedido' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/pedidos/${args.pedido_id}`),
      );

      const pedido = response.data;

      return {
        success: true,
        data: {
          id: pedido.id,
          estado: pedido.estado,
          fecha: pedido.fecha || pedido.createdAt,
          cliente: pedido.cliente,
          detalles: pedido.detalles,
          total: pedido.total,
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, error: `Pedido #${args.pedido_id} no encontrado` };
      }
      throw new Error(`Error al consultar pedido: ${error.message}`);
    }
  }

  /**
   * Herramienta 3: Crear Pedido
   * POST /pedidos
   */
  private async crearPedido(args: Record<string, any>): Promise<ToolResult> {
    if (!args.cliente_id || !args.detalles || args.detalles.length === 0) {
      return {
        success: false,
        error: 'Se requiere cliente_id y al menos un detalle de producto',
      };
    }

    try {
      const pedidoData = {
        clienteId: args.cliente_id,
        estado: 'pendiente',
        detalles: args.detalles.map((d: any) => ({
          productoId: d.producto_id,
          cantidad: d.cantidad,
        })),
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/pedidos`, pedidoData),
      );

      const pedido = response.data;

      // Notificar via WebSocket
      await this.notifyWebSocket('order.created.ai', {
        pedidoId: pedido.id,
        mensaje: 'Nuevo pedido creado vía Asistente IA',
        origen: 'ai-orchestrator',
      });

      return {
        success: true,
        data: {
          mensaje: '¡Pedido creado exitosamente!',
          pedido_id: pedido.id,
          estado: pedido.estado,
          total: pedido.total,
        },
      };
    } catch (error) {
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }

  /**
   * Herramienta 4: Registrar Cliente
   * POST /clientes
   */
  private async registrarCliente(args: Record<string, any>): Promise<ToolResult> {
    if (!args.nombre || !args.email) {
      return {
        success: false,
        error: 'Se requiere nombre y email del cliente',
      };
    }

    try {
      const clienteData = {
        nombre: args.nombre,
        email: args.email,
        telefono: args.telefono || '',
        direccion: args.direccion || '',
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/clientes`, clienteData),
      );

      const cliente = response.data;

      return {
        success: true,
        data: {
          mensaje: '¡Cliente registrado exitosamente!',
          cliente_id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
        },
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return { success: false, error: 'Ya existe un cliente con ese email' };
      }
      throw new Error(`Error al registrar cliente: ${error.message}`);
    }
  }

  /**
   * Herramienta 5: Análisis de Ventas
   * Consulta múltiples endpoints y genera un resumen
   */
  private async analisisVentas(args: Record<string, any>): Promise<ToolResult> {
    try {
      // Obtener todos los pedidos
      const pedidosResponse = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/pedidos`),
      );

      let pedidos = pedidosResponse.data;

      // Filtrar por fechas si se especifican
      if (args.fecha_inicio) {
        const fechaInicio = new Date(args.fecha_inicio);
        pedidos = pedidos.filter(
          (p: any) => new Date(p.createdAt || p.fecha) >= fechaInicio,
        );
      }

      if (args.fecha_fin) {
        const fechaFin = new Date(args.fecha_fin);
        fechaFin.setHours(23, 59, 59);
        pedidos = pedidos.filter(
          (p: any) => new Date(p.createdAt || p.fecha) <= fechaFin,
        );
      }

      // Calcular estadísticas
      const totalPedidos = pedidos.length;
      const totalVentas = pedidos.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
      const pedidosPorEstado = pedidos.reduce((acc: any, p: any) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1;
        return acc;
      }, {});

      // Análisis por producto si se solicita
      let analysisPorProducto: { nombre: string; cantidad: number; total: number }[] | null = null;
      if (args.tipo_reporte === 'por_producto') {
        const productosVendidos: Record<number, { nombre: string; cantidad: number; total: number }> = {};
        
        for (const pedido of pedidos) {
          for (const detalle of pedido.detalles || []) {
            const prodId = detalle.producto?.id || detalle.productoId;
            if (!productosVendidos[prodId]) {
              productosVendidos[prodId] = {
                nombre: detalle.producto?.nombre || `Producto #${prodId}`,
                cantidad: 0,
                total: 0,
              };
            }
            productosVendidos[prodId].cantidad += detalle.cantidad || 0;
            productosVendidos[prodId].total += detalle.subtotal || 0;
          }
        }
        
        analysisPorProducto = Object.values(productosVendidos).sort(
          (a, b) => b.cantidad - a.cantidad,
        );
      }

      return {
        success: true,
        data: {
          periodo: {
            inicio: args.fecha_inicio || 'Desde el inicio',
            fin: args.fecha_fin || 'Hasta hoy',
          },
          resumen: {
            total_pedidos: totalPedidos,
            total_ventas: totalVentas.toFixed(2),
            promedio_por_pedido: totalPedidos > 0 ? (totalVentas / totalPedidos).toFixed(2) : 0,
          },
          pedidos_por_estado: pedidosPorEstado,
          productos_mas_vendidos: analysisPorProducto?.slice(0, 5) || null,
        },
      };
    } catch (error) {
      throw new Error(`Error al generar análisis de ventas: ${error.message}`);
    }
  }

  /**
   * Envía notificación al servidor WebSocket
   */
  private async notifyWebSocket(event: string, data: any): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.wsServerUrl}/notify`, {
          event,
          data,
        }),
      );
      this.logger.log(`Notificación WebSocket enviada: ${event}`);
    } catch (error) {
      this.logger.warn(`No se pudo enviar notificación WebSocket: ${error.message}`);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }
}
