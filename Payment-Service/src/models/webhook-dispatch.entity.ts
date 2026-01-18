import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Partner } from "./partner.entity";

@Entity("webhook_dispatches")
export class WebhookDispatch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  partnerId: string;

  @ManyToOne(() => Partner)
  partner: Partner;

  @Column("varchar", { length: 255 })
  eventType: string;

  @Column("varchar", { length: 255 })
  transactionId: string;

  @Column("jsonb")
  payload: Record<string, any>;

  @Column("varchar", { length: 50 })
  status: string; // pending, sent, failed, retrying, exhausted

  @Column("integer", { default: 0 })
  attemptCount: number;

  @Column("text", { nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column("timestamp", { nullable: true })
  nextRetryAt: Date;
}
