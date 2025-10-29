import { IsOptional, IsDateString } from 'class-validator';

export class DashboardStatsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}


