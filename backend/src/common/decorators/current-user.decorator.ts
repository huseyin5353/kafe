import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  type: 'super_admin' | 'tenant_user';
  tenantId?: string; // Sadece tenant user için
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

