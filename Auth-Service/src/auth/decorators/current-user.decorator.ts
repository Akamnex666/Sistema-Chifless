import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obtener el usuario actual del request
 * Uso: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad, retornar solo esa
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
