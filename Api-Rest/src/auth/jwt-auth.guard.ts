import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthService } from './jwt-auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // If route or controller is marked as @Public(), skip auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const raw = req.headers['authorization'] || req.headers['Authorization'];
    if (!raw) throw new UnauthorizedException('No se envió Authorization header');

    // Normalize header to a single string (in case framework provides array)
    const header = Array.isArray(raw) ? raw[0] : String(raw);
    let token = header.trim();

    // Remove any number of leading 'Bearer ' prefixes (case-insensitive)
    while (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) throw new UnauthorizedException('Formato inválido de Authorization');

    const payload = this.jwtAuthService.verifyToken(token);

    // Validar que sea un access token del Auth-Service
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Se requiere un access token');
    }

    req.user = payload;
    return true;
  }
}
