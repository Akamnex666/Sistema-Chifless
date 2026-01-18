import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity()
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidad_solicitada: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_unitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column()
  productoId: number;

  @Column()
  pedidoId: number;

  // Relaciones
  @ManyToOne(() => Producto, (producto) => producto.detallesPedido)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;
}
