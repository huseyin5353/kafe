import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto, TableStatusDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTableDto) {
    const tenant_id = BigInt(tenantId);
    return this.prisma.restaurant_table.create({
      data: {
        tenant_id,
        table_number: dto.table_number,
        status: (dto.status as any) ?? 'available',
        is_active: dto.is_active ?? true,
        // capacity/qr kullanılmıyor; şema gereği capacity > 0 zorunlu
        capacity: 1,
      },
    });
  }

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; status?: TableStatusDto | 'all'; is_active?: string; search?: string }
  ) {
    const tenant_id = BigInt(tenantId);
    const { page = 1, limit = 20, status = 'all', is_active, search } = params;
    const where: any = { tenant_id };

    if (status && status !== 'all') where.status = status as any;
    if (typeof is_active !== 'undefined') where.is_active = is_active === 'true';
    if (search) where.table_number = { contains: search, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.restaurant_table.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.restaurant_table.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(tenantId: string, id: string, dto: UpdateTableDto) {
    const tenant_id = BigInt(tenantId);
    const tableId = BigInt(id);
    return this.prisma.restaurant_table.update({
      where: { id: tableId, tenant_id },
      data: {
        table_number: dto.table_number,
        status: (dto.status as any),
        is_active: dto.is_active,
      },
    });
  }

  async softDelete(tenantId: string, id: string) {
    const tenant_id = BigInt(tenantId);
    const tableId = BigInt(id);
    return this.prisma.restaurant_table.update({
      where: { id: tableId, tenant_id },
      data: { is_active: false },
    });
  }

  // bulkSort yok: şema sort_order içermiyor. İleride eklenecekse migrasyon ile eklenir.
}
