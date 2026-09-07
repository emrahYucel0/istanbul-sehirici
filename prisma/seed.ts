import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/client/client.ts';
import * as bcrypt from 'bcryptjs';

// Prisma 7: bağlantı artık şemadan değil, driver adapter'dan geliyor.
// DATABASE_URL'i `npm run seed` komutundaki --env-file=.env yüklüyor.
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL as string),
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} ortam değişkeni tanımlı değil. .env dosyasını kontrol edin.`);
  }
  return value;
}

/**
 * TEK YÖNETİCİ HESABI.
 *
 * Önce iki hesap tohumlanıyordu; ikisi de devralınan projeden geliyordu.
 * Erişim rotasyonunda ikinci hesap kaldırıldı: kaç kişinin girebildiği
 * belirsiz olan fazladan bir yönetici, tek başına bir risk. Bu dizinin
 * iki girdisi kalsaydı `npm run seed` silinen hesabı geri getirirdi.
 *
 * Kimlik bilgileri KODDA DEĞİL: `.env` (gitignore'lu) üzerinden okunuyor
 * ve eksikse süreç hata veriyor — yer tutucu bir parola asla üretilmiyor.
 */
const admins = [
  { email: requireEnv('SEED_ADMIN_1_EMAIL'), password: requireEnv('SEED_ADMIN_1_PASSWORD') },
];

async function seed() {
  const saltRounds = 10;

  try {
    for (const { email, password } of admins) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const admin = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
          email,
          password: hashedPassword,
          role: 'admin',
        },
      });

      console.log('Admin kullanıcısı oluşturuldu/güncellendi:', admin.email);
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
