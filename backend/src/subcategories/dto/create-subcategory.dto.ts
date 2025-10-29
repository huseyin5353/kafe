import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional } from 'class-validator';

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
