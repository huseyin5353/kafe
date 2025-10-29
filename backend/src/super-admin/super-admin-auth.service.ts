import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { UsersQueryDto } from './dto/users-query.dto';

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
        id: superAdmin.id.toString(), // BigInt to string
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

    return {
      ...superAdmin,
      id: superAdmin.id.toString(), // BigInt to string
    };
  }

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const superAdmin = await this.prisma.super_admins.findUnique({
      where: { id: userId },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Username değiştiriliyorsa benzersizlik kontrolü
    if (dto.username && dto.username !== superAdmin.username) {
      const existingUsername = await this.prisma.super_admins.findUnique({
        where: { username: dto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
      }
    }

    // Email değiştiriliyorsa benzersizlik kontrolü
    if (dto.email && dto.email !== superAdmin.email) {
      const existingEmail = await this.prisma.super_admins.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Bu email adresi zaten kayıtlı');
      }
    }

    const updated = await this.prisma.super_admins.update({
      where: { id: userId },
      data: {
        ...dto,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        updated_at: true,
      },
    });

    return {
      message: 'Profil başarıyla güncellendi',
      data: {
        ...updated,
        id: updated.id.toString(),
      },
    };
  }

  async changePassword(userId: bigint, dto: ChangePasswordDto) {
    // Şifre onayı kontrolü
    if (dto.new_password !== dto.new_password_confirm) {
      throw new BadRequestException('Yeni şifreler eşleşmiyor');
    }

    const superAdmin = await this.prisma.super_admins.findUnique({
      where: { id: userId },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Mevcut şifre kontrolü
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.current_password,
      superAdmin.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mevcut şifre hatalı');
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.super_admins.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Şifre başarıyla değiştirildi',
    };
  }

  async getActivities(userId: bigint, query: ActivityQueryDto) {
    const { action_type, tenant_id, page = 1, limit = 20 } = query;

    // Where koşulları
    const where: any = {
      super_admin_id: userId,
    };

    if (action_type) {
      where.action_type = action_type;
    }

    if (tenant_id) {
      where.tenant_id = BigInt(tenant_id);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    const [activities, total] = await Promise.all([
      this.prisma.super_admin_activities.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          super_admins: {
            select: {
              id: true,
              username: true,
              full_name: true,
            },
          },
        },
      }),
      this.prisma.super_admin_activities.count({ where }),
    ]);

    // BigInt to String
    const data = activities.map((activity) => ({
      ...activity,
      id: activity.id.toString(),
      super_admin_id: activity.super_admin_id.toString(),
      tenant_id: activity.tenant_id?.toString() || null,
      target_id: activity.target_id?.toString() || null,
      super_admins: {
        ...activity.super_admins,
        id: activity.super_admins.id.toString(),
      },
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsers(query: UsersQueryDto) {
    const {
      search,
      tenant_id,
      role,
      is_active,
      page = 1,
      limit = 20,
      sortBy,
      sortOrder,
    } = query;

    // Where koşulları
    const where: any = {};

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tenant_id) {
      where.tenant_id = BigInt(tenant_id);
    }

    if (role) {
      where.role = role;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Sıralama
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          tenants: {
            select: {
              id: true,
              name: true,
              slug: true,
              is_active: true,
            },
          },
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    // BigInt to String
    const data = users.map((user) => ({
      ...user,
      id: user.id.toString(),
      tenant_id: user.tenant_id.toString(),
      tenants: {
        ...user.tenants,
        id: user.tenants.id.toString(),
      },
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
