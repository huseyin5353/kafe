# 🗄️ Veritabanı Kurulum Rehberi

## 1. PostgreSQL'de Boş Veritabanı Oluşturma

### pgAdmin ile (Grafik Arayüz)

1. **pgAdmin'i açın**
2. Sol panelden **Servers → PostgreSQL 15 → Databases**
3. **Databases** üzerine sağ tık → **Create → Database**
4. Database name: `kafe_db`
5. Owner: `postgres`
6. **Save** tıklayın

### psql ile (Komut Satırı)

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanını oluştur
CREATE DATABASE kafe_db;

# Çıkış
\q
```

## 2. SQL Dosyalarını Çalıştırma

### Yöntem 1: pgAdmin ile

1. **pgAdmin'de kafe_db veritabanına sağ tık**
2. **Query Tool** seçin
3. **Open File** (klasör ikonu) tıklayın
4. `database-setup.sql` dosyasını seçin
5. **Execute** (▶️ play) butonuna tıklayın
6. İşlem bitince aynı şekilde `database-seed.sql` dosyasını çalıştırın (opsiyonel)

### Yöntem 2: psql ile

```bash
# Kurulum SQL'ini çalıştır
psql -U postgres -d kafe_db -f database-setup.sql

# Örnek verileri yükle (opsiyonel)
psql -U postgres -d kafe_db -f database-seed.sql
```

### Yöntem 3: PowerShell ile (Windows)

```powershell
# Proje dizinine gidin
cd C:\kafe

# PostgreSQL'e bağlan ve SQL'i çalıştır
Get-Content database-setup.sql | psql -U postgres -d kafe_db

# Örnek verileri yükle (opsiyonel)
Get-Content database-seed.sql | psql -U postgres -d kafe_db
```

## 3. Backend .env Dosyasını Ayarlama

Backend klasöründe `.env` dosyasını oluşturun veya güncelleyin:

```env
# Database
DATABASE_URL="postgresql://postgres:SIFRANIZ@localhost:5432/kafe_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

**NOT:** `SIFRANIZ` kısmını PostgreSQL'in postgres kullanıcı şifresi ile değiştirin!

## 4. Backend'i Başlatın

```bash
cd backend

# Prisma Client'ı oluştur
npx prisma generate

# Backend'i başlat
npm run start:dev
```

## 5. Veritabanını Görüntüleme

### Prisma Studio ile (Önerilen)

```bash
cd backend
npx prisma studio
```

→ http://localhost:5555 adresinde açılır

### pgAdmin ile

1. pgAdmin'i açın
2. **Servers → PostgreSQL 15 → Databases → kafe_db → Schemas → public → Tables**
3. Tabloları görebilirsiniz

## 📊 Oluşturulan Tablolar

### database-setup.sql ile oluşturulan tablolar:

1. **Tenant** - Kafe/İşletme bilgileri (multi-tenant)
2. **User** - Kullanıcılar (Admin, Staff, Customer)
3. **Category** - Ürün kategorileri
4. **Product** - Ürünler
5. **Table** - Masalar
6. **Order** - Siparişler
7. **OrderItem** - Sipariş detayları

### Özellikler:
- ✅ Primary Keys
- ✅ Foreign Keys (ilişkiler)
- ✅ Indexes (performans)
- ✅ Unique Constraints
- ✅ Enums (UserRole, OrderStatus, OrderType)
- ✅ Triggers (updatedAt otomatik güncelleme)

## 📝 Örnek Veriler (database-seed.sql)

Örnek veriler içerir:
- 2 Demo Cafe (Tenant)
- 3 Kullanıcı (Admin, Staff, Customer)
- 4 Kategori (Sıcak/Soğuk İçecek, Tatlı, Atıştırmalık)
- 10 Ürün
- 5 Masa
- 1 Örnek Sipariş

## 🔍 Veritabanını Test Etme

```sql
-- pgAdmin Query Tool veya psql'de çalıştırın

-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Tenant'ları göster
SELECT * FROM "Tenant";

-- Ürünleri göster
SELECT p.name, p.price, c.name as category
FROM "Product" p
JOIN "Category" c ON p."categoryId" = c.id;

-- Siparişleri göster
SELECT o."orderNumber", o.status, o.total, u.name as customer
FROM "Order" o
JOIN "User" u ON o."userId" = u.id;
```

## ❗ Sorun Giderme

### "Permission denied" hatası
```bash
# PostgreSQL servisinin çalıştığını kontrol edin
Get-Service -Name postgresql*

# Şifre doğru olmalı
# Eğer şifreyi bilmiyorsanız, PostgreSQL'i yeniden kurun
```

### "Database already exists" hatası
```bash
# Mevcut veritabanını silip yeniden oluşturun
psql -U postgres
DROP DATABASE kafe_db;
CREATE DATABASE kafe_db;
\q
```

### Tabloları sıfırlama
```sql
-- Tüm tabloları sil (DİKKAT: Tüm veriler silinir!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Sonra database-setup.sql'i tekrar çalıştırın
```

## 📚 Kaynaklar

- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)
- [pgAdmin Kullanımı](https://www.pgadmin.org/docs/)
- [Prisma Dokümantasyonu](https://www.prisma.io/docs)

