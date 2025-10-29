import { Controller, Post, Body, Get, Put, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminDashboardService } from './super-admin-dashboard.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard, SuperAdminGuard } from '../common/guards';
import { CurrentUser, type CurrentUserType } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('super-admin/auth')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminAuthController {
  constructor(
    private readonly authService: SuperAdminAuthService,
    private readonly dashboardService: SuperAdminDashboardService,
  ) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(@Body() dto: SuperAdminLoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserType) {
    const userId = BigInt(user.userId);
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const userId = BigInt(user.userId);
    return this.authService.updateProfile(userId, dto);
  }

  @Post('change-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const userId = BigInt(user.userId);
    return this.authService.changePassword(userId, dto);
  }

  @Get('activities')
  async getActivities(
    @Query() query: ActivityQueryDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const userId = BigInt(user.userId);
    return this.authService.getActivities(userId, query);
  }

  @Get('users')
  async getUsers(@Query() query: UsersQueryDto) {
    return this.authService.getUsers(query);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Query() query: DashboardStatsQueryDto) {
    return this.dashboardService.getStats(query);
  }

  @Get('dashboard/health')
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }
}
