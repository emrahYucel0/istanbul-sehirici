// prisma/hizmet-detay-tohum.mjs
//
//     npm run hizmet-detay
//
// HİZMET DETAY SAYFALARININ İÇERİK/İDDİA TEMİZLİĞİ.
//
// Yedi hizmetin `metaDescription`, `content` ve `faqs` alanlarında devir
// ifadeleri kaldı. İki tür:
//
//   1) DOĞRULANMAMIŞ İDDİA — "ücretsiz keşif", "yazılı sabit fiyat",
//      "sigortalı taşıma" (blanket), "aynı gün teklif". Hizmetin NE OLDUĞU
//      anlatılabilir, ne VAAT ETTİĞİ anlatılamaz.
//   2) KONUMLANDIRMA ÇELİŞKİSİ — "81 il", "Türkiye genelinde". Şehirler
//      arası taşıma yapmak ile ana konumlandırmanın Türkiye çapı olması
//      aynı şey değil. Site İstanbul odaklı; hizmet İstanbul ÇIKIŞLI.
//
// Ayrıca yedi `metaDescription` birbirinin hizmet adı değiştirilmiş
// kopyasıydı (hepsi aynı üç iddiayla bitiyordu). Yenileri her hizmetin
// KENDİ operasyonel farkını söylüyor.
//
// YÖNTEM: alan yalnız BİLİNEN eski değerin aynısıysa değişir. Panelden
// sonradan elle yazılmış metin ezilmez; betik tekrar çalıştırılabilir.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

/** slug → { alan: { eskisi, yenisi } } */
const DEVIR = {
  'evden-eve-nakliyat': {
    metaDescription: {
      eskisi:
        'Evden eve nakliyat: keşiften yerleştirmeye kadar tüm aşamalar tek ekipte. Sigortalı taşıma, marangozlu söküm-montaj ve yazılı sabit fiyat. Ücretsiz keşif.',
      yenisi:
        "İstanbul'da evden eve nakliyat: keşif, ambalajlama, söküm, taşıma ve yerleştirme tek ekipte. Araç erişimi, merdiven ve asansör keşifte ölçülüyor.",
    },
    content: {
      eskisi:
        'Bu üçü süreyi ve dolayısıyla fiyatı belirleyen asıl kalemler. Keşif ücretsiz ve teklif keşiften sonra yazılı veriliyor — telefonda tahmini rakam söyleyip taşınma günü değiştirmiyoruz.',
      yenisi:
        'Bu üçü süreyi ve dolayısıyla fiyatı belirleyen asıl kalemler. Teklif keşiften sonra yazılı veriliyor — telefonda tahmini rakam söyleyip taşınma günü değiştirmiyoruz.',
    },
    faq: {
      soru: 'Keşif ücretli mi, ne kadar sürer?',
      yeniSoru: 'Keşif ne kadar sürüyor?',
      eskisi:
        'Keşif ücretsiz. Ortalama bir daire için yarım saat civarında sürüyor. Adres görülmeden verilen rakamlar taşınma günü değişebildiği için teklifi keşiften sonra yazılı olarak veriyoruz.',
      yenisi:
        'Ortalama bir daire için yarım saat civarında sürüyor. Adres görülmeden verilen rakamlar taşınma günü değişebildiği için teklifi keşiften sonra yazılı olarak veriyoruz.',
    },
  },

  'asansorlu-nakliyat': {
    metaDescription: {
      eskisi:
        'Asansörlü nakliyat: merdivenden geçmeyen eşyalar dış cephe asansörüyle pencereden indirilir. Belediye izni ve sigortalı taşıma bizden. Ücretsiz keşif.',
      yenisi:
        'Asansörlü nakliyat: merdiven boşluğundan geçmeyen parçalar dış cephe asansörüyle indiriliyor. Binanın uygunluğu ve yol izni keşifte değerlendiriliyor.',
    },
  },

  'parca-esya-tasima': {
    metaDescription: {
      eskisi:
        'Parça eşya taşıma: tek koltuk veya birkaç kutu için tüm ev fiyatı ödemeyin. Parsiyel seferle sigortalı ve ambalajlı taşıma. Aynı gün teklif alın.',
      yenisi:
        'Parça eşya taşıma: tek mobilya ya da birkaç koli için parsiyel sefer. Tam araç tutmadan, aynı güzergâhtaki başka yüklerle birlikte planlanıyor.',
    },
  },

  'ofis-tasima': {
    metaDescription: {
      eskisi:
        'Ofis, atölye ve depo taşıma: iş akışınız durmasın diye mesai dışına planlanır, kurulum aynı gece tamamlanır. Sigortalı taşıma ve yazılı sabit fiyat.',
      yenisi:
        'Ofis, atölye ve depo taşıma: mesai dışına planlanıyor, dosya ve elektronik ekipman numaralandırılıp yeni adreste aynı düzene kuruluyor.',
    },
  },

  'esya-depolama': {
    metaDescription: {
      eskisi:
        'Eşya depolama: çıkış ve giriş tarihiniz uyuşmuyorsa eşyanız ambalajlı hâlde güvenli depoda bekler, teslim gününde aynı ekiple gelir. Ücretsiz keşif.',
      yenisi:
        'Eşya depolama: çıkış ve giriş tarihleri arasında eşya ambalajlı ve etiketli olarak bekliyor, teslim gününde aynı ekiple yerleştiriliyor.',
    },
  },

  'sehirler-arasi-nakliyat': {
    metaDescription: {
      eskisi:
        'Şehirler arası nakliyat: 81 ile sigortalı ve ambalajlı taşıma, teslim günü baştan yazılı bildirilir. Marangozlu montaj dahil. Ücretsiz keşif alın.',
      yenisi:
        'İstanbul çıkışlı şehirler arası nakliyat: uzun yolda ambalaj standardı yükseliyor, teslim günü bir aralık olarak baştan yazılı bildiriliyor.',
    },
    faq: {
      soru: 'Hangi illere taşıma yapıyorsunuz?',
      eskisi:
        'Türkiye genelinde 81 ile taşıma yapıyoruz. Bölgenizin sayfasında o güzergâhta nasıl çalıştığımızı, yol ve mevsim koşullarının plana nasıl girdiğini ayrıntısıyla anlatıyoruz.',
      yenisi:
        'Taşımalar İstanbul çıkışlı planlanıyor; varış ili güzergâha göre değerlendiriliyor. Yol ve mevsim koşullarının plana nasıl girdiğini keşifte birlikte çıkarıyoruz.',
    },
  },

  'paketleme-hizmeti': {
    metaDescription: {
      eskisi:
        'Paketleme ve ambalajlama hizmeti: mutfak, cam ve elektronik eşya ayrı standartla paketlenir. Malzeme ekibimizden, sigortalı taşıma. Ücretsiz keşif.',
      yenisi:
        'Paketleme ve ambalajlama: mutfak, cam, tablo ve elektronik parçalar ayrı standartla sarılıyor. Oda oda etiketleniyor, içerik listesi çıkarılıyor.',
    },
  },
}

let degisen = 0

for (const [slug, alanlar] of Object.entries(DEVIR)) {
  const kayit = await p.service.findFirst({ where: { slug } })
  if (!kayit) {
    console.log(`  bulunamadı  ${slug}`)
    continue
  }
  const veri = {}

  for (const alan of ['metaDescription', 'content']) {
    const d = alanlar[alan]
    if (!d) continue
    const mevcut = String(kayit[alan] ?? '')
    if (mevcut.includes(d.yenisi)) { console.log(`  güncel      ${slug}.${alan}`); continue }
    if (!mevcut.includes(d.eskisi)) { console.log(`  atlandı     ${slug}.${alan}  (elle değiştirilmiş)`); continue }
    // `content` uzun HTML: yalnız ilgili CÜMLE değişiyor, gövde korunuyor.
    veri[alan] = mevcut.replace(d.eskisi, d.yenisi)
    console.log(`  devredildi  ${slug}.${alan}`)
  }

  if (alanlar.faq) {
    const { soru, yeniSoru, eskisi, yenisi } = alanlar.faq
    const liste = Array.isArray(kayit.faqs) ? kayit.faqs.map((f) => ({ ...f })) : []
    const hedef = liste.find((f) => f.question === soru || (yeniSoru && f.question === yeniSoru))
    if (!hedef) console.log(`  atlandı     ${slug}.faqs  (soru bulunamadı)`)
    else if (hedef.answer === yenisi) console.log(`  güncel      ${slug}.faqs`)
    else if (hedef.answer !== eskisi) console.log(`  atlandı     ${slug}.faqs  (elle değiştirilmiş)`)
    else {
      hedef.answer = yenisi
      if (yeniSoru) hedef.question = yeniSoru
      veri.faqs = liste
      console.log(`  devredildi  ${slug}.faqs`)
    }
  }

  if (Object.keys(veri).length) {
    await p.service.update({ where: { id: kayit.id }, data: veri })
    degisen++
  }
}

console.log(`\n${degisen} hizmet kaydı güncellendi.`)
await p.$disconnect()
