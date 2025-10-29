import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { ActivityLoggerInterceptor } from '../common/interceptors/activity-logger.interceptor';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, ActivityLoggerInterceptor],
})
export class TenantsModule {}
