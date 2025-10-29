const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 1. Tenant'ı bul
  const tenant = await prisma.tenants.findUnique({
    where: { slug: 'deneme4' }, // Değiştir
  });

  if (!tenant) {
    console.error('Tenant bulunamadı! Önce tenant oluşturun.');
    process.exit(1);
  }

  // 2. Şifreyi hashle
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // 3. Kullanıcıyı oluştur
  const user = await prisma.users.create({
    data: {
      tenant_id: tenant.id,
      username: 'test_admin',
      email: 'test@example.com',
      password_hash: hashedPassword,
      full_name: 'Test Admin',
      role: 'admin',
      is_active: true,
    },
  });

  console.log('✅ Kullanıcı oluşturuldu:', {
    id: user.id.toString(),
    username: user.username,
    tenant: tenant.name,
  });
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


