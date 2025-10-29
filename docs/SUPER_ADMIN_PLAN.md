# 🎯 SUPER ADMIN - KAPSAMLI GELİŞTİRME PLANI

## 📊 Veritabanı Analizi

Super Admin'in erişebileceği tablolar:
- ✅ `tenants` - Kafeler (Ana yönetim)
- ✅ `users` - Kafe kullanıcıları (Görüntüleme)
- ✅ `super_admin_activities` - Kendi aktiviteleri
- ✅ `super_admin_login_history` - Giriş logları
- ✅ `audit_logs` - Sistem audit logları
- ✅ `orders`, `menu_item`, `customers` vs. - İstatistikler için

---

## 🎨 SUPER ADMIN ÖZELLİKLERİ

### 1️⃣ **TENANT (KAFE) YÖNETİMİ** 🏪 (ÖNCELİK #1)

#### Backend API Endpoints:
```typescript
POST   /api/tenants                 // Yeni kafe ekle
GET    /api/tenants                 // Tüm kafeleri listele (pagination, search, filter)
GET    /api/tenants/:id             // Kafe detayı
PUT    /api/tenants/:id             // Kafe güncelle
DELETE /api/tenants/:id             // Kafe sil (soft delete)
PATCH  /api/tenants/:id/status      // Aktif/Pasif yap
GET    /api/tenants/:id/stats       // Kafe istatistikleri
```

#### Frontend Sayfalar:
```
/super-admin/cafes
  ├── page.tsx                      // Liste (tablo, arama, filtreleme)
  ├── new/page.tsx                  // Yeni kafe ekle
  ├── [id]/edit/page.tsx           // Kafe düzenle
  └── [id]/view/page.tsx           // Kafe detayları

Components:
  ├── CafeTable.tsx                // Kafe tablosu
  ├── CafeForm.tsx                 // Kafe ekleme/düzenleme formu
  ├── CafeStats.tsx                // Kafe istatistikleri
  └── CafeFilters.tsx              // Arama ve filtreleme
```

#### Özellikler:
- ✅ **Ekleme:**
  - Kafe bilgileri (name, business_name, email, phone)
  - Subdomain (slug) - benzersizlik kontrolü
  - Kafe sahibi bilgileri (otomatik user oluşturma)
  - Para birimi, timezone
  - Başlangıç ayarları (settings JSON)

- ✅ **Listeleme:**
  - Tablo görünümü (DataTable)
  - Sayfalama (pagination)
  - Arama (name, email, slug)
  - Filtreleme (aktif/pasif, oluşturma tarihi)
  - Sıralama (isim, tarih, durum)
  - Toplu işlemler (çoklu seçim)

- ✅ **Düzenleme:**
  - Tüm bilgileri güncelleme
  - Slug değiştirme (dikkatli!)
  - Settings güncelleme

- ✅ **Silme:**
  - Soft delete (is_active = false)
  - Onay dialogu
  - İlişkili verileri gösterme (kaç user, order vs.)

- ✅ **Durum Yönetimi:**
  - Aktif/Pasif toggle
  - Suspend (askıya alma)

---

### 2️⃣ **DASHBOARD & İSTATİSTİKLER** 📊 (ÖNCELİK #2)

#### Backend API:
```typescript
GET /api/super-admin/stats          // Genel istatistikler
GET /api/super-admin/analytics      // Detaylı analizler
```

#### Dashboard Kartları:
```typescript
1. Genel İstatistikler:
   - Toplam Kafe Sayısı (aktif/pasif)
   - Toplam Kullanıcı Sayısı (tüm kafelerden)
   - Toplam Sipariş Sayısı (bugün/hafta/ay)
   - Toplam Gelir (TRY)

2. Grafikler:
   - Aylık yeni kafe grafiği (son 6 ay)
   - Sipariş trendi (son 30 gün)
   - En aktif kafeler (top 10)
   - Kullanıcı büyüme grafiği

3. Son Aktiviteler:
   - Yeni eklenen kafeler (son 5)
   - Son yapılan işlemler (super_admin_activities)
   - Sistem uyarıları

4. Hızlı İşlemler:
   - ➕ Yeni Kafe Ekle
   - 📋 Kafeleri Görüntüle
   - 📊 Raporlar
   - ⚙️ Ayarlar
```

#### Frontend:
```
/super-admin/dashboard/page.tsx     // Ana dashboard
Components:
  ├── StatsCards.tsx                // İstatistik kartları
  ├── TenantGrowthChart.tsx         // Grafik
  ├── RecentActivities.tsx          // Son aktiviteler
  └── QuickActions.tsx              // Hızlı aksiyonlar
```

---

### 3️⃣ **KULLANICI YÖNETİMİ (Görüntüleme)** 👥 (ÖNCELİK #3)

#### Backend API:
```typescript
GET /api/super-admin/users          // Tüm tenant kullanıcıları
GET /api/super-admin/users/:id      // Kullanıcı detayı
```

#### Frontend:
```
/super-admin/users
  └── page.tsx                      // Kullanıcı listesi (read-only)

Özellikler:
  - Tüm kafelerden kullanıcıları görme
  - Filtreleme (tenant, role, aktif/pasif)
  - Arama (isim, email)
  - Kullanıcı detayları modal
  - Hangi kafeye ait olduğunu gösterme
```

---

### 4️⃣ **AKTİVİTE LOGGİNG** 📝 (ÖNCELİK #4)

#### Backend API:
```typescript
GET /api/super-admin/activities     // Kendi aktiviteleri
GET /api/super-admin/audit-logs     // Sistem audit logları
```

#### Frontend:
```
/super-admin/activities/page.tsx    // Aktivite logları

Özellikler:
  - super_admin_activities tablosundan
  - Yaptığı tüm işlemleri görme
  - Filtreleme (action_type, tenant, tarih)
  - Timeline görünümü
```

---

### 5️⃣ **PROFİL YÖNETİMİ** 👤 (ÖNCELİK #5)

#### Backend API:
```typescript
GET    /api/super-admin/profile        // Profil bilgileri
PUT    /api/super-admin/profile        // Profil güncelle
PUT    /api/super-admin/change-password // Şifre değiştir
```

#### Frontend:
```
/super-admin/profile/page.tsx       // Profil sayfası

Özellikler:
  - Bilgileri görüntüleme (username, email, full_name, phone)
  - Bilgileri düzenleme
  - Şifre değiştirme
  - Son giriş bilgileri
  - Aktivite özeti
```

---

### 6️⃣ **RAPORLAR** 📈 (ÖNCELİK #6)

#### Backend API:
```typescript
GET /api/super-admin/reports/tenants    // Kafe raporları
GET /api/super-admin/reports/revenue    // Gelir raporları
GET /api/super-admin/reports/orders     // Sipariş raporları
```

#### Frontend:
```
/super-admin/reports
  ├── page.tsx                      // Rapor ana sayfası
  ├── tenants/page.tsx              // Kafe raporları
  └── revenue/page.tsx              // Gelir raporları

Özellikler:
  - Tarih aralığı seçimi
  - Kafe bazlı filtreleme
  - Excel export
  - Grafik gösterimleri
```

---

## 🛠️ TEKNIK DETAYLAR

### Backend Yapısı:
```
backend/src/
├── super-admin/
│   ├── super-admin.module.ts
│   ├── super-admin-auth.controller.ts
│   ├── super-admin-auth.service.ts        ✅ (Mevcut)
│   ├── super-admin.controller.ts          🆕
│   ├── super-admin.service.ts             🆕
│   ├── dto/
│   │   ├── super-admin-login.dto.ts       ✅ (Mevcut)
│   │   ├── update-profile.dto.ts          🆕
│   │   └── change-password.dto.ts         🆕
│   └── guards/
│       └── super-admin.guard.ts           🆕
│
├── tenants/
│   ├── tenants.module.ts                  🆕
│   ├── tenants.controller.ts              🆕
│   ├── tenants.service.ts                 🆕
│   └── dto/
│       ├── create-tenant.dto.ts           🆕
│       ├── update-tenant.dto.ts           🆕
│       └── tenant-query.dto.ts            🆕
│
└── common/
    ├── decorators/
    │   └── current-user.decorator.ts      🆕
    └── interceptors/
        └── activity-logger.interceptor.ts 🆕
```

### Frontend Yapısı:
```
frontend/
├── app/super-admin/
│   ├── layout.tsx                         ✅ (Mevcut)
│   ├── login/page.tsx                     ✅ (Mevcut)
│   ├── dashboard/page.tsx                 ✅ (Mevcut - Güncellenecek)
│   │
│   ├── cafes/
│   │   ├── page.tsx                       🆕 Liste
│   │   ├── new/page.tsx                   🆕 Yeni ekle
│   │   └── [id]/
│   │       ├── edit/page.tsx              🆕 Düzenle
│   │       └── view/page.tsx              🆕 Detay
│   │
│   ├── users/
│   │   └── page.tsx                       🆕 Kullanıcı listesi
│   │
│   ├── activities/
│   │   └── page.tsx                       🆕 Aktivite logları
│   │
│   ├── profile/
│   │   └── page.tsx                       🆕 Profil
│   │
│   └── reports/
│       ├── page.tsx                       🆕 Raporlar
│       ├── tenants/page.tsx               🆕
│       └── revenue/page.tsx               🆕
│
├── components/super-admin/
│   ├── CafeTable.tsx                      🆕
│   ├── CafeForm.tsx                       🆕
│   ├── CafeStats.tsx                      🆕
│   ├── StatsCards.tsx                     🆕
│   ├── UserTable.tsx                      🆕
│   └── ActivityTimeline.tsx               🆕
│
└── lib/
    ├── api/
    │   ├── super-admin-auth.ts            ✅ (Mevcut)
    │   ├── tenants.ts                     🆕
    │   └── super-admin.ts                 🆕
    │
    └── hooks/
        ├── useSuperAdminAuth.ts           ✅ (Mevcut)
        └── useTenants.ts                  🆕
```

---

## 📅 GELİŞTİRME SIRASI (Önerilen)

### **SPRINT 1: Tenant CRUD (Core)**
**Süre:** 2-3 saat

1. Backend:
   - ✅ Tenants module, controller, service
   - ✅ Create, Read, Update, Delete endpoints
   - ✅ DTO'lar ve validation
   - ✅ Slug benzersizlik kontrolü

2. Frontend:
   - ✅ Kafe listesi sayfası (tablo)
   - ✅ Yeni kafe ekleme formu
   - ✅ Kafe düzenleme formu
   - ✅ API entegrasyonu

**Sonuç:** Super Admin kafeleri ekleyebilir, düzenleyebilir

---

### **SPRINT 2: Dashboard Dinamik Hale Getirme**
**Süre:** 1-2 saat

1. Backend:
   - ✅ Stats endpoint
   - ✅ İstatistikleri hesaplama

2. Frontend:
   - ✅ Dashboard'ı dinamik yap
   - ✅ Gerçek verilerle göster
   - ✅ Hızlı aksiyonları aktif et

**Sonuç:** Dashboard canlı verilerle çalışır

---

### **SPRINT 3: Profil & Activity Logging**
**Süre:** 1-2 saat

1. Backend:
   - ✅ Profile endpoints
   - ✅ Change password
   - ✅ Activity logging interceptor

2. Frontend:
   - ✅ Profil sayfası
   - ✅ Aktivite sayfası

**Sonuç:** Super Admin profilini yönetebilir, aktivitelerini görür

---

### **SPRINT 4: Kullanıcı Görüntüleme & Raporlar**
**Süre:** 2-3 saat

1. Backend:
   - ✅ Users listing endpoint
   - ✅ Reports endpoints

2. Frontend:
   - ✅ Kullanıcı listesi
   - ✅ Rapor sayfaları

**Sonuç:** Super Admin tüm sistemi izleyebilir

---

## 🎯 ÖZELLİK ÖNCELİK SIRASI

| # | Özellik | Önem | Süre |
|---|---------|------|------|
| 1 | Tenant CRUD | 🔴 Kritik | 2-3h |
| 2 | Dashboard Stats | 🟠 Yüksek | 1-2h |
| 3 | Profil Yönetimi | 🟡 Orta | 1h |
| 4 | Activity Logs | 🟡 Orta | 1h |
| 5 | Kullanıcı Listesi | 🟢 Düşük | 1h |
| 6 | Raporlar | 🟢 Düşük | 2-3h |

**Toplam Süre:** ~8-12 saat

---

## 🚀 İLK ADIM ÖNERİSİ

**Seçenek A: Komple Tenant CRUD** (2-3 saat)
- Backend + Frontend tamamen
- Test edilmiş, çalışır durumda

**Seçenek B: Adım Adım**
1. Backend Tenant endpoints (30 dk)
2. Kafe listesi sayfası (30 dk)
3. Yeni kafe formu (45 dk)
4. Düzenleme formu (30 dk)

**Seçenek C: Backend Önce**
- Tüm backend'i bitir
- Sonra frontend'e geç

---

## 📋 KULLANILACAK TEKNOLOJİLER

### Backend:
- ✅ NestJS
- ✅ Prisma ORM
- ✅ Class Validator (DTO validation)
- ✅ JWT (Authentication)
- ✅ Winston (Logging)

### Frontend:
- ✅ Next.js 14+
- ✅ TypeScript
- ✅ shadcn/ui (DataTable, Form, Dialog)
- ✅ TanStack Table (Tablo)
- ✅ React Hook Form + Zod
- ✅ Recharts (Grafikler)
- ✅ Zustand (State)
- ✅ React Query (Data fetching)

---

## 💡 SONUÇ

**Super Admin'in Yapabileceği Her Şey:**

1. ✅ **Kafe Yönetimi** - Ekle, düzenle, sil, aktif/pasif yap
2. ✅ **Dashboard** - Tüm sistem istatistiklerini gör
3. ✅ **Kullanıcılar** - Tüm tenant kullanıcılarını gör
4. ✅ **Aktiviteler** - Kendi yaptığı işlemleri takip et
5. ✅ **Profil** - Kendi bilgilerini yönet
6. ✅ **Raporlar** - Gelir, sipariş, kafe raporları

**Hazır mısınız? Hangi seçenekle başlayalım?** 🚀


