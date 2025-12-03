import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Ownership Guard
 * Ensures user can only access/modify their own resources
 * Check is performed by comparing user ID to resource owner ID
 * 
 * Usage: @UseGuards(JwtAuthGuard, OwnershipGuard)
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const { id, userId, coachId, ownerId } = request.params;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // Check if user ID matches one of the resource ownership fields
    const resourceOwnerId = id || userId || coachId || ownerId;

    if (resourceOwnerId && user.id !== resourceOwnerId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
