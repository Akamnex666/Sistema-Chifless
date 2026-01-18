import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("partners")
export class Partner {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  name: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  webhookUrl: string;

  @Column("text")
  webhookSecret: string;

  @Column("boolean", { default: true })
  isActive: boolean;

  @Column("integer", { default: 0 })
  retryAttempts: number;

  @Column("integer", { default: 3 })
  maxRetryAttempts: number;

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
