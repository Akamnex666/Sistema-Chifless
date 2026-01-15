import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { DetalleOrdenProduccion } from '../../detalles-orden-produccion/entities/detalles-orden-produccion.entity';

@Entity()
export class OrdenProduccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fecha_inicio: string;

  @Column()
  fecha_fin: string;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column()
  productoId: number;

  @Column('int')
  cantidad_producir: number;

  // Relaciones
  @ManyToOne(() => Producto, (producto) => producto.ordenesProduccion)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @OneToMany(() => DetalleOrdenProduccion, (detalle) => detalle.ordenProduccion)
  detalles: DetalleOrdenProduccion[];
}
