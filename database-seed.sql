-- Örnek Test Verileri
-- Bu dosyayı çalıştırmadan önce database-setup.sql'i çalıştırın

\c kafe_db;

-- Demo Tenant
INSERT INTO "Tenant" ("id", "name", "slug", "domain", "isActive", "createdAt", "updatedAt")
VALUES 
    ('tenant_demo_1', 'Demo Cafe', 'demo-cafe', 'demo.kafe.com', true, NOW(), NOW()),
    ('tenant_demo_2', 'Star Coffee', 'star-coffee', 'star.kafe.com', true, NOW(), NOW());

-- Demo Users (şifre: admin123 - bcrypt hash)
-- NOT: Gerçek uygulamada bcrypt ile hash'lenmiş şifreler kullanın
INSERT INTO "User" ("id", "email", "password", "name", "phone", "role", "tenantId", "isActive", "createdAt", "updatedAt")
VALUES 
    ('user_admin_1', 'admin@demo.com', '$2b$10$XqLw3qGqWqxQy1qV1qV1qeZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5Q', 'Admin User', '+905551234567', 'ADMIN', 'tenant_demo_1', true, NOW(), NOW()),
    ('user_staff_1', 'staff@demo.com', '$2b$10$XqLw3qGqWqxQy1qV1qV1qeZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5Q', 'Staff User', '+905551234568', 'STAFF', 'tenant_demo_1', true, NOW(), NOW()),
    ('user_customer_1', 'customer@demo.com', '$2b$10$XqLw3qGqWqxQy1qV1qV1qeZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5Q', 'Customer User', '+905551234569', 'CUSTOMER', NULL, true, NOW(), NOW());

-- Demo Categories
INSERT INTO "Category" ("id", "name", "description", "icon", "sortOrder", "tenantId", "isActive", "createdAt", "updatedAt")
VALUES 
    ('cat_hot_drinks', 'Sıcak İçecekler', 'Kahve, çay ve sıcak içecekler', '☕', 1, 'tenant_demo_1', true, NOW(), NOW()),
    ('cat_cold_drinks', 'Soğuk İçecekler', 'Soğuk kahve ve içecekler', '🥤', 2, 'tenant_demo_1', true, NOW(), NOW()),
    ('cat_desserts', 'Tatlılar', 'Pastalar ve tatlılar', '🍰', 3, 'tenant_demo_1', true, NOW(), NOW()),
    ('cat_snacks', 'Atıştırmalıklar', 'Sandviç ve atıştırmalıklar', '🥪', 4, 'tenant_demo_1', true, NOW(), NOW());

-- Demo Products
INSERT INTO "Product" ("id", "name", "description", "price", "cost", "categoryId", "tenantId", "stock", "isActive", "createdAt", "updatedAt")
VALUES 
    ('prod_1', 'Americano', 'Klasik Americano kahve', 35.00, 15.00, 'cat_hot_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_2', 'Cappuccino', 'İtalyan cappuccino', 40.00, 18.00, 'cat_hot_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_3', 'Latte', 'Sütlü latte', 42.00, 20.00, 'cat_hot_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_4', 'Espresso', 'İtalyan espresso', 30.00, 12.00, 'cat_hot_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_5', 'Ice Latte', 'Buzlu latte', 45.00, 22.00, 'cat_cold_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_6', 'Frappe', 'Buzlu frappe', 48.00, 24.00, 'cat_cold_drinks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_7', 'Cheesecake', 'Frambuazlı cheesecake', 65.00, 30.00, 'cat_desserts', 'tenant_demo_1', 50, true, NOW(), NOW()),
    ('prod_8', 'Brownie', 'Çikolatalı brownie', 45.00, 20.00, 'cat_desserts', 'tenant_demo_1', 50, true, NOW(), NOW()),
    ('prod_9', 'Tost', 'Karışık tost', 55.00, 25.00, 'cat_snacks', 'tenant_demo_1', 100, true, NOW(), NOW()),
    ('prod_10', 'Sandviç', 'Tavuklu sandviç', 60.00, 28.00, 'cat_snacks', 'tenant_demo_1', 100, true, NOW(), NOW());

-- Demo Tables
INSERT INTO "Table" ("id", "number", "capacity", "tenantId", "isOccupied", "createdAt", "updatedAt")
VALUES 
    ('table_1', 'T-01', 2, 'tenant_demo_1', false, NOW(), NOW()),
    ('table_2', 'T-02', 4, 'tenant_demo_1', false, NOW(), NOW()),
    ('table_3', 'T-03', 4, 'tenant_demo_1', false, NOW(), NOW()),
    ('table_4', 'T-04', 6, 'tenant_demo_1', false, NOW(), NOW()),
    ('table_5', 'T-05', 2, 'tenant_demo_1', false, NOW(), NOW());

-- Demo Order
INSERT INTO "Order" ("id", "orderNumber", "type", "status", "tenantId", "userId", "tableId", "subtotal", "tax", "discount", "total", "createdAt", "updatedAt")
VALUES 
    ('order_1', 'ORD-2024-0001', 'DINE_IN', 'PENDING', 'tenant_demo_1', 'user_customer_1', 'table_2', 117.00, 10.53, 0, 127.53, NOW(), NOW());

-- Demo Order Items
INSERT INTO "OrderItem" ("id", "orderId", "productId", "quantity", "price", "total", "createdAt", "updatedAt")
VALUES 
    ('orderitem_1', 'order_1', 'prod_2', 2, 40.00, 80.00, NOW(), NOW()),
    ('orderitem_2', 'order_1', 'prod_7', 1, 65.00, 65.00, NOW(), NOW());

