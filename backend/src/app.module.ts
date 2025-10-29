import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { WinstonModule } from 'nest-winston';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { EventsGateway } from './events/events.gateway';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TenantModule } from './tenant/tenant.module';
import { DepartmentsModule } from './departments/departments.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { UploadModule } from './upload/upload.module';
import { TablesModule } from './tables/tables.module';
import { winstonConfig } from './common/logger/winston.config';
import { JwtStrategy } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Global in-memory cache (ileride Redis'e alınabilir)
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // saniye
      max: 1000,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Rate limiting: başlangıç yükü için rahat limitler
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 saniye penceresi
        limit: 300, // IP/JWT başına 60 sn'de 300 istek
      },
    ]),
    // Winston logger
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    AuthModule,
    TenantsModule,
    ProductsModule,
    OrdersModule,
    SuperAdminModule,
    TenantModule,
    DepartmentsModule,
    CategoriesModule,
    SubCategoriesModule,
    MenuItemsModule,
    UploadModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Tüm GET istekleri için global cache (ResponseInterceptor ile birlikte çalışır)
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
