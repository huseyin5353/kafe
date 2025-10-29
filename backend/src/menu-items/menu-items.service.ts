import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateMenuItemDto) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant bulunamadı');
    }

    const department = await this.prisma.departments.findFirst({
      where: {
        id: BigInt(dto.department_id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!department) {
      throw new NotFoundException('Departman bulunamadı');
    }

    const existing = await this.prisma.menu_item.findFirst({
      where: {
        tenant_id: BigInt(tenantId),
        department_id: BigInt(dto.department_id),
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `"${dto.name}" adında bir ürün bu departmanda zaten mevcut`,
      );
    }

    const menuItem = await this.prisma.menu_item.create({
      data: {
        tenant_id: BigInt(tenantId),
        department_id: BigInt(dto.department_id),
        subcategory_id: dto.subcategory_id ? BigInt(dto.subcategory_id) : null,
        name: dto.name,
        price: dto.price,
        description: dto.description,
        is_available: dto.is_available ?? true,
        image_url: dto.image_url,
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        preparation_time: dto.preparation_time,
        spice_level: dto.spice_level,
        is_vegetarian: dto.is_vegetarian ?? false,
        is_vegan: dto.is_vegan ?? false,
        is_gluten_free: dto.is_gluten_free ?? false,
        ingredients: dto.ingredients,
        allergens: dto.allergens,
        sort_order: dto.sort_order ?? 0,
        is_active: true,
      },
    });

    return {
      message: 'Ürün başarıyla oluşturuldu',
      data: this.formatMenuItem(menuItem),
    };
  }

  async findAll(tenantId: string) {
    const menuItems = await this.prisma.menu_item.findMany({
      where: {
        tenant_id: BigInt(tenantId),
      },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            color_code: true,
          },
        },
        sub_category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return {
      data: menuItems.map((item) => this.formatMenuItem(item)),
    };
  }

  async findOne(tenantId: string, id: string) {
    const menuItem = await this.prisma.menu_item.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        departments: true,
        sub_category: true,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return {
      data: this.formatMenuItem(menuItem),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateMenuItemDto) {
    const menuItem = await this.prisma.menu_item.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    if (dto.name && dto.name !== menuItem.name) {
      const existing = await this.prisma.menu_item.findFirst({
        where: {
          tenant_id: BigInt(tenantId),
          department_id: menuItem.department_id,
          name: dto.name,
          id: { not: BigInt(id) },
        },
      });

      if (existing) {
        throw new ConflictException(
          `"${dto.name}" adında bir ürün bu departmanda zaten mevcut`,
        );
      }
    }

    const updated = await this.prisma.menu_item.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.department_id && { department_id: BigInt(dto.department_id) }),
        ...(dto.subcategory_id !== undefined && { subcategory_id: dto.subcategory_id ? BigInt(dto.subcategory_id) : null }),
        ...(dto.is_available !== undefined && { is_available: dto.is_available }),
        ...(dto.image_url !== undefined && { image_url: dto.image_url }),
        ...(dto.calories !== undefined && { calories: dto.calories }),
        ...(dto.protein !== undefined && { protein: dto.protein }),
        ...(dto.carbs !== undefined && { carbs: dto.carbs }),
        ...(dto.fat !== undefined && { fat: dto.fat }),
        ...(dto.preparation_time !== undefined && { preparation_time: dto.preparation_time }),
        ...(dto.spice_level !== undefined && { spice_level: dto.spice_level }),
        ...(dto.is_vegetarian !== undefined && { is_vegetarian: dto.is_vegetarian }),
        ...(dto.is_vegan !== undefined && { is_vegan: dto.is_vegan }),
        ...(dto.is_gluten_free !== undefined && { is_gluten_free: dto.is_gluten_free }),
        ...(dto.ingredients !== undefined && { ingredients: dto.ingredients }),
        ...(dto.allergens !== undefined && { allergens: dto.allergens }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return {
      message: 'Ürün başarıyla güncellendi',
      data: this.formatMenuItem(updated),
    };
  }

  async remove(tenantId: string, id: string) {
    const menuItem = await this.prisma.menu_item.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    await this.prisma.menu_item.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Ürün başarıyla silindi',
    };
  }

  private formatMenuItem(item: any) {
    return {
      id: item.id.toString(),
      tenant_id: item.tenant_id.toString(),
      department_id: item.department_id.toString(),
      subcategory_id: item.subcategory_id ? item.subcategory_id.toString() : null,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description,
      is_available: item.is_available,
      image_url: item.image_url,
      calories: item.calories,
      protein: item.protein ? parseFloat(item.protein) : null,
      carbs: item.carbs ? parseFloat(item.carbs) : null,
      fat: item.fat ? parseFloat(item.fat) : null,
      preparation_time: item.preparation_time,
      spice_level: item.spice_level,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      ingredients: item.ingredients,
      allergens: item.allergens,
      sort_order: item.sort_order,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}
