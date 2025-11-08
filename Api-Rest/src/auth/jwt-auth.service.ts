import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthService {
  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException('JWT secret no configurada (set JWT_SECRET)');

    try {
      const payload = jwt.verify(token, secret as string);
      return payload;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  signToken(payload: Record<string, any>, expiresIn = '1h'): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException('JWT secret no configurada (set JWT_SECRET)');
    // Cast to any to avoid typing mismatches with installed @types/jsonwebtoken
    return (jwt as any).sign(payload, secret as string, { expiresIn });
  }

}
