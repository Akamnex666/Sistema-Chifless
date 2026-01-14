import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        id: 'uuid-del-usuario',
        email: 'usuario@chifles.com',
        nombre: 'Juan Pérez',
        activo: true,
        createdAt: '2026-01-13T00:00:00.000Z',
        updatedAt: '2026-01-13T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'Usuario registrado exitosamente',
      user,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        message: 'Login exitoso',
        user: {
          id: 'uuid',
          email: 'admin@chifles.com',
          nombre: 'Administrador',
          activo: true,
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
          accessExpiresIn: 900000,
          refreshExpiresIn: 604800000,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    const result = await this.authService.login(loginDto, userAgent);
    return {
      message: 'Login exitoso',
      ...result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    schema: {
      example: {
        message: 'Token renovado exitosamente',
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 900000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refresh(refreshTokenDto.refreshToken);
    return {
      message: 'Token renovado exitosamente',
      ...result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión (revocar refresh token)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesión cerrada exitosamente',
      },
    },
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario',
    schema: {
      example: {
        id: 'uuid',
        email: 'admin@chifles.com',
        nombre: 'Administrador',
        activo: true,
        createdAt: '2026-01-13T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
  })
  async me(@CurrentUser() user: any) {
    return user;
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token (para otros microservicios)' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          id: 'uuid',
          email: 'admin@chifles.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido',
  })
  async validate(@CurrentUser() user: any) {
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
