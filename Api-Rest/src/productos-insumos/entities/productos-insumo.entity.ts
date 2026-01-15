import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity()
export class ProductoInsumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  insumoId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad_necesaria: number;

  // Relaciones
  @ManyToOne(() => Producto, (producto) => producto.productosInsumos)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @ManyToOne(() => Insumo, (insumo) => insumo.productosInsumos)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;
}
