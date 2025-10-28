import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

@Injectable()
export class SuperAdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: SuperAdminLoginDto) {
    // Super admin'i bul
    const superAdmin = await this.prisma.super_admins.findUnique({
      where: { email: dto.email },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      superAdmin.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Aktif mi kontrol et
    if (!superAdmin.is_active) {
      throw new UnauthorizedException('Hesabınız devre dışı bırakılmış');
    }

    // Son giriş zamanını güncelle
    await this.prisma.super_admins.update({
      where: { id: superAdmin.id },
      data: { last_login_at: new Date() },
    });

    // Token oluştur
    const token = await this.generateToken(superAdmin);

    return {
      message: 'Giriş başarılı',
      token,
      user: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        full_name: superAdmin.full_name,
        role: superAdmin.role,
      },
    };
  }

  async getProfile(userId: bigint) {
    const superAdmin = await this.prisma.super_admins.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        permissions: true,
        last_login_at: true,
        created_at: true,
      },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return superAdmin;
  }

  private async generateToken(superAdmin: any) {
    const payload = {
      sub: superAdmin.id.toString(),
      email: superAdmin.email,
      role: superAdmin.role,
      type: 'super_admin',
    };

    return this.jwtService.sign(payload);
  }
}
