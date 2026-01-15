import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Factura } from '../../factura/entities/factura.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  dni: string;

  @Column()
  telefono: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];

  @OneToMany(() => Factura, (factura) => factura.cliente)
  facturas: Factura[];
}
