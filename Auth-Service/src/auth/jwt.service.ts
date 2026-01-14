import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  type: 'access' | 'refresh';
  jti?: string;      // token id (para refresh tokens)
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'default-secret');
    this.accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m');
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
  }

  /**
   * Genera un par de tokens (access + refresh)
   */
  generateTokenPair(userId: string, email: string): TokenPair {
    const jti = uuidv4(); // ID único para el refresh token

    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
      jti,
    };

    const accessToken = (jwt as any).sign(accessPayload, this.jwtSecret, {
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = (jwt as any).sign(refreshPayload, this.jwtSecret, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.parseExpiresIn(this.accessExpiresIn),
      refreshExpiresIn: this.parseExpiresIn(this.refreshExpiresIn),
    };
  }

  /**
   * Genera solo un access token
   */
  generateAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    return (jwt as any).sign(payload, this.jwtSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Verifica y decodifica un token
   */
  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.jwtSecret) as JwtPayload;
  }

  /**
   * Decodifica un token sin verificar (para inspección)
   */
  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }

  /**
   * Calcula la fecha de expiración del refresh token
   */
  getRefreshTokenExpiration(): Date {
    const ms = this.parseExpiresIn(this.refreshExpiresIn);
    return new Date(Date.now() + ms);
  }

  /**
   * Convierte string de expiración a milisegundos
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900000; // default 15 minutos

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 900000;
    }
  }
}
