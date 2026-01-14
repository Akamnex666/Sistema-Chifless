import strawberry
from typing import List, Optional


@strawberry.type
class InsumoReceta:
    insumoId: int
    insumoNombre: Optional[str]
    cantidadNecesaria: float
    unidadMedida: Optional[str]


@strawberry.type
class TrazabilidadProducto:
    productoId: int
    nombre: Optional[str]
    cantidadSolicitada: int
    receta: List[InsumoReceta]


@strawberry.type
class ConsumoInsumo:
    insumoId: int
    insumoNombre: Optional[str]
    cantidadTotal: float
    unidad: Optional[str]


@strawberry.type
class PedidoResumen:
    id: int
    fecha: str
    total: float
    estado: str


@strawberry.type
class ProductoMasVendido:
    productoId: int
    productoNombre: Optional[str]
    cantidadVendida: int


# ============ TIPOS PARA REPORTES ============

@strawberry.type
class ReporteProduccion:
    totalOrdenesProduccion: int
    ordenesCompletadas: int
    ordenesPendientes: int
    ordenesEnProceso: int
    produccionPorProducto: List["ProduccionProducto"]
    insumosMasUtilizados: List["InsumoUtilizado"]
    produccionPorDia: List["ProduccionDiaria"]


@strawberry.type
class ProduccionProducto:
    productoId: int
    productoNombre: Optional[str]
    cantidadProducida: int


@strawberry.type
class InsumoUtilizado:
    idInsumo: int
    nombre: str
    cantidadUtilizada: float


@strawberry.type
class ProduccionDiaria:
    fecha: str
    cantidadOrdenes: int


@strawberry.type
class ReporteInventario:
    totalProductos: int
    totalInsumos: int
    productos: List["ProductoInventario"]
    insumos: List["InsumoInventario"]
    insumosStockBajo: List["InsumoInventario"]
    valorInventario: float


@strawberry.type
class ProductoInventario:
    id: int
    nombre: str
    stock: float
    precioVenta: float


@strawberry.type
class InsumoInventario:
    id: int
    nombre: str
    stock: float
    unidadMedida: Optional[str]
    stockMinimo: float
    precioUnitario: Optional[float] = 0.0


@strawberry.type
class ReporteVentas:
    totalVentas: float
    totalPedidos: int
    cantidadPedidos: int
    pedidosCompletados: int
    pedidosPendientes: int
    ventasPorProducto: List["VentaProducto"]
    productosMasVendidos: List["ProductoVendidoReporte"]
    ventasPorDia: List["VentaDiaria"]


@strawberry.type
class VentaProducto:
    productoId: int
    productoNombre: Optional[str]
    cantidadVendida: int
    totalVendido: float


@strawberry.type
class ProductoVendidoReporte:
    idProducto: int
    nombre: str
    cantidadVendida: int
    totalVendido: float


@strawberry.type
class VentaDiaria:
    fecha: str
    total: float
    cantidad: int
