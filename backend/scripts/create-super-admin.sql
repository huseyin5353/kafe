-- Super Admin Oluşturma Scripti
-- Bu script ile manuel olarak super admin oluşturabilirsiniz

-- NOT: Şifre hash'ini oluşturmak için Node.js kullanın:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10, (err, hash) => console.log(hash));"

-- ÖRNEK SUPER ADMIN
-- Email: admin@kafe.com
-- Şifre: Admin123!
-- Hash: $2b$10$YourHashWillBeHere

INSERT INTO super_admins (
  username,
  email,
  password_hash,
  full_name,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin',
  'admin@kafe.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Şifre: Admin123!
  'Sistem Yöneticisi',
  '+905551234567',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING; -- Zaten varsa ekleme

-- Başka bir super admin eklemek için:
-- 1. Şifre hash'ini oluşturun (yukarıdaki komutu kullanın)
-- 2. Değerleri değiştirip tekrar çalıştırın

-- Super adminleri görüntülemek için:
-- SELECT id, username, email, full_name, role, is_active, created_at FROM super_admins;

