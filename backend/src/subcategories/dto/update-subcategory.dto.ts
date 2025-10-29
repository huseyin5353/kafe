import { PartialType } from '@nestjs/mapped-types';
import { CreateSubCategoryDto } from './create-subcategory.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
