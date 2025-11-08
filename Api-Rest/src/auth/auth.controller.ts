import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { JwtAuthService } from './jwt-auth.service';
import { Public } from './public.decorator';
import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @ApiProperty({ example: 'dev@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'cualquier-cosa' })
  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login y obtención de JWT (dev only)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Retorna access_token' })
  login(@Body() body: LoginDto) {
    // Dev-only: no validation against DB. In production validate credentials.
    const payload = { sub: body.email, email: body.email };
    const token = this.jwtAuthService.signToken(payload, '1h');
    return { access_token: token };
  }
}
