// HİZMET KAYITLARINDA DOĞRULANMAMIŞ TAAHHÜTLERİN NÖTRLEŞTİRİLMESİ.
//
// NEDEN
// /hizmetlerimiz dizininde bir veri bağlama hatası vardı; düzeltilince yedi
// hizmetin `includes` maddeleri ilk kez ekrana çıktı. Çıkan metinlerde
// işletme gerçeği doğrulanmamış taahhütler görüldü:
//
//   · "yazılı teklif" / "yazılı teslim günü"  — teklifin BİÇİMİ hakkında söz
//   · "aynı gece tamamlanıyor" / "ertesi sabah teslim" — kesin süre sözü
//   · "belediye izni bize ait"                — iznin kesin alınacağı sözü
//   · "duvarlara zarar vermeden"              — hasarsızlık sözü
//
// Aynı iddialar ana sayfa ve fiyat sayfası tarafında daha önce koddan
// temizlenmişti (bkz. price/SonrakiAdim.vue, article/IstanbulDistrictView.vue).
// Bunlar kodda değil VERİDE olduğu için buradan düzeltiliyor: panel sahipliği
// bozulmuyor, bileşene metin gömülmüyor.
//
// NE DEĞİŞMİYOR
// Anlam. Her cümlede çıkarılan tek şey taahhüt; hizmetin ne yaptığı aynı
// kalıyor. Süreç anlatımı ("keşiften sonra netleşiyor") duruyor, garanti
// ("yazılı veriliyor") gidiyor.
//
// KAPSAM
// Yalnız yayında olan yedi kaydın ilgili alanları. `content` ve
// `metaDescription` de herkese açık olduğu için dahil; başka alan, başka
// kayıt ve pasif içerik ellenmiyor.
//
// KULLANIM
//   node --env-file=.env scripts/hizmet-iddialari.mjs          (uygula)
//   node --env-file=.env scripts/hizmet-iddialari.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.hizmet-iddia-onceki.json'

/**
 * slug → [alan, eski, yeni] üçlüleri.
 *
 * Eski metin TAM olarak yazılı: kısmi eşleşme yerine tam dize aranıyor ki
 * kayıt panelden değişmişse betik sessizce yanlış yeri düzeltmesin.
 */
const DUZELTMELER = {
  'evden-eve-nakliyat': [
    ['includes', 'Yerinde keşif ve yazılı teklif', 'Yerinde keşif ve kapsam çıkarımı'],
    [
      'content',
      'Teklif keşiften sonra yazılı veriliyor — telefonda tahmini rakam söyleyip taşınma günü değiştirmiyoruz.',
      'Teklif keşiften sonra netleşiyor — telefonda tahmini rakam söyleyip taşınma günü değiştirmiyoruz.',
    ],
  ],
  'asansorlu-nakliyat': [
    [
      'excerpt',
      'Merdiven boşluğundan geçmeyen eşyalar dış cephe asansörüyle pencereden indiriliyor. Belediye izni ve kurulum bize ait.',
      'Merdiven boşluğundan geçmeyen eşyalar dış cephe asansörüyle pencereden indiriliyor. Belediye izin başvurusu ve kurulum bizde.',
    ],
    [
      'description',
      'Merdivenden taşımanın riskli olduğu yüksek katlarda, cephe asansörümüzle eşyalarınızı bina duvarlarına zarar vermeden indiriyoruz.',
      'Merdivenden taşımanın riskli olduğu yüksek katlarda, cephe asansörümüzle eşyalarınızı merdiven boşluğuna sokmadan pencereden indiriyoruz.',
    ],
  ],
  'ofis-tasima': [
    [
      'excerpt',
      'Ofis, atölye ve depo taşımaları mesai saatleri dışına planlanıyor; kurulum aynı gece tamamlanıyor.',
      'Ofis, atölye ve depo taşımaları mesai saatleri dışına planlanıyor; kurulum da aynı çalışma penceresine giriyor.',
    ],
    [
      'description',
      'Ofis, atölye ve depo taşımalarını çalışma saatlerinin dışında planlıyor, ertesi sabah çalışabilir hâlde teslim ediyoruz.',
      'Ofis, atölye ve depo taşımalarını çalışma saatlerinin dışında planlıyor, kurulumu aynı plana yazıyoruz.',
    ],
    [
      'content',
      'kurulum aynı gece tamamlanıyor ve ertesi sabah çalışılabilir hâlde teslim ediliyor',
      'kurulum da aynı çalışma penceresine planlanıyor',
    ],
  ],
  'sehirler-arasi-nakliyat': [
    ['subtitle', 'İstanbul çıkışlı, yazılı teslim planı', 'İstanbul çıkışlı, planlı teslim'],
    [
      'description',
      'İstanbul çıkışlı şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı keşifte yazılı olarak belirleniyor.',
      'İstanbul çıkışlı şehirler arası taşımalarda güzergâh, teslim günü ve ambalaj standardı keşifte belirleniyor.',
    ],
    ['includes', 'Yazılı teslim günü ya da gün aralığı', 'Teslim günü ya da gün aralığı planı'],
    [
      'metaDescription',
      'teslim günü bir aralık olarak baştan yazılı bildiriliyor.',
      'teslim günü bir aralık olarak baştan bildiriliyor.',
    ],
  ],
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const bolum = await db.services.findFirst({ include: { services: { orderBy: { order: 'asc' } } } })
if (!bolum) throw new Error('Services bölümü bulunamadı')

const geri = process.argv.includes('--geri')

if (geri) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  for (const k of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
    await db.service.update({ where: { id: k.id }, data: k.eski })
    console.log(`↩︎  #${k.id} ${k.slug} — ${Object.keys(k.eski).join(', ')}`)
  }
  console.log('\nEski değerler geri yüklendi.')
} else {
  const yedek = []
  for (const kayit of bolum.services) {
    const isler = DUZELTMELER[kayit.slug ?? '']
    if (!isler) continue

    const eski = {}
    const yeni = {}
    for (const [alan, aranan, yerine] of isler) {
      if (alan === 'includes') {
        const dizi = Array.isArray(kayit.includes) ? kayit.includes : []
        const i = dizi.indexOf(aranan)
        if (i === -1) {
          console.log(`⚠  #${kayit.id} ${alan}: "${aranan}" bulunamadı, atlandı`)
          continue
        }
        eski.includes = dizi
        yeni.includes = dizi.map((d) => (d === aranan ? yerine : d))
      } else {
        const mevcut = String(kayit[alan] ?? '')
        if (!mevcut.includes(aranan)) {
          console.log(`⚠  #${kayit.id} ${alan}: aranan metin bulunamadı, atlandı`)
          continue
        }
        eski[alan] = kayit[alan]
        yeni[alan] = mevcut.replace(aranan, yerine)
      }
      console.log(`✔  #${kayit.id} ${kayit.slug} · ${alan}`)
    }

    if (Object.keys(yeni).length === 0) continue
    yedek.push({ id: kayit.id, slug: kayit.slug, eski })
    await db.service.update({ where: { id: kayit.id }, data: yeni })
  }
  writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
  console.log(`\nEski değerler ${YEDEK} içine yazıldı.`)
  console.log('Geri almak için: node --env-file=.env scripts/hizmet-iddialari.mjs --geri')
}

await db.$disconnect()
