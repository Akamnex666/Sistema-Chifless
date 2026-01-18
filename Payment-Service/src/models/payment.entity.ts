import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  orderId: string;

  @Column("varchar", { length: 255 })
  transactionId: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column("varchar", { length: 3 })
  currency: string;

  @Column("varchar", { length: 100 })
  status: string; // pending, processing, completed, failed, refunded, cancelled

  @Column("varchar", { length: 50 })
  provider: string; // mock, stripe, etc.

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @Column("varchar", { length: 500, nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
