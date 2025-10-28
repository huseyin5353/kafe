# 🚀 Deployment Guide

## Production Deployment

### Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis (opsiyonel)
- Domain name
- SSL certificate

## Deployment Options

### Option 1: Cloud Platforms (Önerilen)

#### Frontend - Vercel

1. **Vercel'e Deploy**:
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

2. **Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

3. **Domain Configuration**:
- Vercel dashboard → Settings → Domains
- Add custom domain
- Configure DNS records

#### Backend - Railway/Render/Fly.io

**Railway**:

1. Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

2. Deploy:
```bash
cd backend
railway init
railway up
```

3. Add PostgreSQL:
```bash
railway add postgresql
```

4. Environment Variables:
```
DATABASE_URL=<provided by Railway>
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

#### Database - Supabase/Neon

**Supabase**:

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Run migrations:
```bash
DATABASE_URL="<supabase-url>" npx prisma migrate deploy
```

### Option 2: VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install nginx -y
```

#### 2. Clone & Setup

```bash
# Clone repository
git clone <your-repo-url>
cd kafe

# Backend setup
cd backend
npm install
npm run build

# Frontend setup
cd ../frontend
npm install
npm run build
```

#### 3. Database Setup

```bash
# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE kafe_db;
CREATE USER kafe_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE kafe_db TO kafe_user;
\q
```

```bash
# Update backend/.env with production database URL
# DATABASE_URL="postgresql://kafe_user:your_secure_password@localhost:5432/kafe_db"

# Run migrations
cd backend
npx prisma migrate deploy
```

#### 4. Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd backend
pm2 start dist/main.js --name kafe-backend

# Start frontend
cd ../frontend
pm2 start npm --name kafe-frontend -- start

# Save PM2 configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

#### 5. Nginx Configuration

`/etc/nginx/sites-available/kafe`:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/kafe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Environment Variables

### Production Checklist

```bash
# Backend
DATABASE_URL=<production-db-url>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

## Database Migrations

```bash
# Production migration
DATABASE_URL="<production-url>" npx prisma migrate deploy

# Seed production data
DATABASE_URL="<production-url>" npm run seed
```

## Monitoring & Logging

### Application Monitoring

**Sentry**:

```bash
npm install @sentry/nextjs @sentry/node

# Initialize
npx @sentry/wizard -i nextjs
```

**LogRocket**:

```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

### Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Check logs
pm2 logs
docker-compose logs -f

# Monitor resources
htop
```

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
crontab -e

# Add:
0 2 * * * docker exec kafe_postgres pg_dump -U postgres kafe_db > /backup/db_$(date +\%Y\%m\%d).sql
```

### Application Backups

```bash
# Backup files
tar -czf backup_$(date +%Y%m%d).tar.gz /path/to/kafe

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).tar.gz s3://your-bucket/backups/
```

## Security Checklist

- [ ] Use HTTPS (SSL/TLS)
- [ ] Set strong JWT secret
- [ ] Enable CORS properly
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Firewall configuration
- [ ] Secure headers (Helmet.js)
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection
- [ ] CSRF protection

## Performance Optimization

### Frontend

```typescript
// next.config.js
module.exports = {
  compress: true,
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### Backend

```typescript
// Enable compression
import * as compression from 'compression';
app.use(compression());

// Enable caching
import { CacheModule } from '@nestjs/cache-manager';
```

### Database

```sql
-- Create indexes
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Analyze performance
EXPLAIN ANALYZE SELECT * FROM products WHERE tenant_id = 'xxx';
```

## Rollback Strategy

```bash
# PM2 rollback
pm2 list
pm2 reload all --update-env

# Docker rollback
docker-compose down
docker-compose up -d

# Database rollback
npx prisma migrate resolve --rolled-back <migration-name>
```

## Health Checks

```typescript
// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

## Support

For deployment issues:
- Check logs: `pm2 logs` or `docker-compose logs`
- Review environment variables
- Verify database connection
- Check firewall rules
- Monitor resource usage

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [PM2 Docs](https://pm2.keymetrics.io/docs)
- [Nginx Docs](https://nginx.org/en/docs)

