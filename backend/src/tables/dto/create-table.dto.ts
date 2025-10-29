import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TableStatusDto {
  available = 'available',
  occupied = 'occupied',
}

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  table_number: string;

  @IsOptional()
  @IsEnum(TableStatusDto)
  status?: TableStatusDto;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
