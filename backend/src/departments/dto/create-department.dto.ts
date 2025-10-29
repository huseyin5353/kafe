import { IsString, IsOptional, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color_code?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
