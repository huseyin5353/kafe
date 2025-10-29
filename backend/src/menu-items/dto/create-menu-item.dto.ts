import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  department_id: string;

  @IsOptional()
  @IsString()
  subcategory_id?: string;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @IsOptional()
  @IsInt()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsInt()
  preparation_time?: number;

  @IsOptional()
  @IsInt()
  spice_level?: number;

  @IsOptional()
  @IsBoolean()
  is_vegetarian?: boolean;

  @IsOptional()
  @IsBoolean()
  is_vegan?: boolean;

  @IsOptional()
  @IsBoolean()
  is_gluten_free?: boolean;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  allergens?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
