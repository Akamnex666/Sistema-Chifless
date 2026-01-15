import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrdenProduccion } from '../../ordenes-produccion/entities/ordenes-produccion.entity';
import { Insumo } from '../../insumos/entities/insumo.entity';

@Entity()
export class DetalleOrdenProduccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ordenProduccionId: number;

  @Column()
  insumoId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad_utilizada: number;

  // Relaciones
  @ManyToOne(() => OrdenProduccion, (orden) => orden.detalles)
  @JoinColumn({ name: 'ordenProduccionId' })
  ordenProduccion: OrdenProduccion;

  @ManyToOne(() => Insumo, (insumo) => insumo.detallesOrdenProduccion)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;
}
