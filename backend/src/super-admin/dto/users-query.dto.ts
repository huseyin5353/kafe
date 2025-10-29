import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // full_name, email, username

  @IsOptional()
  @IsString()
  tenant_id?: string; // Belirli bir kafeye göre filtrele

  @IsOptional()
  @IsString()
  role?: string; // admin, manager, waiter, kitchen, cashier

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}


