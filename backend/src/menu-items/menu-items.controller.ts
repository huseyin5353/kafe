import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tenant/:tenantId/menu-items')
@UseGuards(JwtAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create(tenantId, createMenuItemDto);
  }

  @Get()
  findAll(@Param('tenantId') tenantId: string) {
    return this.menuItemsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.menuItemsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(tenantId, id, updateMenuItemDto);
  }

  @Delete(':id')
  remove(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.menuItemsService.remove(tenantId, id);
  }
}
