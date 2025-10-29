import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TableStatusDto } from './create-table.dto';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  table_number?: string;

  @IsOptional()
  @IsEnum(TableStatusDto)
  status?: TableStatusDto;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
