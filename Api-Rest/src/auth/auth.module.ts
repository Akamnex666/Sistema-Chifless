import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProtectedController } from './protected.controller';
import { AuthController } from './auth.controller';

/**
 * Módulo de Autenticación del API REST.
 *
 * Este módulo proporciona:
 * - JwtAuthGuard: Guard global para proteger endpoints
 * - JwtAuthService: Servicio para validar tokens JWT
 * - CurrentUser: Decorador para obtener el usuario del request
 * - Public: Decorador para marcar rutas como públicas
 *
 * NOTA: La autenticación real (login, registro, etc.) se maneja
 * en el microservicio Auth-Service (puerto 3001).
 *
 * Ambos servicios comparten el mismo JWT_SECRET para que los tokens
 * generados por Auth-Service sean válidos en este API REST.
 */
@Module({
  providers: [JwtAuthService, JwtAuthGuard],
  controllers: [ProtectedController, AuthController],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class AuthModule {}
