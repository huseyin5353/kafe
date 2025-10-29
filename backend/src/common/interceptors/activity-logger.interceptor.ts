import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    console.log('🔍 ActivityLogger: Interceptor triggered', { method, url, hasUser: !!user, userType: user?.type });

    // Sadece super admin ve belirli endpoint'leri logla
    if (!user || user.type !== 'super_admin') {
      console.log('⚠️ ActivityLogger: Skipped - no user or not super_admin');
      return next.handle();
    }

    // Activity type'ı belirle
    const activityType = this.determineActivityType(method, url, body);
    console.log('🔍 ActivityLogger: Activity type determined', { activityType });
    
    if (!activityType) {
      console.log('⚠️ ActivityLogger: Skipped - no activity type');
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          console.log('🔍 ActivityLogger: Response received', { 
            responseKeys: Object.keys(response || {}),
            hasData: !!response?.data,
            dataKeys: response?.data ? Object.keys(response.data) : []
          });

          const activityData = {
            superAdminId: BigInt(user.userId),
            tenantId: this.extractTenantId(url, body, response),
            actionType: activityType,
            targetTable: this.extractTargetTable(url),
            targetId: this.extractTargetId(url, response),
            description: this.generateDescription(activityType, body, response),
          };

          console.log('✅ ActivityLogger: Logging activity', activityData);

          // Başarılı işlemleri logla
          await this.logActivity(activityData);
          
          console.log('✅ ActivityLogger: Activity logged successfully');
        } catch (error) {
          // Loglama hatası uygulamayı etkilemez
          console.error('❌ Activity logging failed:', error);
        }
      }),
    );
  }

  private determineActivityType(
    method: string,
    url: string,
    body?: any,
  ): string | null {
    // Tenant işlemleri
    if (url.includes('/tenants')) {
      if (method === 'POST' && !url.includes('/status')) return 'create_tenant';
      if (method === 'PATCH' && url.includes('/status')) {
        // Body'den is_active değerini al
        return body?.is_active === true ? 'activate_tenant' : 'suspend_tenant';
      }
      if (method === 'PATCH' || method === 'PUT') return 'update_tenant';
      if (method === 'DELETE') return 'delete_tenant';
    }

    return null;
  }

  private extractTenantId(
    url: string,
    body: any,
    response: any,
  ): bigint | null {
    // URL'den tenant ID çıkar: /tenants/123
    const match = url.match(/\/tenants\/(\d+)/);
    if (match) {
      return BigInt(match[1]);
    }

    // Response'dan tenant ID çıkar (yeni oluşturulmuşsa)
    // ResponseInterceptor formatı: { success, data: { tenant: {...} } }
    if (response?.data?.tenant?.id) {
      return BigInt(response.data.tenant.id);
    }
    if (response?.data?.data?.tenant?.id) {
      return BigInt(response.data.data.tenant.id);
    }

    return null;
  }

  private extractTargetTable(url: string): string | null {
    if (url.includes('/tenants')) return 'tenants';
    return null;
  }

  private extractTargetId(url: string, response: any): bigint | null {
    // URL'den ID çıkar
    const match = url.match(/\/tenants\/(\d+)/);
    if (match) {
      return BigInt(match[1]);
    }

    // Response'dan ID çıkar
    // ResponseInterceptor formatı kontrol et
    if (response?.data?.tenant?.id) {
      return BigInt(response.data.tenant.id);
    }
    if (response?.data?.data?.tenant?.id) {
      return BigInt(response.data.data.tenant.id);
    }
    if (response?.data?.id) {
      return BigInt(response.data.id);
    }
    if (response?.data?.data?.id) {
      return BigInt(response.data.data.id);
    }

    return null;
  }

  private generateDescription(
    actionType: string,
    body: any,
    response: any,
  ): string {
    // Response'dan veya body'den tenant adını çıkar
    let tenantName = 'Unknown';
    
    if (response?.data) {
      // Success response içinde data varsa
      if (response.data.tenant?.name) {
        tenantName = response.data.tenant.name;
      } else if (response.data.data?.tenant?.name) {
        tenantName = response.data.data.tenant.name;
      } else if (response.data.name) {
        tenantName = response.data.name;
      } else if (response.data.data?.name) {
        tenantName = response.data.data.name;
      }
    }
    
    // Body'den de kontrol et
    if (tenantName === 'Unknown' && body?.name) {
      tenantName = body.name;
    }

    switch (actionType) {
      case 'create_tenant':
        return `Yeni kafe oluşturuldu: ${tenantName}`;
      case 'update_tenant':
        return `Kafe güncellendi: ${tenantName}`;
      case 'delete_tenant':
        return `Kafe silindi: ${tenantName}`;
      case 'activate_tenant':
        return `Kafe aktif edildi: ${tenantName}`;
      case 'suspend_tenant':
        return `Kafe askıya alındı: ${tenantName}`;
      default:
        return `İşlem yapıldı: ${actionType}`;
    }
  }

  private async logActivity(data: {
    superAdminId: bigint;
    tenantId: bigint | null;
    actionType: string;
    targetTable: string | null;
    targetId: bigint | null;
    description: string;
  }) {
    await this.prisma.super_admin_activities.create({
      data: {
        super_admin_id: data.superAdminId,
        tenant_id: data.tenantId,
        action_type: data.actionType as any, // Prisma enum
        target_table: data.targetTable,
        target_id: data.targetId,
        description: data.description,
      },
    });
  }
}

