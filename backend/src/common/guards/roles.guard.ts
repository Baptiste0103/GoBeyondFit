import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  STUDENT = 'student',
}

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for endpoint
 * Usage: @Roles(UserRole.COACH, UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Role-Based Access Control Guard
 * Checks if user has one of the required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `User role '${user.role}' does not have access to this resource. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
