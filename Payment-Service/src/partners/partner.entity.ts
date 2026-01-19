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

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text" })
  webhook_url: string;

  @Column({ type: "simple-array", nullable: true })
  events_subscribed: string[];

  @Column({ type: "text", unique: true })
  hmac_secret: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
