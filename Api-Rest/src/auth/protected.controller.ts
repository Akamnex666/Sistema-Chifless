import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class ProtectedController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProtected(@Req() req: any) {
    return { message: 'Acceso permitido', user: req.user };
  }
}
