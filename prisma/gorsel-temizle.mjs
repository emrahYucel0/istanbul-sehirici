// prisma/gorsel-temizle.mjs
//
//     node --env-file=.env prisma/gorsel-temizle.mjs           → sadece rapor
//     node --env-file=.env prisma/gorsel-temizle.mjs --uygula  → yazar
//
// `/images/nakliye2.jpg` adresi PUBLIC KLASÖRDE YOK — yani bu değeri taşıyan
// bölgelerde görsel alanı dolu görünüyor ama sayfada kırık resim çıkıyor.
// Panelden tek tek temizlemek 71 kayıt demek; bu betik hepsini bir kerede
// null'a çekiyor.
//
// Neden '' değil de null: hâlihazırda boş olan kayıtların tamamı null ve
// görünüm katmanı ikisini de aynı şekilde (falsy) ele alıyor. Tek bir gösterim
// kullanmak, ileride "boş mu?" kontrolü yazan kodu ikircikli olmaktan kurtarır.
//
// imageAlt bilinçli olarak ELLENMİYOR: bu 71 kaydın hepsinde zaten null
// (kontrol edildi), dolayısıyla temizlenecek bir şey yok.
//
// ─────────────────────────────────────────────────────────────────────────
// MEDYA KÜTÜPHANESİYLE İLİŞKİSİ — YOK (M7'de denetlendi)
//
// Bu betik DOSYA SİLMİYOR. Yalnız `Region.image` alanındaki KIRIK bir
// referansı null'a çekiyor; ne `yuklemeler/` klasörüne ne de `StoredFile`
// tablosuna dokunuyor.
//
// Yani "aynı dosyayı iki farklı güvenlik kuralıyla silebilen CLI ve panel"
// durumu burada oluşmuyor: dosya silmenin TEK yolu medya kütüphanesi
// (server/domain/files/media.service.ts) ve o da referans kontrolünden
// geçiyor. Bu betik içerik alanı temizliği yapan ayrı bir araç.

import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const KIRIK_GORSEL = '/images/nakliye2.jpg'
// Boş metin de temizleniyor: panelden görsel silindiğinde alan '' olarak
// kaydediliyor, tohum betikleri ve kalan kayıtların tamamı ise null kullanıyor.
// İkisi de "görsel yok" demek; tek gösterimde birleştiriyoruz.
const TEMIZLENECEK = [KIRIK_GORSEL, '']
const uygula = process.argv.includes('--uygula')

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

try {
  const hedefler = await p.region.findMany({
    where: { image: { in: TEMIZLENECEK } },
    select: { slug: true, image: true, imageAlt: true, isActive: true },
    orderBy: { slug: 'asc' },
  })

  console.log(`kırık görsel (${KIRIK_GORSEL}): ${hedefler.filter((r) => r.image === KIRIK_GORSEL).length}`)
  console.log(`boş metin (''):              ${hedefler.filter((r) => r.image === '').length}`)
  console.log(`toplam temizlenecek:         ${hedefler.length}`)
  console.log(`  aktif: ${hedefler.filter((r) => r.isActive).length}  ·  pasif: ${hedefler.filter((r) => !r.isActive).length}`)

  const altDolu = hedefler.filter((r) => r.imageAlt !== null && r.imageAlt !== '')
  if (altDolu.length > 0) {
    console.log(`\n  UYARI: ${altDolu.length} kayıtta imageAlt dolu — görsel silinince alt metin sahipsiz kalır:`)
    for (const r of altDolu) console.log(`    ${r.slug}: ${r.imageAlt}`)
  }

  if (!uygula) {
    console.log('\nRapor modu. Yazmak için --uygula ekleyin.')
  } else {
    const sonuc = await p.region.updateMany({
      where: { image: { in: TEMIZLENECEK } },
      data: { image: null },
    })
    console.log(`\nGüncellendi: ${sonuc.count} kayıt`)

    const kalan = await p.region.count({ where: { image: { in: TEMIZLENECEK } } })
    console.log(`Kalan (kırık görsel + boş metin): ${kalan}`)
  }
} finally {
  await p.$disconnect()
}
