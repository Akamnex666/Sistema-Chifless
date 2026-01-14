import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService as CustomJwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }

    // Extraer token del header
    let token = authHeader;
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      // Verificar el token
      const payload = this.jwtService.verifyToken(token);

      // Verificar que sea un access token
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Se requiere un access token');
      }

      // Verificar que el usuario exista y esté activo
      const user = await this.authService.findById(payload.sub);
      if (!user || !user.activo) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // Adjuntar usuario al request (sin password)
      const { password: _, ...userWithoutPassword } = user;
      request.user = userWithoutPassword;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
