import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('info')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Información del Auth Service' })
  @ApiResponse({ status: 200, description: 'Retorna información del Auth Service' })
  info() {
    return {
      message: 'Para autenticación, use el Auth Service',
      authService: {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me',
          validate: 'GET /api/auth/validate',
        },
      },
    };
  }
}
