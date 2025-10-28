# 🛠️ Development Guide

## Development Workflow

### 1. Branch Strategy

```
main                 # Production-ready code
├── develop          # Development branch
    ├── feature/*    # New features
    ├── bugfix/*     # Bug fixes
    └── hotfix/*     # Production hotfixes
```

### 2. Commit Convention

Bu proje **Conventional Commits** kullanır:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:
- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon değişikliği
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test ekleme/düzenleme
- `chore`: Build process, dependencies

**Örnekler**:
```bash
git commit -m "feat(products): add product filtering"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs: update API documentation"
```

## Development Scripts

### Frontend (Next.js)

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Backend (NestJS)

```bash
cd backend

# Development server (watch mode)
npm run start:dev

# Production build
npm run build

# Production server
npm run start:prod

# Linting
npm run lint

# Format code
npm run format

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Development

### Prisma Workflow

#### 1. Schema Değişikliği

```bash
# prisma/schema.prisma dosyasını düzenle

# Migration oluştur
npx prisma migrate dev --name add_new_field

# Prisma Client güncelle
npx prisma generate
```

#### 2. Database Reset (Development)

```bash
# Veritabanını sıfırla ve seed data çalıştır
npx prisma migrate reset

# Sadece seed data
npx prisma db seed
```

#### 3. Prisma Studio

```bash
# GUI ile veritabanını görüntüle
npx prisma studio
```

### Seed Data

`backend/prisma/seed.ts` dosyasını oluşturun:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Cafe',
      slug: 'demo-cafe',
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create categories and products...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

`package.json`'a ekle:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Environment Variables

### Frontend `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Backend `.env`

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kafe_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

## Code Style

### ESLint & Prettier

Her iki proje de ESLint ve Prettier kullanır.

**Format All Files**:
```bash
# Frontend
cd frontend && npm run format

# Backend
cd backend && npm run format
```

### TypeScript

- Strict mode enabled
- No `any` types
- Proper interface definitions

### Naming Conventions

- **Variables/Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case.ts
- **Components**: PascalCase.tsx

## Testing

### Frontend Testing

```bash
# Jest + React Testing Library
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Örnek Test**:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

**Örnek Test**:
```typescript
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Debugging

### VS Code Launch Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/frontend"
    },
    {
      "name": "NestJS: debug",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": ["${workspaceFolder}/backend/src/main.ts"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### Browser DevTools

- React DevTools
- Redux DevTools (if using)
- Network tab for API calls
- WebSocket inspector

## Performance Optimization

### Frontend

1. **Code Splitting**
```typescript
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <Loading />,
});
```

2. **Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/coffee.jpg"
  alt="Coffee"
  width={500}
  height={300}
  priority
/>
```

3. **React Query Caching**
```typescript
const { data } = useQuery({
  queryKey: ['products', tenantId],
  queryFn: () => fetchProducts(tenantId),
  staleTime: 60000, // 1 minute
});
```

### Backend

1. **Database Indexing**
```prisma
model Product {
  tenantId  String
  
  @@index([tenantId])
  @@index([categoryId])
}
```

2. **Query Optimization**
```typescript
// Include related data
const products = await prisma.product.findMany({
  include: {
    category: true,
  },
});

// Select specific fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
});
```

3. **Pagination**
```typescript
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.prisma.product.findMany({
      skip,
      take: limit,
    }),
    this.prisma.product.count(),
  ]);
  
  return { data, meta: { total, page, limit } };
}
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### 2. Prisma Client Out of Sync

```bash
npx prisma generate
```

#### 3. Database Connection Error

**Windows:**
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Restart database
Restart-Service postgresql*
```

**macOS:**
```bash
# Check PostgreSQL is running
brew services list

# Restart database
brew services restart postgresql@16
```

**Linux:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql
```

#### 4. Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. Build Errors

```bash
# Clear build cache
rm -rf .next dist

# Rebuild
npm run build
```

## Best Practices

### 1. Always Use TypeScript

```typescript
// ❌ Bad
const fetchData = (id) => { ... }

// ✅ Good
const fetchData = async (id: string): Promise<Data> => { ... }
```

### 2. Error Handling

```typescript
// ❌ Bad
const data = await fetch('/api/products');

// ✅ Good
try {
  const data = await fetch('/api/products');
  return data;
} catch (error) {
  console.error('Failed to fetch products:', error);
  throw new Error('Failed to fetch products');
}
```

### 3. Environment Variables

```typescript
// ❌ Bad
const API_URL = 'http://localhost:3001';

// ✅ Good
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

### 4. Component Organization

```typescript
// MyComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Count: {count}
      </Button>
    </div>
  );
}
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

