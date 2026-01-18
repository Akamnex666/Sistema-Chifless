import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * Servicio para validar tokens JWT generados por el Auth-Service.
 *
 * NOTA: Este servicio solo VALIDA tokens. La generación de tokens
 * es responsabilidad exclusiva del Auth-Service (microservicio).
 *
 * Ambos servicios deben compartir el mismo JWT_SECRET.
 */
@Injectable()
export class JwtAuthService {
  private readonly jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('⚠️ JWT_SECRET no configurada. La autenticación fallará.');
    }
    this.jwtSecret = secret || '';
  }

  /**
   * Verifica y decodifica un token JWT.
   * @param token - Token JWT a verificar
   * @returns Payload del token si es válido
   * @throws UnauthorizedException si el token es inválido o expirado
   */
  verifyToken(token: string): JwtPayload {
    if (!this.jwtSecret) {
      throw new UnauthorizedException(
        'JWT_SECRET no configurada en el servidor',
      );
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return payload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          'Token expirado. Por favor, renueve su sesión.',
        );
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token inválido');
      }
      throw new UnauthorizedException('Error al verificar token');
    }
  }
}

/**
 * Estructura del payload JWT del Auth-Service
 */
export interface JwtPayload {
  sub: string; // ID del usuario
  email: string; // Email del usuario
  type: 'access' | 'refresh'; // Tipo de token
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
  jti?: string; // JWT ID (solo en refresh tokens)
}
