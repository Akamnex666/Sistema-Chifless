import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetallePedido } from '../../detalles-pedido/entities/detalles-pedido.entity';
import { ProductoInsumo } from '../../productos-insumos/entities/productos-insumo.entity';
import { OrdenProduccion } from '../../ordenes-produccion/entities/ordenes-produccion.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  categoria: string;

  @Column()
  unidad_medida: string;

  @Column({ default: 'activo' })
  estado: string;

  // Relaciones
  @OneToMany(() => DetallePedido, detalle => detalle.producto)
  detallesPedido: DetallePedido[];

  @OneToMany(() => ProductoInsumo, productoInsumo => productoInsumo.producto)
  productosInsumos: ProductoInsumo[];

  @OneToMany(() => OrdenProduccion, orden => orden.producto)
  ordenesProduccion: OrdenProduccion[];
}