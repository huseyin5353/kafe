import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant bulunamadı');
    }

    // Check if department exists
    const department = await this.prisma.departments.findFirst({
      where: {
        id: BigInt(dto.department_id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!department) {
      throw new NotFoundException('Departman bulunamadı');
    }

    // Check duplicate category name for this tenant + department
    const existing = await this.prisma.category.findFirst({
      where: {
        tenant_id: BigInt(tenantId),
        department_id: BigInt(dto.department_id),
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `"${dto.name}" adında bir kategori bu departmanda zaten mevcut`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        tenant_id: BigInt(tenantId),
        department_id: BigInt(dto.department_id),
        name: dto.name,
        sort_order: dto.sort_order ?? 0,
        is_active: true,
      },
    });

    return {
      message: 'Kategori başarıyla oluşturuldu',
      data: this.formatCategory(category),
    };
  }

  async findAll(tenantId: string) {
    const categories = await this.prisma.category.findMany({
      where: {
        tenant_id: BigInt(tenantId),
      },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            icon_name: true,
            color_code: true,
          },
        },
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return {
      data: categories.map((cat) => this.formatCategory(cat)),
    };
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        departments: true,
        sub_category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return {
      data: this.formatCategory(category),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Check duplicate name if name is being updated
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          tenant_id: BigInt(tenantId),
          department_id: category.department_id,
          name: dto.name,
          id: { not: BigInt(id) },
        },
      });

      if (existing) {
        throw new ConflictException(
          `"${dto.name}" adında bir kategori bu departmanda zaten mevcut`,
        );
      }
    }

    const updated = await this.prisma.category.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.department_id && { department_id: BigInt(dto.department_id) }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return {
      message: 'Kategori başarıyla güncellendi',
      data: this.formatCategory(updated),
    };
  }

  async remove(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        _count: {
          select: {
            sub_category: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Check if there are related sub categories
    if (category._count.sub_category > 0) {
      throw new ConflictException(
        'Bu kategoriye bağlı alt kategoriler var. Önce bunları silmelisiniz.',
      );
    }

    await this.prisma.category.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Kategori başarıyla silindi',
    };
  }

  private formatCategory(category: any) {
    return {
      id: category.id.toString(),
      tenant_id: category.tenant_id.toString(),
      department_id: category.department_id.toString(),
      name: category.name,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at,
      ...(category.departments && {
        department: {
          id: category.departments.id.toString(),
          name: category.departments.name,
          icon_name: category.departments.icon_name,
          color_code: category.departments.color_code,
        },
      }),
    };
  }
}
