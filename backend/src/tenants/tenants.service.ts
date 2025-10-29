import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto, superAdminId: bigint) {
    // Slug benzersizlik kontrolü
    const existingSlug = await this.prisma.tenants.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `"${dto.slug}" subdomain zaten kullanılıyor`,
      );
    }

    // Email benzersizlik kontrolü
    const existingEmail = await this.prisma.tenants.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException(
        `"${dto.email}" email adresi zaten kayıtlı`,
      );
    }

    // Owner email kontrolü
    const existingOwnerEmail = await this.prisma.users.findFirst({
      where: { email: dto.owner_email },
    });

    if (existingOwnerEmail) {
      throw new ConflictException(
        `Owner email "${dto.owner_email}" zaten kullanılıyor`,
      );
    }

    // Transaction ile tenant + owner user oluştur
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Tenant oluştur
      const tenant = await tx.tenants.create({
        data: {
          name: dto.name,
          business_name: dto.business_name,
          slug: dto.slug,
          email: dto.email,
          phone: dto.phone,
          currency: dto.currency || 'TRY',
          timezone: dto.timezone || 'Europe/Istanbul',
          settings: dto.settings || {},
          is_active: true,
          created_by: superAdminId,
        },
      });

      // 2. Owner user oluştur (tenant admin)
      const hashedPassword = await bcrypt.hash(dto.owner_password, 10);

      const owner = await tx.users.create({
        data: {
          tenant_id: tenant.id,
          username: dto.owner_username,
          email: dto.owner_email,
          password_hash: hashedPassword,
          full_name: dto.owner_full_name,
          role: 'admin', // Kafe sahibi admin
          is_active: true,
        },
      });

      // Activity log kaydet
      await tx.super_admin_activities.create({
        data: {
          super_admin_id: superAdminId,
          tenant_id: tenant.id,
          action_type: 'create_tenant',
          target_table: 'tenants',
          target_id: tenant.id,
          description: `Yeni kafe oluşturuldu: ${tenant.name}`,
        },
      });

      return {
        tenant: {
          id: tenant.id.toString(),
          name: tenant.name,
          business_name: tenant.business_name,
          slug: tenant.slug,
          email: tenant.email,
          phone: tenant.phone,
          currency: tenant.currency,
          timezone: tenant.timezone,
          is_active: tenant.is_active,
          created_at: tenant.created_at,
        },
        owner: {
          id: owner.id.toString(),
          username: owner.username,
          email: owner.email,
          full_name: owner.full_name,
          role: owner.role,
        },
      };
    });

    return {
      message: 'Kafe başarıyla oluşturuldu',
      data: result,
    };
  }

  async findAll(query: TenantQueryDto) {
    const {
      search,
      is_active,
      currency,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      preset,
    } = query;

    // Where koşulları
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { business_name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // Currency filter
    if (currency) {
      where.currency = currency;
    }

    // Date Range Filters
    if (createdFrom || createdTo) {
      where.created_at = {};
      if (createdFrom) {
        where.created_at.gte = new Date(createdFrom);
      }
      if (createdTo) {
        // End of day için 23:59:59 ekle
        const endDate = new Date(createdTo);
        endDate.setHours(23, 59, 59, 999);
        where.created_at.lte = endDate;
      }
    }

    if (updatedFrom || updatedTo) {
      where.updated_at = {};
      if (updatedFrom) {
        where.updated_at.gte = new Date(updatedFrom);
      }
      if (updatedTo) {
        const endDate = new Date(updatedTo);
        endDate.setHours(23, 59, 59, 999);
        where.updated_at.lte = endDate;
      }
    }

    // Preset Filters (Quick filters)
    if (preset) {
      switch (preset) {
        case 'active':
          where.is_active = true;
          break;
        case 'inactive':
          where.is_active = false;
          break;
        case 'recent':
          // Son 7 gün
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          where.created_at = { gte: sevenDaysAgo };
          break;
        case 'old':
          // 30 günden eski
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          where.created_at = { lt: thirtyDaysAgo };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Sıralama
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenants.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          business_name: true,
          slug: true,
          email: true,
          phone: true,
          currency: true,
          timezone: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          users: {
            where: { role: 'admin' },
            take: 1,
            select: {
              id: true,
              username: true,
              email: true,
              full_name: true,
            },
          },
        },
      }),
      this.prisma.tenants.count({ where }),
    ]);

    // BigInt to String
    const data = tenants.map((tenant) => ({
      ...tenant,
      id: tenant.id.toString(),
      users: tenant.users.map((user) => ({
        ...user,
        id: user.id.toString(),
      })),
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

  async findOne(id: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: {
          where: { role: 'admin' },
          select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            role: true,
            is_active: true,
            last_login_at: true,
            created_at: true,
          },
        },
        super_admins: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    return {
      ...tenant,
      id: tenant.id.toString(),
      created_by: tenant.created_by?.toString(),
      users: tenant.users.map((user) => ({
        ...user,
        id: user.id.toString(),
      })),
      super_admins: tenant.super_admins
        ? {
            ...tenant.super_admins,
            id: tenant.super_admins.id.toString(),
          }
        : null,
    };
  }

  async update(id: string, dto: UpdateTenantDto) {
    // Tenant varlık kontrolü
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(id) },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    // Slug değiştiriliyorsa benzersizlik kontrolü
    if (dto.slug && dto.slug !== tenant.slug) {
      const existingSlug = await this.prisma.tenants.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException(
          `"${dto.slug}" subdomain zaten kullanılıyor`,
        );
      }
    }

    // Email değiştiriliyorsa benzersizlik kontrolü
    if (dto.email && dto.email !== tenant.email) {
      const existingEmail = await this.prisma.tenants.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException(
          `"${dto.email}" email adresi zaten kayıtlı`,
        );
      }
    }

    const updated = await this.prisma.tenants.update({
      where: { id: BigInt(id) },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Kafe başarıyla güncellendi',
      data: {
        ...updated,
        id: updated.id.toString(),
        created_by: updated.created_by?.toString(),
      },
    };
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        is_active: true,
        _count: {
          select: {
            users: true,
            orders: true,
            customers: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    // Eğer aktifse -> Soft Delete (is_active = false)
    if (tenant.is_active) {
      const updated = await this.prisma.tenants.update({
        where: { id: BigInt(id) },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      return {
        message: 'Kafe geçici olarak kapatıldı',
        isSoftDelete: true,
        data: {
          id: updated.id.toString(),
          name: updated.name,
          is_active: updated.is_active,
        },
      };
    }

    // Eğer zaten pasifse -> Hard Delete (kalıcı silme)
    const result = await this.prisma.$transaction(async (tx) => {
      // İlişkili kayıtları sil
      await tx.users.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      await tx.customers.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      await tx.orders.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      // Menü verilerini sil
      await tx.menu_item.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      await tx.sub_category.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      await tx.category.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      await tx.departments.deleteMany({
        where: { tenant_id: BigInt(id) },
      });

      // Tenant'ı sil
      const deleted = await tx.tenants.delete({
        where: { id: BigInt(id) },
      });

      return deleted;
    });

    return {
      message: 'Kafe ve tüm bilgiler tamamen silindi',
      isSoftDelete: false,
      data: {
        id: result.id.toString(),
        name: result.name,
        deleted_related_data: {
          users: tenant._count.users,
          orders: tenant._count.orders,
          customers: tenant._count.customers,
        },
      },
    };
  }

  async updateStatus(id: string, is_active: boolean) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(id) },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    const updated = await this.prisma.tenants.update({
      where: { id: BigInt(id) },
      data: {
        is_active,
        updated_at: new Date(),
      },
    });

    return {
      message: is_active ? 'Kafe aktif edildi' : 'Kafe pasif edildi',
      data: {
        id: updated.id.toString(),
        name: updated.name,
        is_active: updated.is_active,
      },
    };
  }

  async getStats(id: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(id) },
    });

    if (!tenant) {
      throw new NotFoundException('Kafe bulunamadı');
    }

    const [users, customers, orders, revenue] = await Promise.all([
      this.prisma.users.count({ where: { tenant_id: BigInt(id) } }),
      this.prisma.customers.count({ where: { tenant_id: BigInt(id) } }),
      this.prisma.orders.count({ where: { tenant_id: BigInt(id) } }),
      this.prisma.orders.aggregate({
        where: { tenant_id: BigInt(id) },
        _sum: { total_amount: true },
      }),
    ]);

    return {
      tenant: {
        id: tenant.id.toString(),
        name: tenant.name,
        slug: tenant.slug,
      },
      stats: {
        users,
        customers,
        orders,
        revenue: revenue._sum.total_amount || 0,
      },
    };
  }

  // Bulk Operations
  async bulkDelete(ids: string[], superAdminId: bigint) {
    const bigIntIds = ids.map((id) => BigInt(id));

    // Kafeleri kontrol et
    const tenants = await this.prisma.tenants.findMany({
      where: { id: { in: bigIntIds } },
      select: { id: true, name: true },
    });

    if (tenants.length === 0) {
      throw new NotFoundException('Silinecek kafe bulunamadı');
    }

    if (tenants.length !== ids.length) {
      throw new BadRequestException(
        'Bazı kafeler bulunamadı veya zaten silinmiş',
      );
    }

    // Transaction ile sil
    const result = await this.prisma.$transaction(async (tx) => {
      // İlişkili kayıtları sil (users, orders, etc.)
      await tx.users.deleteMany({
        where: { tenant_id: { in: bigIntIds } },
      });

      await tx.customers.deleteMany({
        where: { tenant_id: { in: bigIntIds } },
      });

      await tx.orders.deleteMany({
        where: { tenant_id: { in: bigIntIds } },
      });

      // Tenants'ları sil
      const deleted = await tx.tenants.deleteMany({
        where: { id: { in: bigIntIds } },
      });

      // Activity log kaydet
      for (const tenant of tenants) {
        await tx.super_admin_activities.create({
          data: {
            super_admin_id: superAdminId,
            tenant_id: tenant.id,
            action_type: 'delete_tenant',
            target_table: 'tenants',
            target_id: tenant.id,
            description: `Kafe silindi: ${tenant.name}`,
          },
        });
      }

      return deleted;
    });

    return {
      message: `${result.count} kafe başarıyla silindi`,
      deletedCount: result.count,
      deletedTenants: tenants.map((t) => ({
        id: t.id.toString(),
        name: t.name,
      })),
    };
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean, superAdminId: bigint) {
    const bigIntIds = ids.map((id) => BigInt(id));

    // Kafeleri kontrol et
    const tenants = await this.prisma.tenants.findMany({
      where: { id: { in: bigIntIds } },
      select: { id: true, name: true, is_active: true },
    });

    if (tenants.length === 0) {
      throw new NotFoundException('Güncellenecek kafe bulunamadı');
    }

    if (tenants.length !== ids.length) {
      throw new BadRequestException(
        'Bazı kafeler bulunamadı',
      );
    }

    // Transaction ile güncelle
    const result = await this.prisma.$transaction(async (tx) => {
      // Status güncelle
      const updated = await tx.tenants.updateMany({
        where: { id: { in: bigIntIds } },
        data: { is_active: isActive },
      });

      // Activity log kaydet
      const actionType = isActive ? 'activate_tenant' : 'suspend_tenant';
      const actionText = isActive ? 'aktif edildi' : 'pasif edildi';

      for (const tenant of tenants) {
        // Sadece status değişenler için log
        if (tenant.is_active !== isActive) {
          await tx.super_admin_activities.create({
            data: {
              super_admin_id: superAdminId,
              tenant_id: tenant.id,
              action_type: actionType,
              target_table: 'tenants',
              target_id: tenant.id,
              description: `Kafe ${actionText}: ${tenant.name}`,
            },
          });
        }
      }

      return updated;
    });

    return {
      message: `${result.count} kafe başarıyla güncellendi`,
      updatedCount: result.count,
      isActive,
      updatedTenants: tenants.map((t) => ({
        id: t.id.toString(),
        name: t.name,
      })),
    };
  }
}
