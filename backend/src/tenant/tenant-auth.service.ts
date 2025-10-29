import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantLoginDto } from './dto/tenant-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: TenantLoginDto) {
    // 1. Tenant'ı slug ile bul
    const tenant = await this.prisma.tenants.findUnique({
      where: { slug: dto.tenant_slug },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    if (!tenant.is_active) {
      throw new UnauthorizedException('Bu kafe aktif değil. Lütfen sistem yöneticisi ile iletişime geçin.');
    }

    // 2. Kullanıcıyı bul (username ve tenant_id ile)
    const user = await this.prisma.users.findFirst({
      where: {
        username: dto.username,
        tenant_id: tenant.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Kullanıcı hesabı aktif değil');
    }

    // 3. Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
    }

    // 4. JWT token oluştur
    const payload = {
      sub: user.id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      type: 'tenant_user',
      tenantId: tenant.id.toString(),
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      tenant: {
        id: tenant.id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        business_name: tenant.business_name,
        currency: tenant.currency,
      },
    };
  }

  async getProfile(userId: bigint) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            slug: true,
            business_name: true,
            email: true,
            phone: true,
            currency: true,
            timezone: true,
            is_active: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      tenant: user.tenants ? {
        ...user.tenants,
        id: user.tenants.id.toString(),
      } : null,
    };
  }
}

