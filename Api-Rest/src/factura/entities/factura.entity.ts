import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity()
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fecha_emision: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  estado_pago: string;

  @Column()
  clienteId: number;

  @Column()
  pedidoId: number;

  @ManyToOne(() => Cliente, cliente => cliente.facturas)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @OneToOne(() => Pedido, pedido => pedido.factura)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;
}