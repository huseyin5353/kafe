import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  async validate(payload: any) {
    // Payload'dan user bilgisi al
    const { sub, type, role } = payload;

    // Super Admin ise
    if (type === 'super_admin') {
      const superAdmin = await this.prisma.super_admins.findUnique({
        where: { id: BigInt(sub) },
        select: {
          id: true,
          username: true,
          email: true,
          full_name: true,
          role: true,
          is_active: true,
        },
      });

      if (!superAdmin || !superAdmin.is_active) {
        throw new UnauthorizedException('Geçersiz veya pasif kullanıcı');
      }

      return {
        userId: superAdmin.id.toString(),
        username: superAdmin.username,
        email: superAdmin.email,
        fullName: superAdmin.full_name,
        role: superAdmin.role,
        type: 'super_admin',
      };
    }

    // Tenant user ise
    if (type === 'tenant_user') {
      const user = await this.prisma.users.findUnique({
        where: { id: BigInt(sub) },
        select: {
          id: true,
          tenant_id: true,
          username: true,
          email: true,
          full_name: true,
          role: true,
          is_active: true,
        },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Geçersiz veya pasif kullanıcı');
      }

      return {
        userId: user.id.toString(),
        tenantId: user.tenant_id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        type: 'tenant_user',
      };
    }

    throw new UnauthorizedException('Geçersiz token tipi');
  }
}

