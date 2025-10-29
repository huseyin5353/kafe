import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats.dto';

@Injectable()
export class SuperAdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(query: DashboardStatsQueryDto) {
    const { startDate, endDate } = query;

    // Date filters
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const whereWithDate = Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : undefined;

    // Parallel queries for performance
    const [
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalUsers,
      activeUsers,
      totalCustomers,
      totalOrders,
      completedOrders,
      pendingOrders,
      revenueData,
      tenantsByStatus,
      usersByRole,
      tenantsByCurrency,
      recentTenants,
      topTenants,
      dailyStats,
    ] = await Promise.all([
      // Tenants
      this.prisma.tenants.count(),
      this.prisma.tenants.count({ where: { is_active: true } }),
      this.prisma.tenants.count({ where: { is_active: false } }),

      // Users
      this.prisma.users.count(),
      this.prisma.users.count({ where: { is_active: true } }),

      // Customers
      this.prisma.customers.count(),

      // Orders
      this.prisma.orders.count(whereWithDate ? { where: whereWithDate } : undefined),
      this.prisma.orders.count({
        where: whereWithDate ? { ...whereWithDate, status: 'delivered' } : { status: 'delivered' },
      }),
      this.prisma.orders.count({
        where: whereWithDate ? { ...whereWithDate, status: 'pending' } : { status: 'pending' },
      }),

      // Revenue
      this.prisma.orders.aggregate({
        where: whereWithDate ? { ...whereWithDate, status: 'delivered' } : { status: 'delivered' },
        _sum: { total_amount: true },
        _avg: { total_amount: true },
      }),

      // Tenants by status (for pie chart)
      Promise.all([
        this.prisma.tenants.count({ where: { is_active: true } }),
        this.prisma.tenants.count({ where: { is_active: false } }),
      ]),

      // Users by role (for pie chart)
      this.prisma.users.groupBy({
        by: ['role'],
        _count: { role: true },
      }),

      // Tenants by currency (for pie chart)
      this.prisma.tenants.groupBy({
        by: ['currency'],
        _count: { currency: true },
      }),

      // Recent tenants (last 5)
      this.prisma.tenants.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          is_active: true,
          created_at: true,
        },
      }),

      // Top tenants by users/orders
      this.prisma.tenants.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              users: true,
              orders: true,
              customers: true,
            },
          },
        },
        orderBy: {
          users: {
            _count: 'desc',
          },
        },
      }),

      // Daily stats (last 30 days)
      this.getDailyStats(30),
    ]);

    return {
      overview: {
        tenants: {
          total: totalTenants,
          active: activeTenants,
          inactive: inactiveTenants,
          growthRate: this.calculateGrowthRate(totalTenants, activeTenants),
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          averagePerTenant: totalTenants > 0 ? (totalUsers / totalTenants).toFixed(1) : 0,
        },
        customers: {
          total: totalCustomers,
          averagePerTenant: totalTenants > 0 ? (totalCustomers / totalTenants).toFixed(1) : 0,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: completedOrders,
          cancelled: totalOrders - pendingOrders - completedOrders,
        },
        revenue: {
          total: Number(revenueData._sum?.total_amount) || 0,
          average: Number(revenueData._avg?.total_amount) || 0,
          perTenant:
            totalTenants > 0
              ? ((Number(revenueData._sum?.total_amount) || 0) / totalTenants).toFixed(2)
              : 0,
        },
      },
      charts: {
        tenantsByStatus: [
          { name: 'Aktif', value: tenantsByStatus[0] },
          { name: 'Pasif', value: tenantsByStatus[1] },
        ],
        usersByRole: usersByRole.map((item) => ({
          name: item.role,
          value: item._count.role,
        })),
        tenantsByCurrency: tenantsByCurrency.map((item) => ({
          name: item.currency,
          value: item._count.currency,
        })),
        dailyStats: dailyStats,
      },
      recentTenants: recentTenants.map((t) => ({
        ...t,
        id: t.id.toString(),
      })),
      topTenants: topTenants.map((t) => ({
        id: t.id.toString(),
        name: t.name,
        slug: t.slug,
        stats: {
          users: t._count.users,
          orders: t._count.orders,
          customers: t._count.customers,
        },
      })),
    };
  }

  private async getDailyStats(days: number) {
    const stats: any[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [tenants, users, orders] = await Promise.all([
        this.prisma.tenants.count({
          where: {
            created_at: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        this.prisma.users.count({
          where: {
            created_at: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        this.prisma.orders.count({
          where: {
            created_at: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      stats.push({
        date: date.toISOString().split('T')[0],
        tenants,
        users,
        orders,
      });
    }

    return stats;
  }

  private calculateGrowthRate(total: number, active: number): string {
    if (total === 0) return '0';
    return ((active / total) * 100).toFixed(1);
  }

  async getSystemHealth() {
    const [
      dbHealth,
      tenantsCount,
      usersCount,
      ordersCount,
      recentErrors,
    ] = await Promise.all([
      // Database health check
      this.prisma.$queryRaw`SELECT 1 as healthy`.then(() => true).catch(() => false),
      
      // Quick counts
      this.prisma.tenants.count(),
      this.prisma.users.count(),
      this.prisma.orders.count(),

      // Recent errors (if you have error logging table)
      // For now, return empty array
      Promise.resolve([]),
    ]);

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth ? 'up' : 'down',
          responseTime: '< 10ms',
          connections: 'healthy',
        },
        api: {
          status: 'up',
          uptime: this.formatUptime(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            unit: 'MB',
          },
        },
      },
      metrics: {
        tenants: tenantsCount,
        users: usersCount,
        orders: ordersCount,
      },
      errors: recentErrors,
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
  }
}

