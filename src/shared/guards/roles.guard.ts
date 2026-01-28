import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable } from 'rxjs';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const userRole = request.cookies?.userRole;

    if (!userRole) {
      throw new ForbiddenException('Access denied: no role found');
    }

    if (!roles.includes(userRole)) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return true;
  }
}
