/**
 * Módulo de Autenticación - Exports públicos
 *
 * Uso:
 * ```typescript
 * import { Public, CurrentUser, JwtPayload } from './auth';
 * ```
 */

export { AuthModule } from './auth.module';
export { JwtAuthGuard } from './jwt-auth.guard';
export { JwtAuthService } from './jwt-auth.service';
export type { JwtPayload } from './jwt-auth.service';
export { Public, IS_PUBLIC_KEY } from './public.decorator';
export { CurrentUser } from './current-user.decorator';
