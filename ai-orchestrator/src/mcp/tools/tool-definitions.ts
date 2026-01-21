/**
 * Definición de las herramientas MCP disponibles para el LLM
 * Estas herramientas permiten al asistente interactuar con el sistema
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const MCP_TOOLS: ToolDefinition[] = [
  {
    name: 'consultar_productos',
    description: 'Obtiene la lista completa de chifles/productos disponibles con sus precios. Usa esta herramienta cuando el usuario quiera saber qué productos hay disponibles o consultar precios.',
    parameters: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          description: 'Categoría de productos a filtrar (opcional). Ej: "sal", "dulce", "picante"',
        },
      },
      required: [],
    },
  },
  {
    name: 'estado_pedido',
    description: 'Consulta el estado actual de un pedido específico dado su número. Devuelve información como estado, cliente, productos y total.',
    parameters: {
      type: 'object',
      properties: {
        pedido_id: {
          type: 'number',
          description: 'Número del pedido a consultar',
        },
      },
      required: ['pedido_id'],
    },
  },
  {
    name: 'listar_pedidos',
    description: 'Obtiene la lista de todos los pedidos del sistema. Usa esta herramienta cuando el usuario quiera ver pedidos, el historial de pedidos, o preguntar por "mis pedidos". IMPORTANTE: No requiere parámetros - llámala sin argumentos para obtener todos los pedidos.',
    parameters: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          description: 'Filtrar por estado del pedido (opcional)',
          enum: ['pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado'],
        },
      },
      required: [],
    },
  },
  {
    name: 'crear_pedido',
    description: 'Crea un nuevo pedido con los productos especificados. Usa esta herramienta cuando el usuario quiera hacer un pedido o cuando hayas extraído productos de una imagen/documento.',
    parameters: {
      type: 'object',
      properties: {
        cliente_id: {
          type: 'number',
          description: 'ID del cliente que realiza el pedido',
        },
        detalles: {
          type: 'array',
          description: 'Lista de productos con sus cantidades',
          items: {
            type: 'object',
            properties: {
              producto_id: {
                type: 'number',
                description: 'ID del producto',
              },
              cantidad: {
                type: 'number',
                description: 'Cantidad del producto',
              },
            },
            required: ['producto_id', 'cantidad'],
          },
        },
        notas: {
          type: 'string',
          description: 'Notas adicionales para el pedido (opcional)',
        },
      },
      required: ['cliente_id', 'detalles'],
    },
  },
  {
    name: 'registrar_cliente',
    description: 'Registra un nuevo cliente en el sistema. Usa esta herramienta cuando un nuevo cliente quiera registrarse o cuando necesites crear un cliente para un pedido.',
    parameters: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre completo del cliente',
        },
        email: {
          type: 'string',
          description: 'Correo electrónico del cliente',
        },
        telefono: {
          type: 'string',
          description: 'Número de teléfono del cliente',
        },
        direccion: {
          type: 'string',
          description: 'Dirección de entrega del cliente',
        },
      },
      required: ['nombre', 'email'],
    },
  },
  {
    name: 'analisis_ventas',
    description: 'Genera un resumen y análisis de las ventas. Puede filtrar por período de tiempo. Útil para reportes y estadísticas del negocio.',
    parameters: {
      type: 'object',
      properties: {
        fecha_inicio: {
          type: 'string',
          description: 'Fecha de inicio del período (formato: YYYY-MM-DD)',
        },
        fecha_fin: {
          type: 'string',
          description: 'Fecha de fin del período (formato: YYYY-MM-DD)',
        },
        tipo_reporte: {
          type: 'string',
          description: 'Tipo de reporte: "resumen", "detallado", "por_producto", "por_cliente"',
          enum: ['resumen', 'detallado', 'por_producto', 'por_cliente'],
        },
      },
      required: [],
    },
  },
];

/**
 * Obtiene las definiciones de herramientas en formato para Gemini
 */
export function getToolsForGemini(): any[] {
  return MCP_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}

/**
 * Obtiene las definiciones de herramientas en formato para OpenAI
 */
export function getToolsForOpenAI(): any[] {
  return MCP_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}
