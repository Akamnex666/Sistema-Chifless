import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-auth.service';

/**
 * Decorador para obtener el usuario autenticado desde el request.
 * 
 * Uso:
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return { userId: user.sub, email: user.email };
 * }
 * ```
 * 
 * También se puede obtener una propiedad específica:
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
