// src/libs/guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiRole } from 'src/libs/api/api-role.enum';
import { AUTH_ROLES_KEY } from 'src/libs/decorator/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ApiRole[]>(
      AUTH_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    let request;
    
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const user = request.user;

    if (!user) {
      return false;
    }

    // Convert user role string to ApiRole
    const userRole = this.toApiRole(user.role);

    if (!userRole) {
      return false;
    }

    return requiredRoles.includes(userRole);
  }

  private toApiRole(role: string): ApiRole | null {
    switch (role) {
      case 'admin':
        return ApiRole.ADMIN;
      case 'user':
        return ApiRole.USER;
      default:
        return null;
    }
  }
}