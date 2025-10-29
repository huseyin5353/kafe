import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSubCategoryDto) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant bulunamadı');
    }

    // Check if category exists
    const category = await this.prisma.category.findFirst({
      where: {
        id: BigInt(dto.category_id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Check duplicate subcategory name for this tenant + category
    const existing = await this.prisma.sub_category.findFirst({
      where: {
        tenant_id: BigInt(tenantId),
        category_id: BigInt(dto.category_id),
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `"${dto.name}" adında bir alt kategori bu kategoride zaten mevcut`,
      );
    }

    const subCategory = await this.prisma.sub_category.create({
      data: {
        tenant_id: BigInt(tenantId),
        category_id: BigInt(dto.category_id),
        name: dto.name,
        sort_order: dto.sort_order ?? 0,
        is_active: true,
      },
    });

    return {
      message: 'Alt kategori başarıyla oluşturuldu',
      data: this.formatSubCategory(subCategory),
    };
  }

  async findAll(tenantId: string) {
    const subCategories = await this.prisma.sub_category.findMany({
      where: {
        tenant_id: BigInt(tenantId),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            department_id: true,
            departments: {
              select: {
                id: true,
                name: true,
                color_code: true,
              },
            },
          },
        },
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return {
      data: subCategories.map((sub) => this.formatSubCategory(sub)),
    };
  }

  async findOne(tenantId: string, id: string) {
    const subCategory = await this.prisma.sub_category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        category: true,
        menu_item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Alt kategori bulunamadı');
    }

    return {
      data: this.formatSubCategory(subCategory),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateSubCategoryDto) {
    const subCategory = await this.prisma.sub_category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Alt kategori bulunamadı');
    }

    // Check duplicate name if name is being updated
    if (dto.name && dto.name !== subCategory.name) {
      const existing = await this.prisma.sub_category.findFirst({
        where: {
          tenant_id: BigInt(tenantId),
          category_id: subCategory.category_id,
          name: dto.name,
          id: { not: BigInt(id) },
        },
      });

      if (existing) {
        throw new ConflictException(
          `"${dto.name}" adında bir alt kategori bu kategoride zaten mevcut`,
        );
      }
    }

    const updated = await this.prisma.sub_category.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category_id && { category_id: BigInt(dto.category_id) }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return {
      message: 'Alt kategori başarıyla güncellendi',
      data: this.formatSubCategory(updated),
    };
  }

  async remove(tenantId: string, id: string) {
    const subCategory = await this.prisma.sub_category.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        _count: {
          select: {
            menu_item: true,
          },
        },
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Alt kategori bulunamadı');
    }

    // Check if there are related menu items
    if (subCategory._count.menu_item > 0) {
      throw new ConflictException(
        'Bu alt kategoriye bağlı ürünler var. Önce bunları silmelisiniz.',
      );
    }

    await this.prisma.sub_category.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Alt kategori başarıyla silindi',
    };
  }

  private formatSubCategory(subCategory: any) {
    return {
      id: subCategory.id.toString(),
      tenant_id: subCategory.tenant_id.toString(),
      category_id: subCategory.category_id.toString(),
      name: subCategory.name,
      sort_order: subCategory.sort_order,
      is_active: subCategory.is_active,
      created_at: subCategory.created_at,
      ...(subCategory.category && {
        category: {
          id: subCategory.category.id.toString(),
          name: subCategory.category.name,
          department_id: subCategory.category.department_id.toString(),
          ...(subCategory.category.departments && {
            department: {
              id: subCategory.category.departments.id.toString(),
              name: subCategory.category.departments.name,
              color_code: subCategory.category.departments.color_code,
            },
          }),
        },
      }),
    };
  }
}
