import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Extends Passport JWT guard with custom error handling
 * Returns 401 Unauthorized if token is missing or invalid
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('[JwtAuthGuard] Authorization Header:', authHeader ? authHeader.substring(0, 20) + '...' : 'NO HEADER');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    console.log('[JwtAuthGuard] handleRequest - Error:', err?.message);
    console.log('[JwtAuthGuard] handleRequest - User:', user);
    if (err || !user) {
      console.error('[JwtAuthGuard] JWT validation failed:', err?.message || 'No user');
      throw (
        err || new UnauthorizedException('Token not found or is invalid')
      );
    }
    return user;
  }
}
