import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';

/**
 * Controlador de autenticación del API REST.
 * 
 * Este controlador proporciona:
 * - Información sobre el Auth-Service (público)
 * - Endpoint para verificar el usuario actual (protegido)
 * 
 * La autenticación real (login, registro, etc.) se maneja
 * en el microservicio Auth-Service.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('info')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Información del Auth Service (público)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna información sobre cómo autenticarse',
    schema: {
      example: {
        message: 'Para autenticación, use el Auth Service',
        authService: {
          url: 'http://localhost:3001',
          swagger: 'http://localhost:3001/docs',
          endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            refresh: 'POST /api/auth/refresh',
            logout: 'POST /api/auth/logout',
            me: 'GET /api/auth/me',
          },
        },
        nota: 'Use el token obtenido del Auth-Service en el header Authorization: Bearer <token>',
      },
    },
  })
  info() {
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    return {
      message: 'Para autenticación, use el Auth Service',
      authService: {
        url: authUrl,
        swagger: `${authUrl}/docs`,
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me',
          validate: 'GET /api/auth/validate',
        },
      },
      nota: 'Use el token obtenido del Auth-Service en el header Authorization: Bearer <token>',
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna los datos del usuario del token JWT',
    schema: {
      example: {
        sub: 'uuid-del-usuario',
        email: 'admin@chifles.com',
        type: 'access',
        iat: 1704067200,
        exp: 1704068100,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  me(@Req() req: any) {
    return {
      userId: req.user.sub,
      email: req.user.email,
      tokenType: req.user.type,
      issuedAt: new Date(req.user.iat * 1000).toISOString(),
      expiresAt: new Date(req.user.exp * 1000).toISOString(),
    };
  }
}
