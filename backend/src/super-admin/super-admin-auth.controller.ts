import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { SuperAdminRegisterDto } from './dto/super-admin-register.dto';

@Controller('super-admin/auth')
export class SuperAdminAuthController {
  constructor(private readonly authService: SuperAdminAuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async register(@Body() dto: SuperAdminRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(@Body() dto: SuperAdminLoginDto) {
    return this.authService.login(dto);
  }

  // @Get('profile')
  // @UseGuards(JwtAuthGuard) // Bu guard'ı ileride ekleyeceğiz
  // async getProfile(@CurrentUser() user: any) {
  //   return this.authService.getProfile(user.sub);
  // }
}
