import strawberry
from typing import List, Optional
from application.usecases import ReportService
from interface.graphql.types import (
    PedidoResumen,
    ConsumoInsumo,
    TrazabilidadProducto,
    InsumoReceta,
    ProductoMasVendido,
    ReporteProduccion,
    ProduccionProducto,
    ReporteInventario,
    ProductoInventario,
    InsumoInventario,
    ReporteVentas,
    VentaProducto,
)
from graphql import GraphQLError
import httpx


@strawberry.type
class Query:
    @strawberry.field
    async def pedidosPorCliente(self, info, clienteId: int, fechaInicio: Optional[str] = None, fechaFin: Optional[str] = None) -> List[PedidoResumen]:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.pedidos_por_cliente(clienteId, fechaInicio, fechaFin)
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar pedidos por cliente: {e.response.status_code} {e.response.text}")

        return [PedidoResumen(id=int(p['id']), fecha=p['fecha'], total=float(p['total']), estado=p['estado']) for p in data]

    @strawberry.field
    async def consumoInsumos(self, info, fechaInicio: Optional[str] = None, fechaFin: Optional[str] = None) -> List[ConsumoInsumo]:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.consumo_insumos(fechaInicio, fechaFin)
        except httpx.HTTPStatusError as e:
            # convierte errores HTTP en error GraphQL legible
            raise GraphQLError(f"Error al recuperar consumo de insumos: {e.response.status_code} {e.response.text}")

        return [
            ConsumoInsumo(
                insumoId=int(d['insumoId']),
                insumoNombre=d.get('insumoNombre'),
                cantidadTotal=float(d.get('cantidadTotal', 0)),
                unidad=d.get('unidad'),
            )
            for d in data
        ]

    @strawberry.field
    async def productosMasVendidos(self, info, limite: int = 10) -> List[ProductoMasVendido]:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.productos_mas_vendidos(limite)
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar productos más vendidos: {e.response.status_code} {e.response.text}")

        result: List[ProductoMasVendido] = []
        for item in data:
            result.append(
                ProductoMasVendido(
                    productoId=int(item.get('productId')),
                    productoNombre=item.get('productName'),
                    cantidadVendida=int(item.get('totalSold', 0)),
                )
            )
        return result

    @strawberry.field
    async def trazabilidadPedido(self, info, pedidoId: int) -> List[TrazabilidadProducto]:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.trazabilidad_pedido(pedidoId)
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar trazabilidad del pedido: {e.response.status_code} {e.response.text}")
        res = []
        for p in data.get('productos', []):
            receta_objs = []
            for r in p.get('receta', []):
                receta_objs.append(
                    InsumoReceta(
                        insumoId=int(r['insumoId']),
                        insumoNombre=r.get('insumoNombre'),
                        cantidadNecesaria=float(r.get('cantidadNecesaria', 0)),
                        unidadMedida=r.get('unidadMedida'),
                    )
                )
            res.append(
                TrazabilidadProducto(
                    productoId=int(p['productoId']),
                    nombre=p.get('nombre'),
                    cantidadSolicitada=int(p.get('cantidadSolicitada', 0)),
                    receta=receta_objs,
                )
            )
        return res

    @strawberry.field
    async def reporteProduccion(self, info, fechaInicio: Optional[str] = None, fechaFin: Optional[str] = None) -> ReporteProduccion:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.reporte_produccion(fechaInicio, fechaFin)
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar reporte de producción: {e.response.status_code} {e.response.text}")
        
        produccion_por_producto = [
            ProduccionProducto(
                productoId=int(p['productoId']),
                productoNombre=p.get('productoNombre'),
                cantidadProducida=int(p.get('cantidadProducida', 0))
            )
            for p in data.get('produccionPorProducto', [])
        ]
        
        return ReporteProduccion(
            totalOrdenesProduccion=int(data.get('totalOrdenesProduccion', 0)),
            ordenesCompletadas=int(data.get('ordenesCompletadas', 0)),
            ordenesPendientes=int(data.get('ordenesPendientes', 0)),
            ordenesEnProceso=int(data.get('ordenesEnProceso', 0)),
            produccionPorProducto=produccion_por_producto
        )

    @strawberry.field
    async def reporteInventario(self, info) -> ReporteInventario:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.reporte_inventario()
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar reporte de inventario: {e.response.status_code} {e.response.text}")
        
        productos = [
            ProductoInventario(
                id=int(p['id']),
                nombre=p.get('nombre', ''),
                stock=float(p.get('stock', 0)),
                precioVenta=float(p.get('precioVenta', 0))
            )
            for p in data.get('productos', [])
        ]
        
        insumos = [
            InsumoInventario(
                id=int(i['id']),
                nombre=i.get('nombre', ''),
                stock=float(i.get('stock', 0)),
                unidadMedida=i.get('unidadMedida'),
                stockMinimo=float(i.get('stockMinimo', 0))
            )
            for i in data.get('insumos', [])
        ]
        
        return ReporteInventario(
            totalProductos=int(data.get('totalProductos', 0)),
            totalInsumos=int(data.get('totalInsumos', 0)),
            productos=productos,
            insumos=insumos
        )

    @strawberry.field
    async def reporteVentas(self, info, fechaInicio: Optional[str] = None, fechaFin: Optional[str] = None) -> ReporteVentas:
        rest = info.context['rest']
        svc = ReportService(rest)
        try:
            data = await svc.reporte_ventas(fechaInicio, fechaFin)
        except httpx.HTTPStatusError as e:
            raise GraphQLError(f"Error al recuperar reporte de ventas: {e.response.status_code} {e.response.text}")
        
        ventas_por_producto = [
            VentaProducto(
                productoId=int(v['productoId']),
                productoNombre=v.get('productoNombre'),
                cantidadVendida=int(v.get('cantidadVendida', 0)),
                totalVendido=float(v.get('totalVendido', 0))
            )
            for v in data.get('ventasPorProducto', [])
        ]
        
        return ReporteVentas(
            totalVentas=float(data.get('totalVentas', 0)),
            totalPedidos=int(data.get('totalPedidos', 0)),
            pedidosCompletados=int(data.get('pedidosCompletados', 0)),
            pedidosPendientes=int(data.get('pedidosPendientes', 0)),
            ventasPorProducto=ventas_por_producto
        )
