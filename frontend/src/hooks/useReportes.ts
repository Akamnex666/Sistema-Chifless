import { useQuery } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import graphqlClient from '@/services/graphql';
import { ReporteVentas, ReporteProduccion, ReporteInventario } from '@/types';

// Queries GraphQL
const GET_REPORTE_VENTAS = gql`
  query GetReporteVentas($fechaInicio: String, $fechaFin: String) {
    reporteVentas(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      totalVentas
      cantidadPedidos
      totalPedidos
      pedidosCompletados
      pedidosPendientes
      ventasPorDia {
        fecha
        total
        cantidad
      }
      productosMasVendidos {
        idProducto
        nombre
        cantidadVendida
        totalVendido
      }
    }
  }
`;

const GET_REPORTE_PRODUCCION = gql`
  query GetReporteProduccion($fechaInicio: String, $fechaFin: String) {
    reporteProduccion(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      totalOrdenesProduccion
      ordenesCompletadas
      ordenesPendientes
      ordenesEnProceso
      insumosMasUtilizados {
        idInsumo
        nombre
        cantidadUtilizada
      }
      produccionPorDia {
        fecha
        cantidadOrdenes
      }
    }
  }
`;

const GET_REPORTE_INVENTARIO = gql`
  query GetReporteInventario {
    reporteInventario {
      totalProductos
      totalInsumos
      valorInventario
      insumosStockBajo {
        id
        nombre
        unidadMedida
        stock
        stockMinimo
        precioUnitario
      }
      productos {
        id
        nombre
        stock
        precioVenta
      }
      insumos {
        id
        nombre
        stock
        unidadMedida
        stockMinimo
      }
    }
  }
`;

export function useReporteVentas(fechaInicio?: string, fechaFin?: string) {
  return useQuery<ReporteVentas>({
    queryKey: ['reporte-ventas', fechaInicio, fechaFin],
    queryFn: async () => {
      const { data } = await graphqlClient.query({
        query: GET_REPORTE_VENTAS,
        variables: { fechaInicio, fechaFin },
        fetchPolicy: 'network-only',
      });
      return (data as any).reporteVentas;
    },
  });
}

export function useReporteProduccion(fechaInicio?: string, fechaFin?: string) {
  return useQuery<ReporteProduccion>({
    queryKey: ['reporte-produccion', fechaInicio, fechaFin],
    queryFn: async () => {
      const { data } = await graphqlClient.query({
        query: GET_REPORTE_PRODUCCION,
        variables: { fechaInicio, fechaFin },
        fetchPolicy: 'network-only',
      });
      return (data as any).reporteProduccion;
    },
  });
}

export function useReporteInventario() {
  return useQuery<ReporteInventario>({
    queryKey: ['reporte-inventario'],
    queryFn: async () => {
      const { data } = await graphqlClient.query({
        query: GET_REPORTE_INVENTARIO,
        fetchPolicy: 'network-only',
      });
      return (data as any).reporteInventario;
    },
  });
}
