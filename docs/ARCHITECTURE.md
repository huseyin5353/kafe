# 🏗️ Mimari Dokümantasyonu

## Genel Mimari

Bu proje, modern bir **monorepo** yapısında, **multi-tenant** SaaS mimarisini benimsemektedir.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌─────────────┐              ┌──────────────┐          │
│  │ Admin Panel │              │ Customer App │          │
│  └──────┬──────┘              └──────┬───────┘          │
│         │                            │                  │
└─────────┼────────────────────────────┼──────────────────┘
          │                            │
          └────────────┬───────────────┘
                       │
         ┌─────────────▼──────────────┐
         │      API Gateway (NestJS)   │
         │  - CORS                     │
         │  - Authentication           │
         │  - Validation               │
         └─────────────┬───────────────┘
                       │
         ┌─────────────┴───────────────┐
         │                             │
    ┌────▼────┐                   ┌────▼────┐
    │   REST  │                   │ WebSocket│
    │   API   │                   │ (Socket.IO)│
    └────┬────┘                   └────┬────┘
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Business Logic     │
         │  ┌────────────────┐  │
         │  │ Auth Module    │  │
         │  │ Tenant Module  │  │
         │  │ Product Module │  │
         │  │ Order Module   │  │
         │  └────────────────┘  │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │    Prisma ORM        │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │    PostgreSQL        │
         │  - Multi-tenant DB   │
         │  - JSONB support     │
         └──────────────────────┘
```

## Katmanlar

### 1. Presentation Layer (Frontend)

**Teknoloji**: Next.js 14 (App Router), React 19, TypeScript

#### Admin Panel (`/app/admin`)
- Dashboard & Analytics
- Product & Category Management
- Order Management (KDS)
- Table Management
- Staff Management
- Tenant Settings

#### Customer App (`/app/customer`)
- Product Catalog
- Shopping Cart
- Order Placement
- Order Tracking
- Order History

**State Management**:
- **Zustand**: Global state (auth, cart)
- **React Query**: Server state, caching

### 2. API Gateway Layer (Backend)

**Teknoloji**: NestJS, TypeScript

#### Sorumluluklar:
- Request validation
- Authentication & Authorization
- Rate limiting
- CORS handling
- Response formatting
- Error handling

### 3. Business Logic Layer

**Modüler Mimari** - Her domain ayrı module:

#### Auth Module
- User registration/login
- JWT token management
- Password hashing (bcrypt)
- Role-based access control

#### Tenant Module
- Tenant CRUD operations
- Tenant settings management
- Multi-tenant isolation

#### Product Module
- Product CRUD
- Category management
- Stock tracking
- Image upload

#### Order Module
- Order creation
- Order status management
- Order history
- Real-time order updates

### 4. Data Access Layer

**Prisma ORM**:
- Type-safe database queries
- Migration management
- Schema-first approach
- Connection pooling

### 5. Database Layer

**PostgreSQL**:
- ACID transactions
- JSONB for flexible data
- Full-text search
- Indexing for performance

## Multi-Tenant Mimari

### Tenant Isolation Strategy

**Shared Database, Shared Schema** yaklaşımı kullanılmıştır:

```typescript
// Her tablo tenantId ile filtrelenir
model Product {
  id        String  @id
  name      String
  tenantId  String  // Her kayıtta tenant bilgisi
  
  tenant    Tenant  @relation(fields: [tenantId])
  
  @@index([tenantId])  // Performance için index
}
```

### Avantajları:
- ✅ Kolay bakım
- ✅ Cost-effective
- ✅ Kolay yedekleme
- ✅ Tenant arası veri paylaşımı mümkün

### Dezavantajları:
- ❌ Tenant izolasyonu application level
- ❌ Noisy neighbor problemi potansiyeli

## Real-Time Mimari

**Socket.IO** ile WebSocket bağlantısı:

```typescript
// Client tarafı (Frontend)
socket.emit('joinTenant', tenantId);

// Server tarafı (Backend)
socket.to(`tenant:${tenantId}`).emit('newOrder', order);
```

### Use Cases:
- Yeni sipariş bildirimleri (Admin)
- Sipariş durum güncellemeleri (Customer)
- Kitchen Display updates
- Table status changes

## Güvenlik Mimarisi

### Authentication Flow

```
1. User login → POST /api/auth/login
2. Server validates credentials
3. JWT token generated
4. Token returned to client
5. Client stores in localStorage/cookie
6. Subsequent requests include token in header
7. Server validates token on each request
```

### Authorization

**Role-Based Access Control (RBAC)**:

```typescript
enum UserRole {
  SUPER_ADMIN,  // Full system access
  ADMIN,        // Tenant management
  STAFF,        // Limited tenant operations
  CUSTOMER,     // Customer-only operations
}
```

### Guards & Decorators

```typescript
@UseGuards(JwtAuthGuard)  // Authentication check
@Roles('ADMIN')           // Role check
@Get('products')
findAll() { }
```

## Database Schema Design

### Core Entities

```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       ├──────┬──────────┬──────────┬─────────┐
       │      │          │          │         │
   ┌───▼──┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼─────┐ ┌─▼─────┐
   │ User │ │Category│ │Product │ │ Table │ │ Order │
   └──────┘ └────┬───┘ └───┬────┘ └───────┘ └───┬───┘
                 │         │                     │
                 └─────────┼─────────────────────┘
                           │
                      ┌────▼────────┐
                      │  OrderItem  │
                      └─────────────┘
```

### Key Relationships

- **1:N** - Tenant → Users, Products, Orders
- **1:N** - Category → Products
- **1:N** - Order → OrderItems
- **N:1** - OrderItem → Product

## Caching Strategy

### Frontend (React Query)
```typescript
{
  staleTime: 60000,     // 1 minute
  cacheTime: 300000,    // 5 minutes
  refetchOnWindowFocus: true,
}
```

### Backend (Future: Redis)
- Session storage
- Rate limiting
- Real-time data caching

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│            Load Balancer (Nginx)          │
└───────────┬──────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
┌───▼────┐      ┌────▼────┐
│Frontend│      │ Backend │
│(Vercel)│      │(Railway)│
└────────┘      └────┬────┘
                     │
              ┌──────┴──────┐
              │             │
         ┌────▼────┐   ┌────▼────┐
         │  PostgreSQL │   │  Redis  │
         │ (Supabase)  │   │(Upstash)│
         └─────────────┘   └─────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Load balancing
- Database connection pooling

### Vertical Scaling
- Database optimization
- Index tuning
- Query optimization

### Future Improvements
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Message queue (RabbitMQ/Bull)
- [ ] Microservices migration

## Performance Optimization

### Frontend
- Code splitting
- Image optimization (Next.js Image)
- Lazy loading
- Memoization

### Backend
- Database indexing
- Query optimization
- Pagination
- Response compression

### Database
- Proper indexing
- Query planning
- Connection pooling
- Batch operations

## Monitoring & Logging

### Application Monitoring
- Request/Response logging
- Error tracking
- Performance metrics

### Database Monitoring
- Query performance
- Connection pool status
- Slow query log

### Real-time Monitoring
- WebSocket connection count
- Message throughput
- Error rates

