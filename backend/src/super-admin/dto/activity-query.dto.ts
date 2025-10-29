import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityQueryDto {
  @IsOptional()
  @IsString()
  action_type?: string; // create_tenant, update_tenant, etc.

  @IsOptional()
  @IsString()
  tenant_id?: string;

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
}


