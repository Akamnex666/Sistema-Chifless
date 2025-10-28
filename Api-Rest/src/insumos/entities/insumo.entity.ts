import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoInsumo } from '../../productos-insumos/entities/productos-insumo.entity';
import { DetalleOrdenProduccion } from '../../detalles-orden-produccion/entities/detalles-orden-produccion.entity';

@Entity()
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  unidad_medida: string;

  @Column('int')
  stock: number;

  @Column({ default: 'activo' })
  estado: string;

  // Relaciones
  @OneToMany(() => ProductoInsumo, productoInsumo => productoInsumo.insumo)
  productosInsumos: ProductoInsumo[];

  @OneToMany(() => DetalleOrdenProduccion, detalle => detalle.insumo)
  detallesOrdenProduccion: DetalleOrdenProduccion[];
}