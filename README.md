# ☕ Kafe Yönetim Sistemi

Modern, multi-tenant kafe yönetim sistemi. Admin paneli ve müşteri uygulaması ile sipariş yönetimi, ürün katalog yönetimi ve gerçek zamanlı sipariş takibi sağlar.

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 14+** (React 19) - SSR & Routing
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI Components
- **Zustand** - State Management
- **React Query** - Data Fetching & Caching
- **Socket.IO Client** - Real-time Updates

### Backend
- **NestJS** - Node.js Framework
- **TypeScript** - Type Safety
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **Socket.IO** - WebSocket Server
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### Database
- **PostgreSQL** - Production-grade relational database
- **Prisma Studio** - Database Management GUI

## 📁 Proje Yapısı

```
kafe/
├── frontend/          # Next.js Frontend Application
│   ├── app/
│   │   ├── admin/    # Admin Panel Routes
│   │   ├── customer/ # Customer App Routes
│   │   └── api/      # API Routes (Next.js API)
│   ├── components/   # React Components
│   │   └── ui/       # shadcn/ui Components
│   └── lib/
│       ├── store/    # Zustand Stores
│       ├── api/      # API Client
│       └── hooks/    # Custom Hooks
├── backend/          # NestJS Backend Application
│   ├── src/
│   │   ├── auth/     # Authentication Module
│   │   ├── tenants/  # Multi-tenant Module
│   │   ├── products/ # Product Management
│   │   ├── orders/   # Order Management
│   │   ├── prisma/   # Prisma Service
│   │   └── events/   # WebSocket Gateway
│   └── prisma/
│       └── schema.prisma
└── docs/             # Documentation
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+ ve npm
- PostgreSQL 14+ (yerel kurulum)
- Git

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd kafe
```

### 2. PostgreSQL Kurulumu

**Windows:**
1. [PostgreSQL İndir](https://www.postgresql.org/download/windows/)
2. PostgreSQL 16'yı kurun (Port: 5432, User: postgres)
3. pgAdmin'de yeni veritabanı oluşturun: `kafe_db`

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb kafe_db
```

**Linux:**
```bash
sudo apt install postgresql-16
sudo systemctl start postgresql
sudo -u postgres createdb kafe_db
```

### 3. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# Prisma migrations çalıştır
npx prisma migrate dev

# Prisma Client oluştur
npx prisma generate

# Seed data (opsiyonel)
npm run seed

# Development server'ı başlat
npm run start:dev
```

Backend şu adreste çalışacaktır: http://localhost:3001

### 4. Frontend Kurulumu

```bash
cd ../frontend

# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

Frontend şu adreste çalışacaktır: http://localhost:3000

### 5. İlk Çalıştırma

```bash
# Backend'i başlatın (terminal 1)
cd backend
npm run start:dev

# Frontend'i başlatın (terminal 2)
cd frontend
npm run dev
```

### Erişim Adresleri
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: `npx prisma studio` (http://localhost:5555)

## 📊 Veritabanı Yönetimi

### Prisma Komutları

```bash
cd backend

# Yeni migration oluştur
npx prisma migrate dev --name migration_name

# Migration'ları çalıştır
npx prisma migrate deploy

# Prisma Studio'yu aç (GUI)
npx prisma studio

# Schema'yı sıfırla (DEV ONLY!)
npx prisma migrate reset
```

### Prisma Studio ile Veritabanı

Prisma Studio, veritabanınızı görsel olarak yönetmenizi sağlar:

```bash
cd backend
npx prisma studio
```

Browser'da http://localhost:5555 adresinde açılır.

### pgAdmin ile Veritabanı

PostgreSQL ile gelen pgAdmin'i kullanarak da veritabanını yönetebilirsiniz:
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Database**: kafe_db

## 🔐 Özellikler

### Multi-Tenant Yapı
- Her kafe ayrı tenant olarak yönetilir
- Tenant bazlı veri izolasyonu
- Custom domain desteği (opsiyonel)

### Kullanıcı Rolleri
- **SUPER_ADMIN**: Tüm sistemin yönetimi
- **ADMIN**: Tenant yönetimi
- **STAFF**: Personel işlemleri
- **CUSTOMER**: Müşteri siparişleri

### Admin Panel
- Dashboard & Analytics
- Ürün Yönetimi
- Kategori Yönetimi
- Sipariş Takibi
- Masa Yönetimi
- Personel Yönetimi
- QR Kod Oluşturma

### Müşteri Uygulaması
- Ürün Kataloğu
- Sepet Yönetimi
- QR ile Sipariş
- Gerçek Zamanlı Sipariş Durumu
- Sipariş Geçmişi

### Gerçek Zamanlı Özellikler
- Yeni sipariş bildirimleri
- Sipariş durum güncellemeleri
- Canlı masa durumu
- Kitchen Display System (KDS)

## 🧪 Test

```bash
# Backend testleri
cd backend
npm run test
npm run test:e2e

# Frontend testleri
cd frontend
npm run test
```

## 📝 API Dokümantasyonu

Backend çalışırken şu adresten Swagger dokümantasyonuna ulaşabilirsiniz:
http://localhost:3001/api-docs

## 🔒 Güvenlik

- JWT token tabanlı authentication
- bcrypt ile şifreli password saklama
- CORS yapılandırması
- Rate limiting (TODO)
- Input validation
- SQL injection koruması (Prisma)

## 🚧 Geliştirme Roadmap

- [ ] Email/SMS bildirimleri
- [ ] Ödeme entegrasyonu
- [ ] Raporlama ve Analytics
- [ ] Multi-language desteği
- [ ] Mobile app (React Native)
- [ ] Inventory yönetimi
- [ ] Loyalty program
- [ ] Online sipariş & Delivery

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 👥 İletişim

Proje Link: [https://github.com/yourusername/kafe](https://github.com/yourusername/kafe)

---

**⚡ Happy Coding!**

