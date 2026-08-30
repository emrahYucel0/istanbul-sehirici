// HİZMET DETAY ŞABLONU — İKİNCİ TUR CLAIM TEMİZLİĞİ + ARAMA BAŞLIĞI
//
// NEDEN İKİNCİ TUR
// Birinci tur (scripts/hizmet-iddialari.mjs) `title · subtitle · excerpt ·
// description · includes · content · metaDescription` alanlarını taramıştı.
// `faqs` TARANMAMIŞTI — ve doğrulanmamış taahhütlerin çoğu oradaydı. Sonuç:
// #73'ün `content` alanı "Teklif keşiften sonra netleşiyor" derken `faqs`
// hâlâ "teklifi keşiften sonra yazılı olarak veriyoruz" diyordu. Aynı
// sayfada birbirini yalanlayan iki cümle.
//
// BAĞLAMIYLA DOĞRULANDI — ÜÇ YANLIŞ POZİTİF DEĞİŞTİRİLMEDİ
//   · #79 "içeriği yazılıyor"       kutunun üstüne yazma fiili, taahhüt değil
//   · #77 "aynı güne denk gelmiyor" müşterinin takvimi, taahhüt değil
//   · #73/#78 "çoğu ... tek günde"  koşullu örüntü ifadesi, garanti değil
// Bunlar bilerek olduğu gibi bırakıldı.
//
// ARAMA BAŞLIĞI (metaTitle) — ŞABLON GENELİ SORUN
// Yedi kaydın da `metaTitle` alanı boştu; başlık "başlık | marka" olarak
// otomatik üretiliyordu. Ölçüldü:
//     ana sayfa            <title> İstanbul Evden Eve Nakliyat | Planlı Taşıma
//     /evden-eve-nakliyat  <title> Evden Eve Nakliyat | İstanbul Eve Nakliyat
// Ana sayfa, hizmetin kendi sayfasından daha güçlü hedefliyordu: aranan
// ifade başta ve "İstanbul" ile nitelenmiş. Detay sayfası aynı yarışa
// nitelenmemiş bir başlıkla giriyordu.
//
// AYRIM: ana sayfa COĞRAFİ + TİCARİ niyeti ("İstanbul'da kim taşıyor"),
// detay sayfası BİLGİ niyetini ("bu hizmet neyi kapsıyor, nasıl işliyor")
// alıyor. Başlıklar sayfanın KENDİ bölüm adlarından türetildi (01 KAPSAM,
// 02 NASIL YAPILIYOR) — uydurulmuş slogan yok. Marka eki bilerek yok:
// 60 karakterlik bütçenin 23'ünü markaya harcamak, işi niyet ayrımı yapmak
// olan bir başlıkta yanlış takas. H1 DEĞİŞMİYOR.
//
// KULLANIM
//   node --env-file=.env scripts/hizmet-iddialari-2.mjs          (uygula)
//   node --env-file=.env scripts/hizmet-iddialari-2.mjs --geri   (eskiye dön)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../prisma/generated/client/client.ts'

const YEDEK = 'scripts/.hizmet-iddia2-onceki.json'

/**
 * slug → düzeltmeler.
 *   metaTitle : yeni değer (yedisinde de eskisi null)
 *   alanlar   : [alan, eski, yeni]
 *   faqs      : [soru, eskiCevap, yeniCevap] — SORU ile eşleşiyor, dizi
 *               sırasına güvenmiyor; panelde sıra değişirse yanlış cevabı
 *               değiştirmesin diye eski cevap da tam olarak aranıyor.
 */
const DUZELTMELER = {
  'evden-eve-nakliyat': {
    metaTitle: 'Evden Eve Nakliyat Hizmeti: Kapsam ve Süreç',
    faqs: [
      [
        'Keşif ne kadar sürüyor?',
        'Ortalama bir daire için yarım saat civarında sürüyor. Adres görülmeden verilen rakamlar taşınma günü değişebildiği için teklifi keşiften sonra yazılı olarak veriyoruz.',
        'Ortalama bir daire için yarım saat civarında sürüyor. Adres görülmeden verilen rakamlar taşınma günü değişebildiği için teklifi keşiften sonra netleştiriyoruz.',
      ],
      [
        'Eşyalarım sigortalı mı taşınıyor?',
        'Taşıma sırasındaki hasarlara karşı sorumluluğumuz yazılı sözleşmede tanımlı. Kırılabilir ve yüksek değerli parçalar keşifte ayrı listeleniyor, ambalajları da ayrı yapılıyor.',
        'Taşıma sırasındaki hasarlara karşı sorumluluğumuzun kapsamını taşımadan önce sizinle netleştiriyoruz. Kırılabilir ve yüksek değerli parçalar keşifte ayrı listeleniyor, ambalajları da ayrı yapılıyor.',
      ],
    ],
  },

  'asansorlu-nakliyat': { metaTitle: 'Asansörlü Nakliyat Hizmeti: Kapsam ve Süreç' },

  'parca-esya-tasima': { metaTitle: 'Parça Eşya Taşıma Hizmeti: Kapsam ve Süreç' },

  'ofis-tasima': {
    metaTitle: 'Ofis ve İşyeri Taşıma Hizmeti: Kapsam ve Süreç',
    faqs: [
      [
        'Ofis taşıma kaç gün sürüyor?',
        'Küçük ve orta ölçekli ofislerin çoğu tek gecede tamamlanıyor ve ertesi sabah çalışılabiliyor. Büyük ofis ve depo taşımalarında iş hafta sonuna yayılabiliyor; süreyi eşya ve ekipman listesi çıktıktan sonra net olarak söylüyoruz.',
        'Küçük ve orta ölçekli ofisler çoğunlukla tek çalışma penceresine sığıyor. Büyük ofis ve depo taşımalarında iş hafta sonuna yayılabiliyor; süreyi eşya ve ekipman listesi çıktıktan sonra söylüyoruz.',
      ],
      [
        'Ofis taşıma fiyatı neye göre belirleniyor?',
        'Ekipman hacmi, kat ve yük asansörü durumu, söküm-montaj gerektiren mobilya miktarı ve çalışmanın mesai dışına alınıp alınmadığı. Kesin rakam yerinde keşif sonrası yazılı veriliyor.',
        'Ekipman hacmi, kat ve yük asansörü durumu, söküm-montaj gerektiren mobilya miktarı ve çalışmanın mesai dışına alınıp alınmadığı. Kesin rakam yerinde keşif sonrası netleşiyor.',
      ],
    ],
  },

  'esya-depolama': {
    metaTitle: 'Eşya Depolama Hizmeti: Kapsam ve Süreç',
    alanlar: [
      [
        'excerpt',
        'teslim gününde aynı ekiple yerleştiriliyor.',
        'teslim gününde yeni adrese yerleştiriliyor.',
      ],
      [
        'metaDescription',
        'teslim gününde aynı ekiple yerleştiriliyor.',
        'teslim gününde yeni adrese yerleştiriliyor.',
      ],
    ],
  },

  'sehirler-arasi-nakliyat': {
    metaTitle: 'Şehirler Arası Nakliyat Hizmeti: Kapsam ve Süreç',
    faqs: [
      [
        'Şehirler arası taşıma kaç gün sürüyor?',
        'Özel araçla yapılan taşımalarda çoğu güzergâh tek günde tamamlanıyor, uzak mesafelerde teslim ertesi güne kalabiliyor. Parsiyel seferde ise gün aralığı veriliyor. Kesin planı güzergâh ve seçtiğiniz araç tipine göre keşifte yazılı olarak söylüyoruz.',
        'Özel araçla yapılan taşımalarda çoğu güzergâh tek günde tamamlanıyor, uzak mesafelerde teslim ertesi güne kalabiliyor. Parsiyel seferde ise gün aralığı veriliyor. Kesin planı güzergâh ve seçtiğiniz araç tipine göre keşifte çıkarıyoruz.',
      ],
      [
        'Eşyalarım sigortalı mı taşınıyor?',
        'Taşıma sırasındaki hasarlara karşı sorumluluğumuz yazılı sözleşmede tanımlı. Kırılabilir ve yüksek değerli parçalar ayrı listeleniyor, ambalajları da ayrı yapılıyor.',
        'Taşıma sırasındaki hasarlara karşı sorumluluğumuzun kapsamını taşımadan önce sizinle netleştiriyoruz. Kırılabilir ve yüksek değerli parçalar ayrı listeleniyor, ambalajları da ayrı yapılıyor.',
      ],
    ],
  },

  'paketleme-hizmeti': { metaTitle: 'Paketleme ve Ambalajlama Hizmeti: Kapsam ve Süreç' },
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const bolum = await db.services.findFirst({ include: { services: { orderBy: { order: 'asc' } } } })
if (!bolum) throw new Error('Services bölümü bulunamadı')

if (process.argv.includes('--geri')) {
  if (!existsSync(YEDEK)) throw new Error(`Yedek yok: ${YEDEK}`)
  for (const k of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
    await db.service.update({ where: { id: k.id }, data: k.eski })
    console.log(`geri  #${k.id} ${k.slug} — ${Object.keys(k.eski).join(', ')}`)
  }
  console.log('\nEski değerler geri yüklendi.')
} else {
  const yedek = []
  for (const kayit of bolum.services) {
    const is = DUZELTMELER[kayit.slug ?? '']
    if (!is) continue
    const eski = {}
    const yeni = {}

    if (is.metaTitle) {
      eski.metaTitle = kayit.metaTitle
      yeni.metaTitle = is.metaTitle
      console.log(`baslik  #${kayit.id} ${kayit.slug} · ${is.metaTitle.length} kar`)
    }

    for (const [alan, aranan, yerine] of is.alanlar || []) {
      const mevcut = String(kayit[alan] ?? '')
      if (!mevcut.includes(aranan)) {
        console.log(`ATLANDI #${kayit.id} ${alan}: aranan metin bulunamadı`)
        continue
      }
      eski[alan] = kayit[alan]
      yeni[alan] = mevcut.replace(aranan, yerine)
      console.log(`alan    #${kayit.id} ${kayit.slug} · ${alan}`)
    }

    if (is.faqs) {
      const liste = Array.isArray(kayit.faqs) ? kayit.faqs : JSON.parse(String(kayit.faqs || '[]'))
      let degisti = false
      const yeniListe = liste.map((f) => {
        const bul = is.faqs.find((x) => x[0] === f?.question && x[1] === f?.answer)
        if (!bul) return f
        degisti = true
        console.log(`faq     #${kayit.id} ${kayit.slug} · "${f.question}"`)
        return { ...f, answer: bul[2] }
      })
      for (const e of is.faqs) {
        if (!liste.some((f) => f?.question === e[0] && f?.answer === e[1])) {
          console.log(`ATLANDI #${kayit.id} faq "${e[0]}": eski cevap eşleşmedi`)
        }
      }
      if (degisti) {
        eski.faqs = liste
        yeni.faqs = yeniListe
      }
    }

    if (!Object.keys(yeni).length) continue
    yedek.push({ id: kayit.id, slug: kayit.slug, eski })
    await db.service.update({ where: { id: kayit.id }, data: yeni })
  }
  writeFileSync(YEDEK, JSON.stringify(yedek, null, 1), 'utf8')
  console.log(`\nEski değerler ${YEDEK} içine yazıldı.`)
  console.log('Geri almak için: node --env-file=.env scripts/hizmet-iddialari-2.mjs --geri')
}

await db.$disconnect()
