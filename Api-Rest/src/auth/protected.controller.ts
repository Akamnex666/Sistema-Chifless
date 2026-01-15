import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';

/**
 * Controlador para probar la autenticación.
 * 
 * Todos los endpoints están protegidos por el JwtAuthGuard global,
 * excepto los marcados con @Public().
 */
@ApiTags('auth')
@Controller('auth')
export class ProtectedController {
  @Get('test')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint de prueba (protegido)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna mensaje de éxito y datos del usuario',
    schema: {
      example: {
        message: 'Autenticación exitosa',
        user: {
          id: 'uuid-del-usuario',
          email: 'admin@chifles.com',
        },
        timestamp: '2026-01-14T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  testAuth(@Req() req: any) {
    return { 
      message: 'Autenticación exitosa', 
      user: {
        id: req.user.sub,
        email: req.user.email,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check del módulo de auth (público)' })
  @ApiResponse({ status: 200, description: 'El módulo de auth está funcionando' })
  health() {
    return {
      status: 'ok',
      module: 'auth',
      jwtConfigured: !!process.env.JWT_SECRET,
      authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timestamp: new Date().toISOString(),
    };
  }
}
