// Şifre Hash Oluşturma Utility
// Kullanım: node backend/scripts/hash-password.js "YourPassword123!"

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Hata: Şifre parametresi gerekli!');
  console.log('📖 Kullanım: node backend/scripts/hash-password.js "YourPassword"');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Hash oluşturma hatası:', err);
    process.exit(1);
  }

  console.log('✅ Şifre hash\'i oluşturuldu:\n');
  console.log('Şifre:', password);
  console.log('Hash:', hash);
  console.log('\n📋 SQL kullanımı:');
  console.log(`password_hash: '${hash}'`);
});

