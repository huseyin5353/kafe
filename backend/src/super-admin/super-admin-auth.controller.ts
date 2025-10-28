import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { SuperAdminRegisterDto } from './dto/super-admin-register.dto';

@Controller('super-admin/auth')
export class SuperAdminAuthController {
  constructor(private readonly authService: SuperAdminAuthService) {}

  @Post('register')
  async register(@Body() dto: SuperAdminRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: SuperAdminLoginDto) {
    return this.authService.login(dto);
  }

  // @Get('profile')
  // @UseGuards(JwtAuthGuard) // Bu guard'ı ileride ekleyeceğiz
  // async getProfile(@CurrentUser() user: any) {
  //   return this.authService.getProfile(user.sub);
  // }
}
