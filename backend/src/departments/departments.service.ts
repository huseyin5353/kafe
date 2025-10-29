import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDepartmentDto) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant bulunamadı');
    }

    // Check duplicate department name for this tenant
    const existing = await this.prisma.departments.findFirst({
      where: {
        tenant_id: BigInt(tenantId),
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `"${dto.name}" adında bir departman zaten mevcut`,
      );
    }

    const department = await this.prisma.departments.create({
      data: {
        tenant_id: BigInt(tenantId),
        name: dto.name,
        description: dto.description,
        icon_name: dto.icon_name,
        color_code: dto.color_code,
        sort_order: dto.sort_order ?? 0,
        is_active: true,
      },
    });

    return {
      message: 'Departman başarıyla oluşturuldu',
      data: this.formatDepartment(department),
    };
  }

  async findAll(tenantId: string) {
    const departments = await this.prisma.departments.findMany({
      where: {
        tenant_id: BigInt(tenantId),
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return {
      data: departments.map((dept) => this.formatDepartment(dept)),
    };
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.departments.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        menu_item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Departman bulunamadı');
    }

    return {
      data: {
        ...this.formatDepartment(department),
        categories: department.category.map((cat) => ({
          id: cat.id.toString(),
          name: cat.name,
        })),
        menu_items: department.menu_item.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        })),
      },
    };
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.departments.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
    });

    if (!department) {
      throw new NotFoundException('Departman bulunamadı');
    }

    // Check duplicate name if name is being updated
    if (dto.name && dto.name !== department.name) {
      const existing = await this.prisma.departments.findFirst({
        where: {
          tenant_id: BigInt(tenantId),
          name: dto.name,
          id: { not: BigInt(id) },
        },
      });

      if (existing) {
        throw new ConflictException(
          `"${dto.name}" adında bir departman zaten mevcut`,
        );
      }
    }

    const updated = await this.prisma.departments.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon_name !== undefined && { icon_name: dto.icon_name }),
        ...(dto.color_code !== undefined && { color_code: dto.color_code }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return {
      message: 'Departman başarıyla güncellendi',
      data: this.formatDepartment(updated),
    };
  }

  async remove(tenantId: string, id: string) {
    const department = await this.prisma.departments.findFirst({
      where: {
        id: BigInt(id),
        tenant_id: BigInt(tenantId),
      },
      include: {
        _count: {
          select: {
            category: true,
            menu_item: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Departman bulunamadı');
    }

    // Check if there are related categories or menu items
    if (department._count.category > 0 || department._count.menu_item > 0) {
      throw new ConflictException(
        'Bu departmana bağlı kategoriler veya ürünler var. Önce bunları silmelisiniz.',
      );
    }

    await this.prisma.departments.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: 'Departman başarıyla silindi',
    };
  }

  private formatDepartment(department: any) {
    return {
      id: department.id.toString(),
      tenant_id: department.tenant_id.toString(),
      name: department.name,
      description: department.description,
      icon_name: department.icon_name,
      color_code: department.color_code,
      is_active: department.is_active,
      sort_order: department.sort_order,
      created_at: department.created_at,
    };
  }
}
