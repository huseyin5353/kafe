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
import { SubCategoriesService } from './subcategories.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tenant/:tenantId/subcategories')
@UseGuards(JwtAuthGuard)
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ) {
    return this.subCategoriesService.create(tenantId, createSubCategoryDto);
  }

  @Get()
  findAll(@Param('tenantId') tenantId: string) {
    return this.subCategoriesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.subCategoriesService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoriesService.update(tenantId, id, updateSubCategoryDto);
  }

  @Delete(':id')
  remove(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.subCategoriesService.remove(tenantId, id);
  }
}
