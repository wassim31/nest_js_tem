import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user-role.enum';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as { userId: number; email: string; name: string; role: string };
  },
);

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

