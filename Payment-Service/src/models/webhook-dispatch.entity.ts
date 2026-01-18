import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Partner } from "../partners/partner.entity";

export enum WebhookStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  RETRY = "retry",
  EXHAUSTED = "exhausted",
}

@Entity("webhook_dispatches")
export class WebhookDispatch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  partner_id: string;

  @ManyToOne(() => Partner, { onDelete: "CASCADE" })
  @JoinColumn({ name: "partner_id" })
  partner: Partner;

  @Column({ type: "varchar", length: 255 })
  event_type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: "jsonb" })
  payload: Record<string, any>;

  @Column({ type: "text" })
  webhook_url: string;

  @Column({ type: "text", nullable: true })
  signature: string;

  @Column({ type: "varchar", length: 50, default: "pending" })
  status: WebhookStatus;

  @Column({ type: "integer", default: 0 })
  attempt_count: number;

  @Column({ type: "integer", default: 3 })
  max_attempts: number;

  @Column({ type: "integer", nullable: true })
  http_status_code: number;

  @Column({ type: "text", nullable: true })
  last_error: string;

  @Column({ type: "timestamp", nullable: true })
  last_attempt_at: Date;

  @Column({ type: "timestamp", nullable: true })
  next_retry_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
