import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  department_id: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
