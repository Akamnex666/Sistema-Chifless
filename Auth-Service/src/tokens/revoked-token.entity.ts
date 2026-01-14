import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  jti: string; // JWT ID del token revocado

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date; // Para limpiar tokens expirados periódicamente

  @Column({ type: 'varchar', length: 50, default: 'logout' })
  reason: string; // 'logout', 'password_change', 'admin_revoke'

  @CreateDateColumn({ name: 'revoked_at' })
  revokedAt: Date;
}
