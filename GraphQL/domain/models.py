from pydantic import BaseModel
from typing import List, Optional


class Cliente(BaseModel):
    id: int
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str]
    email: Optional[str]


class DetallePedido(BaseModel):
    id: int
    cantidad_solicitada: int
    precio_unitario: float
    subtotal: float
    productoId: int
    pedidoId: int


class Pedido(BaseModel):
    id: int
    fecha: str
    total: float
    estado: str
    clienteId: int
    facturaId: Optional[int]
    detalles: List[DetallePedido] = []


class ProductoInsumo(BaseModel):
    id: int
    productoId: int
    insumoId: int
    cantidad_necesaria: float


class Producto(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    categoria: Optional[str]
    unidad_medida: Optional[str]


class Insumo(BaseModel):
    id: int
    nombre: str
    unidad_medida: str
    stock: int


class DetalleOrdenProduccion(BaseModel):
    id: int
    ordenProduccionId: int
    insumoId: int
    cantidad_utilizada: float


class OrdenProduccion(BaseModel):
    id: int
    fecha_inicio: Optional[str]
    fecha_fin: Optional[str]
    estado: Optional[str]
    productoId: int
    cantidad_producir: int
    detalles: List[DetalleOrdenProduccion] = []


class Factura(BaseModel):
    id: int
    fecha_emision: str
    total: float
    estado_pago: str
    clienteId: int
    pedidoId: int
