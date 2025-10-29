import { IsOptional, IsString, IsBoolean, IsInt, Min, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class TenantQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // name, email, slug, business_name araması

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  currency?: string; // TRY, USD, EUR filter

  // Date Range Filters
  @IsOptional()
  @IsDateString()
  createdFrom?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsDateString()
  createdTo?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsDateString()
  updatedFrom?: string;

  @IsOptional()
  @IsDateString()
  updatedTo?: string;

  // Pagination
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  // Sorting
  @IsOptional()
  @IsString()
  @IsIn(['name', 'created_at', 'updated_at', 'email', 'slug', 'business_name'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Quick Filters (Presets)
  @IsOptional()
  @IsString()
  @IsIn(['all', 'active', 'inactive', 'recent', 'old'])
  preset?: string;
}

