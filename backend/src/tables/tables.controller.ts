import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, TableStatusDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tenant/:tenantId/tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.tablesService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TableStatusDto | 'all',
    @Query('is_active') is_active?: string,
    @Query('search') search?: string,
  ) {
    return this.tablesService.findAll(tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status: status || 'all',
      is_active,
      search,
    });
  }

  @Put(':id')
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.tablesService.softDelete(tenantId, id);
  }
}
