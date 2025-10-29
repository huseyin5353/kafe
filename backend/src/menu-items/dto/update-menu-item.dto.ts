import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
