from typing import List, Dict, Any
from domain.models import Pedido, Cliente, Producto, ProductoInsumo, Insumo, OrdenProduccion


class ReportService:
    def __init__(self, rest):
        # rest is an instance of infrastructure.http_client.RESTClient
        self.rest = rest

    async def pedidos_por_cliente(self, clienteId: int, fechaInicio: str = None, fechaFin: str = None) -> List[Dict[str, Any]]:
        params = {}
        if fechaInicio: params['fechaInicio'] = fechaInicio
        if fechaFin: params['fechaFin'] = fechaFin
        data = await self.rest.get(f'/pedidos', params={**params, 'clienteId': clienteId})
        return data

    async def consumo_insumos(self, fechaInicio: str = None, fechaFin: str = None) -> List[Dict[str, Any]]:
        # Strategy: fetch ordenes-produccion and aggregate detalle ordenes
        params = {}
        if fechaInicio: params['fechaInicio'] = fechaInicio
        if fechaFin: params['fechaFin'] = fechaFin
        ordenes = await self.rest.get('/ordenes-produccion', params=params)
        usage = {}
        for orden in ordenes:
            detalles = orden.get('detalles', [])
            for d in detalles:
                insumoId = d['insumoId']
                cantidad = float(d.get('cantidad_utilizada', 0))
                if insumoId not in usage:
                    usage[insumoId] = {'insumoId': insumoId, 'cantidadTotal': 0}
                usage[insumoId]['cantidadTotal'] += cantidad
        # Enriquecer con nombre y unidad
        results = []
        for insumoId, item in usage.items():
            ins = await self.rest.get(f'/insumos/{insumoId}')
            item['insumoNombre'] = ins.get('nombre')
            item['unidad'] = ins.get('unidad_medida')
            results.append(item)
        return results

    async def productos_mas_vendidos(self, limite: int = 10) -> List[Dict[str, Any]]:
        # Strategy: aggregate from pedidos -> detalles
        pedidos = await self.rest.get('/pedidos')
        counts = {}
        for p in pedidos:
            for d in p.get('detalles', []):
                pid = d['productoId']
                counts.setdefault(pid, 0)
                counts[pid] += int(d.get('cantidad_solicitada', 0))
        items = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limite]
        results = []
        for pid, qty in items:
            prod = await self.rest.get(f'/productos/{pid}')
            results.append({'productId': pid, 'productName': prod.get('nombre'), 'totalSold': qty})
        return results

    async def trazabilidad_pedido(self, pedidoId: int) -> Dict[str, Any]:
        pedido = await self.rest.get(f'/pedidos/{pedidoId}')
        trace = []
        for det in pedido.get('detalles', []):
            producto = await self.rest.get(f"/productos/{det['productoId']}")
            # obtener receta
            productos_insumo = await self.rest.get(f"/productos-insumos", params={'productoId': det['productoId']})
            receta = []
            for ri in productos_insumo:
                ins = await self.rest.get(f"/insumos/{ri['insumoId']}")
                receta.append({
                    'insumoId': ri['insumoId'],
                    'insumoNombre': ins.get('nombre'),
                    'cantidadNecesaria': float(ri.get('cantidad_necesaria', 0)),
                    'unidadMedida': ins.get('unidad_medida')
                })
            trace.append({
                'productoId': producto.get('id'),
                'nombre': producto.get('nombre'),
                'cantidadSolicitada': det.get('cantidad_solicitada'),
                'receta': receta
            })
        return {'pedidoId': pedidoId, 'productos': trace}

    async def reporte_produccion(self, fechaInicio: str = None, fechaFin: str = None) -> Dict[str, Any]:
        """Genera reporte de producción con estadísticas de órdenes."""
        params = {}
        if fechaInicio:
            params['fechaInicio'] = fechaInicio
        if fechaFin:
            params['fechaFin'] = fechaFin
        
        ordenes = await self.rest.get('/ordenes-produccion', params=params)
        
        # Contar estados
        completadas = sum(1 for o in ordenes if o.get('estado', '').lower() in ['completada', 'completado', 'finalizada'])
        pendientes = sum(1 for o in ordenes if o.get('estado', '').lower() in ['pendiente', 'nuevo'])
        en_proceso = sum(1 for o in ordenes if o.get('estado', '').lower() in ['en_proceso', 'en proceso', 'procesando'])
        
        # Agregar producción por producto
        produccion = {}
        for orden in ordenes:
            for detalle in orden.get('detalles', []):
                prod_id = detalle.get('productoId')
                if prod_id:
                    if prod_id not in produccion:
                        produccion[prod_id] = {'productoId': prod_id, 'cantidadProducida': 0}
                    produccion[prod_id]['cantidadProducida'] += int(detalle.get('cantidad_producida', 0))
        
        # Enriquecer con nombres de productos
        produccion_lista = []
        for prod_id, item in produccion.items():
            try:
                prod = await self.rest.get(f'/productos/{prod_id}')
                item['productoNombre'] = prod.get('nombre')
            except:
                item['productoNombre'] = None
            produccion_lista.append(item)
        
        return {
            'totalOrdenesProduccion': len(ordenes),
            'ordenesCompletadas': completadas,
            'ordenesPendientes': pendientes,
            'ordenesEnProceso': en_proceso,
            'produccionPorProducto': produccion_lista
        }

    async def reporte_inventario(self) -> Dict[str, Any]:
        """Genera reporte de inventario de productos e insumos."""
        productos = await self.rest.get('/productos')
        insumos = await self.rest.get('/insumos')
        
        productos_lista = [
            {
                'id': p.get('id'),
                'nombre': p.get('nombre', ''),
                'stock': float(p.get('stock', 0)),
                'precioVenta': float(p.get('precio_venta', p.get('precioVenta', 0)))
            }
            for p in productos
        ]
        
        insumos_lista = [
            {
                'id': i.get('id'),
                'nombre': i.get('nombre', ''),
                'stock': float(i.get('stock', 0)),
                'unidadMedida': i.get('unidad_medida', i.get('unidadMedida')),
                'stockMinimo': float(i.get('stock_minimo', i.get('stockMinimo', 0)))
            }
            for i in insumos
        ]
        
        return {
            'totalProductos': len(productos),
            'totalInsumos': len(insumos),
            'productos': productos_lista,
            'insumos': insumos_lista
        }

    async def reporte_ventas(self, fechaInicio: str = None, fechaFin: str = None) -> Dict[str, Any]:
        """Genera reporte de ventas con estadísticas de pedidos."""
        params = {}
        if fechaInicio:
            params['fechaInicio'] = fechaInicio
        if fechaFin:
            params['fechaFin'] = fechaFin
        
        pedidos = await self.rest.get('/pedidos', params=params)
        
        # Calcular totales
        total_ventas = sum(float(p.get('total', 0)) for p in pedidos)
        completados = sum(1 for p in pedidos if p.get('estado', '').lower() in ['completado', 'entregado', 'pagado'])
        pendientes = sum(1 for p in pedidos if p.get('estado', '').lower() in ['pendiente', 'nuevo', 'en_proceso'])
        
        # Agregar ventas por producto
        ventas = {}
        for pedido in pedidos:
            for detalle in pedido.get('detalles', []):
                prod_id = detalle.get('productoId')
                if prod_id:
                    cantidad = int(detalle.get('cantidad_solicitada', 0))
                    subtotal = float(detalle.get('subtotal', 0))
                    if prod_id not in ventas:
                        ventas[prod_id] = {'productoId': prod_id, 'cantidadVendida': 0, 'totalVendido': 0}
                    ventas[prod_id]['cantidadVendida'] += cantidad
                    ventas[prod_id]['totalVendido'] += subtotal
        
        # Enriquecer con nombres de productos
        ventas_lista = []
        for prod_id, item in ventas.items():
            try:
                prod = await self.rest.get(f'/productos/{prod_id}')
                item['productoNombre'] = prod.get('nombre')
            except:
                item['productoNombre'] = None
            ventas_lista.append(item)
        
        # Ordenar por cantidad vendida
        ventas_lista.sort(key=lambda x: x['cantidadVendida'], reverse=True)
        
        return {
            'totalVentas': total_ventas,
            'totalPedidos': len(pedidos),
            'pedidosCompletados': completados,
            'pedidosPendientes': pendientes,
            'ventasPorProducto': ventas_lista
        }
