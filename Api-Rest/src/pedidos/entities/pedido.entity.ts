import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Factura } from '../../factura/entities/factura.entity';
import { DetallePedido } from '../../detalles-pedido/entities/detalles-pedido.entity';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fecha: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  estado: string;

  @Column()
  clienteId: number;

  @Column({ nullable: true })
  facturaId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @OneToOne(() => Factura, (factura) => factura.pedido)
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  // IMPORTANTE: cascade para poder guardar detalles junto al pedido
  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
    eager: true,
  })
  detalles: DetallePedido[];
}
