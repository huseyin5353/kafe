import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { ActivityLoggerInterceptor } from '../common/interceptors/activity-logger.interceptor';
import { JwtAuthGuard, SuperAdminGuard } from '../common/guards';
import { CurrentUser, type CurrentUserType } from '../common/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@UseInterceptors(ActivityLoggerInterceptor)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const superAdminId = BigInt(user.userId);
    return this.tenantsService.create(createTenantDto, superAdminId);
  }

  @Get()
  findAll(@Query() query: TenantQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('is_active') is_active: boolean,
  ) {
    return this.tenantsService.updateStatus(id, is_active);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  // Bulk Operations
  @Post('bulk/delete')
  bulkDelete(
    @Body() dto: BulkDeleteDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const superAdminId = BigInt(user.userId);
    return this.tenantsService.bulkDelete(dto.ids, superAdminId);
  }

  @Post('bulk/update-status')
  bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const superAdminId = BigInt(user.userId);
    return this.tenantsService.bulkUpdateStatus(dto.ids, dto.is_active, superAdminId);
  }
}
