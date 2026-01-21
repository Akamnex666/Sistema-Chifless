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
    this.logger.log(`API Base URL: ${this.apiBaseUrl}`);
    this.logger.log(`WebSocket URL: ${this.wsServerUrl}`);
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
        case 'listar_pedidos':
          return await this.listarPedidos(toolCall.args);
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
  private async consultarProductos(args?: Record<string, any>): Promise<ToolResult> {
    try {
      const url = `${this.apiBaseUrl}/productos`;
      this.logger.debug(`Consultando productos en: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url),
      );

      let productos = response.data;

      // Filtrar por categoría si se especifica (verificando que args exista)
      if (args && args.categoria) {
        productos = productos.filter((p: any) =>
          p.nombre?.toLowerCase().includes(args.categoria.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(args.categoria.toLowerCase()),
        );
      }

      // Agrupar productos por categoría para mejor presentación
      const productosPorCategoria = productos.reduce((acc: any, p: any) => {
        const categoria = p.categoria || 'Otros';
        if (!acc[categoria]) acc[categoria] = [];
        acc[categoria].push({
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: `$${parseFloat(p.precio).toFixed(2)}`,
          presentacion: p.unidad_medida || 'unidad',
          disponible: p.estado === 'activo',
        });
        return acc;
      }, {});

      return {
        success: true,
        data: {
          mensaje: `Tenemos ${productos.length} productos disponibles`,
          categorias: Object.keys(productosPorCategoria),
          catalogo: productosPorCategoria,
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
      return { success: false, error: 'Por favor proporciona el número de pedido para consultarlo' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/pedidos/${args.pedido_id}`),
      );

      const pedido = response.data;
      const fecha = new Date(pedido.fecha || pedido.createdAt);
      const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      return {
        success: true,
        data: {
          numero_pedido: `#${pedido.id}`,
          estado: pedido.estado,
          fecha: fechaFormateada,
          cliente: pedido.cliente?.nombre || 'Cliente',
          total: pedido.total ? `$${parseFloat(pedido.total).toFixed(2)}` : 'Por calcular',
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, error: `No encontramos ningún pedido con ese número. ¿Podrías verificarlo?` };
      }
      throw new Error(`Error al consultar pedido: ${error.message}`);
    }
  }

  /**
   * Herramienta 2.5: Listar Pedidos
   * GET /pedidos
   */
  private async listarPedidos(args?: Record<string, any>): Promise<ToolResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/pedidos`),
      );

      const pedidos = response.data;

      if (!pedidos || pedidos.length === 0) {
        return {
          success: true,
          data: {
            mensaje: 'No hay pedidos registrados todavía',
            pedidos: [],
          },
        };
      }

      // Filtrar por cliente si se proporciona
      let pedidosFiltrados = pedidos;
      if (args?.cliente_id) {
        pedidosFiltrados = pedidos.filter((p: any) => p.clienteId === args.cliente_id || p.cliente?.id === args.cliente_id);
      }

      // Filtrar por estado si se proporciona
      if (args?.estado) {
        pedidosFiltrados = pedidosFiltrados.filter((p: any) => p.estado === args.estado);
      }

      // Formatear pedidos de forma amigable
      const pedidosFormateados = pedidosFiltrados.map((pedido: any) => {
        const fecha = new Date(pedido.fecha || pedido.createdAt);
        return {
          numero: `#${pedido.id}`,
          estado: this.formatearEstado(pedido.estado),
          fecha: fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          cliente: pedido.cliente?.nombre || 'Cliente',
          total: pedido.total ? `$${parseFloat(pedido.total).toFixed(2)}` : 'Por calcular',
        };
      });

      return {
        success: true,
        data: {
          mensaje: `Encontramos ${pedidosFormateados.length} pedido(s)`,
          pedidos: pedidosFormateados,
        },
      };
    } catch (error) {
      this.logger.error(`Error al listar pedidos: ${error.message}`);
      throw new Error(`Error al listar pedidos: ${error.message}`);
    }
  }

  private formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      'pendiente': '⏳ Pendiente',
      'en_proceso': '🔄 En proceso',
      'listo': '✅ Listo para entrega',
      'entregado': '📦 Entregado',
      'cancelado': '❌ Cancelado',
    };
    return estados[estado] || estado;
  }

  /**
   * Herramienta 3: Crear Pedido
   * POST /pedidos
   */
  private async crearPedido(args: Record<string, any>): Promise<ToolResult> {
    if (!args.cliente_id || !args.detalles || args.detalles.length === 0) {
      return {
        success: false,
        error: 'Para crear un pedido necesito saber quién es el cliente y qué productos desea',
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
          mensaje: '¡Pedido creado exitosamente! 🎉',
          numero_pedido: `#${pedido.id}`,
          estado: 'Pendiente de procesamiento',
          total: pedido.total ? `$${parseFloat(pedido.total).toFixed(2)}` : 'Por calcular',
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
        error: 'Para registrar un nuevo cliente necesito al menos su nombre y correo electrónico',
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
          mensaje: `¡Cliente registrado exitosamente! 🎉`,
          nombre: cliente.nombre,
          email: cliente.email,
          bienvenida: `Bienvenido/a ${cliente.nombre} a Chifles Deliciosos`,
        },
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return { success: false, error: 'Ya existe un cliente registrado con ese correo electrónico' };
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
