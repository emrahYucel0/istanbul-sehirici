// prisma/hizmet-metinleri-tohum.mjs
//
//     npm run hizmet-metinleri
//
// HİZMET METİNLERİNDEKİ DEVİR İFADELERİ.
//
// `/hizmetlerimiz` V2'ye taşınırken içerikte iki tür sorun kaldı:
//
//   1) DOĞRULANMAMIŞ İDDİA — "ücretsiz keşif", "net fiyat", "sigortalı ve
//      kayıt altında" gibi ifadeler. Bunlar bir söz veriyor ama arkasında
//      doğrulanabilir bir dayanak yok. Hizmetin NE OLDUĞU anlatılabilir,
//      ne VAAT ETTİĞİ anlatılamaz.
//
//   2) KONUMLANDIRMA ÇELİŞKİSİ — "81 il", "Türkiye genelinde". Şehirler
//      arası taşıma yapmak ile ana konumlandırmanın Türkiye çapı olması
//      aynı şey değil. Site İstanbul odaklı; hizmet İstanbul ÇIKIŞLI.
//
// Yöntem `ayar-metinleri-tohum.mjs` ile aynı: alan yalnız BİLİNEN eski
// değerin aynısıysa değişir. Panelden sonradan elle yazılmış metin ezilmez,
// betik tekrar çalıştırılabilir.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

/** Bölüm girişi — eskiden 900 karakterlik bir SEO paragrafıydı. */
const BOLUM_ACIKLAMA = {
  eskisi:
    'Tek bir koltuğun taşınmasından koca bir villanın yeni adresine ulaştırılmasına kadar, her taşınmanın kendine özgü bir planı olmalı. Bir öğrenci evini taşımakla dört yatak odalı bir villayı taşımak aynı yöntemi gerektirmez; bir ofisi hafta sonu içinde nakletmekle bir eşyayı depoya kaldırmak farklı ekip, farklı araç ve farklı zaman planlaması ister. Bu yüzden hizmetlerimizi tek bir "nakliyat paketi" olarak değil, ihtiyacınıza göre bağımsız bağımsız kurgulanmış çözümler olarak sunuyoruz. Aşağıda ihtiyacınıza en uygun hizmeti bulabilir, dilerseniz birden fazlasını (örneğin ofis taşıma + eşya depolama) aynı anda talep edebilirsiniz. Her hizmetimiz aynı temel prensiple çalışır: önce ücretsiz keşif, sonra net fiyat, sonra sigortalı ve kayıt altında taşıma.',
  yenisi:
    'Bir öğrenci odasıyla dört yatak odalı bir daire aynı planla taşınmıyor: araç, ekip ve süre baştan farklı kuruluyor. Aşağıdaki yedi hizmet birbirinin alternatifi değil; çoğu taşımada ikisi ya da üçü birlikte çalışıyor.',
}

/** Hizmet bazlı devir metinleri. Anahtar `slug`. */
const HIZMETLER = {
  'evden-eve-nakliyat': {
    includes: {
      eskisi: 'Ücretsiz yerinde keşif ve yazılı teklif',
      yenisi: 'Yerinde keşif ve yazılı teklif',
    },
  },
  'sehirler-arasi-nakliyat': {
    subtitle: {
      eskisi: '81 ile taşıma, yazılı teslim planı',
      yenisi: 'İstanbul çıkışlı, yazılı teslim planı',
    },
    description: {
      eskisi:
        'Türkiye genelinde şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı keşifte yazılı olarak belirleniyor.',
      yenisi:
        'İstanbul çıkışlı şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı keşifte yazılı olarak belirleniyor.',
    },
    excerpt: {
      eskisi:
        'Uzun yolda ambalaj standardı yükseliyor, teslim günü aralık olarak baştan bildiriliyor. 81 ilde hizmet veriyoruz.',
      yenisi:
        'Uzun yolda ambalaj standardı yükseliyor; teslim günü bir aralık olarak baştan bildiriliyor.',
    },
    includes: {
      eskisi: 'Türkiye genelinde 81 il',
      yenisi: 'İstanbul çıkışlı tek yön ya da gidiş-dönüş',
    },
  },
}

const yaz = async (kayit, alan, { eskisi, yenisi }) => {
  const mevcut = String(kayit[alan] ?? '').trim()
  if (mevcut === yenisi) return { durum: 'güncel' }
  if (mevcut !== eskisi) return { durum: 'atlandı' }
  await p.service.update({ where: { id: kayit.id }, data: { [alan]: yenisi } })
  return { durum: 'devredildi' }
}

// ── Bölüm girişi ───────────────────────────────────────────────────────────
const bolum = await p.services.findFirst()
if (bolum) {
  const mevcut = String(bolum.description ?? '').trim()
  if (mevcut === BOLUM_ACIKLAMA.yenisi) console.log('  güncel      bölüm girişi')
  else if (mevcut === BOLUM_ACIKLAMA.eskisi) {
    await p.services.update({ where: { id: bolum.id }, data: { description: BOLUM_ACIKLAMA.yenisi } })
    console.log(`  devredildi  bölüm girişi  (${mevcut.length} → ${BOLUM_ACIKLAMA.yenisi.length} karakter)`)
  } else console.log('  atlandı     bölüm girişi  (elle değiştirilmiş, korundu)')
}

// ── Hizmetler ──────────────────────────────────────────────────────────────
for (const [slug, alanlar] of Object.entries(HIZMETLER)) {
  const kayit = await p.service.findFirst({ where: { slug } })
  if (!kayit) {
    console.log(`  bulunamadı  ${slug}`)
    continue
  }
  for (const [alan, deger] of Object.entries(alanlar)) {
    if (alan === 'includes') {
      // `includes` bir JSON dizisi; yalnız eşleşen MADDE değişiyor.
      const liste = Array.isArray(kayit.includes) ? [...kayit.includes] : []
      const i = liste.indexOf(deger.eskisi)
      if (liste.includes(deger.yenisi)) console.log(`  güncel      ${slug}.includes`)
      else if (i === -1) console.log(`  atlandı     ${slug}.includes  (madde bulunamadı)`)
      else {
        liste[i] = deger.yenisi
        await p.service.update({ where: { id: kayit.id }, data: { includes: liste } })
        console.log(`  devredildi  ${slug}.includes[${i}]`)
      }
      continue
    }
    const { durum } = await yaz(kayit, alan, deger)
    console.log(`  ${durum.padEnd(11)} ${slug}.${alan}`)
  }
}

await p.$disconnect()
