import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthService, JwtPayload } from './jwt-auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard global de autenticación JWT.
 * 
 * Valida que todas las rutas tengan un token JWT válido en el header Authorization,
 * excepto las marcadas con el decorador @Public().
 * 
 * Los tokens son generados por el Auth-Service y validados aquí usando
 * el mismo JWT_SECRET compartido.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si la ruta o controlador está marcado como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación requerido. Use: Authorization: Bearer <token>'
      );
    }

    const payload: JwtPayload = this.jwtAuthService.verifyToken(token);

    // Validar que sea un access token (no un refresh token)
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException(
        'Se requiere un access token. Los refresh tokens no son válidos para esta operación.'
      );
    }

    // Adjuntar el usuario al request para uso posterior
    req.user = payload;
    return true;
  }

  /**
   * Extrae el token JWT del header Authorization.
   * Soporta múltiples formatos: "Bearer token", "bearer token", "token"
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    
    if (!authHeader) {
      return null;
    }

    // Normalizar a string (en caso de que el framework envíe un array)
    const header = Array.isArray(authHeader) ? authHeader[0] : String(authHeader);
    let token = header.trim();

    // Remover prefijos "Bearer " (case-insensitive)
    while (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7).trim();
    }

    return token || null;
  }
}
