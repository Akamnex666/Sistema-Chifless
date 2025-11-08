import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProtectedController } from './protected.controller';
import { AuthController } from './auth.controller';

@Module({
  providers: [JwtAuthService, JwtAuthGuard],
  controllers: [ProtectedController, AuthController],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class AuthModule {}
