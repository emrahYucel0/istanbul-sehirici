// prisma/ayar-metinleri-tohum.mjs
//
// PANELDEN GİRİLMİŞ SEO METİNLERİ — Site Ayarları ve Meta kayıtları.
//
// Şablondan devralınan ya da yer tutucu kalmış metinleri gerçek içerikle
// değiştirir. Sayfa bazlı açıklamalar ayrı betiklerde:
//   bolge-aciklama-tohum.mjs    → 120 bölge
//   icerik-aciklama-tohum.mjs   → 7 hizmet + 10 blog
//
// TEKRAR ÇALIŞTIRILABİLİR: `--hepsini-ez` verilmedikçe elle yazılmış
// (yer tutucu olmayan) metinleri ezmez.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const hepsiniEz = process.argv.includes('--hepsini-ez')
const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

/**
 * Yer tutucu sayılan değerler. Bunlar "dolu" kabul edilmez ve ezilir —
 * "Site açıklaması" gibi bir metin siteye çıkarsa arama sonucunda o görünür.
 */
const YER_TUTUCULAR = [
  'site açıklaması',
  'site aciklamasi',
  'açıklama',
  'lorem ipsum',
  'örnek',
]
const yerTutucuMu = (v) => {
  const t = String(v ?? '').trim().toLocaleLowerCase('tr-TR')
  return t === '' || YER_TUTUCULAR.includes(t)
}

/**
 * DEVİR ALANLARI — eski markadan/eski konumlandırmadan gelen, elle yazılmış
 * göründüğü için yukarıdaki yer tutucu kontrolüne TAKILMAYAN değerler.
 *
 * Bunlar `AYARLAR`dan ayrı tutuluyor çünkü koşul farklı: yer tutucu olup
 * olmadıklarına değil, ESKİ DEĞERİN AYNISI olup olmadıklarına bakılıyor.
 * Böylece betik tekrar çalıştırılabilir kalıyor ve panelden sonradan elle
 * yazılmış bir metni ezmiyor — yalnız bilinen devir metnini değiştiriyor.
 *
 * Neden değişiyorlar:
 *   brandName/siteName  eski marka kimliği (yeni alan adı: istanbulevenakliyat.com)
 *   email               eski alan adının posta kutusu
 *   siteDescription     "Türkiye genelinde", "depolama", "ücretsiz keşif" —
 *                       ilki İstanbul konumlandırmasıyla çelişiyor, diğer
 *                       ikisi doğrulanmamış/kapsam dışı
 *   metaDescription     "sabit fiyat", "ücretsiz keşif", "depolama" — aynı
 */
const DEVIR = {
  brandName: {
    eskisi: 'EveNakliyatEvden',
    yenisi: 'İstanbul Eve Nakliyat',
  },
  siteName: {
    eskisi: 'EveNakliyatEvden',
    yenisi: 'İstanbul Eve Nakliyat',
  },
  email: {
    eskisi: 'info@evenakliyatevden.com',
    yenisi: 'info@istanbulevenakliyat.com',
  },
  siteDescription: {
    eskisi:
      'İstanbul merkezli, Türkiye genelinde evden eve nakliyat, şehirler arası taşıma, ofis taşıma ve eşya depolama hizmeti. Sigortalı taşıma, ücretsiz keşif.',
    yenisi:
      "İstanbul'da evden eve nakliyat, ofis taşıma, parça eşya, ambalajlama ve marangozlu söküm-kurulum. Erişim ve kat koşulları keşifte yerinde ölçülür.",
  },
  metaDescription: {
    eskisi:
      'Evden eve nakliyat, asansörlü taşıma, parça eşya, ofis taşıma ve depolama. Yazılı sabit fiyat ve sigortalı taşımacılık. Ücretsiz keşif için arayın.',
    yenisi:
      "İstanbul'un 39 ilçesinde evden eve nakliyat. Araç erişimi, bina girişi ve kat keşifte ölçülüyor; fiyat ve yöntem buna göre planlanıyor.",
  },
}

// ── Site Ayarları ──────────────────────────────────────────────────────────
const AYARLAR = {
  /**
   * BOŞ BIRAKILIYOR — bilinçli.
   *
   * Footer'da bu alan doluysa aynen basılıyor; boşsa marka adı ve
   * İÇİNDE BULUNULAN YIL ile otomatik üretiliyor (bkz. Footer.vue).
   * Öncesinde "© 2026 …" olarak sabitlenmişti; öyle kalsaydı yıl
   * dönümünde site eski yılı göstermeye devam ederdi.
   */
  copyrightText: null,
}

// ── Meta kayıtları ─────────────────────────────────────────────────────────
const META = {
  about: {
    // Eskisi: "On iki yıllık deneyimle … Ücretsiz keşif, yazılı sabit fiyat,
    // %100 sigortalı taşıma." Dördü de doğrulanmamış iddiaydı; ayrıca
    // başlık "Şehirler Arası Taşımacılık" ile İstanbul konumlandırmasının
    // önüne geçiyordu.
    title: "Hakkımızda | İstanbul'da Evden Eve Nakliyat",
    description:
      "İstanbul'da evden eve nakliyat, ofis taşıma ve ambalajlama yapıyoruz. Nasıl çalıştığımız, keşifte neyi ölçtüğümüz ve ekibin kapsamı.",
  },
  services: {
    // Eskisi "… ve fiyatı etkileyen konular. Ücretsiz keşif." ile bitiyordu;
    // son cümle doğrulanmamış bir vaat, ortası da ana sayfadaki fiyat
    // bölümünün işini tekrar ediyordu. Başlığa İstanbul eklendi: sayfa
    // artık şehir odaklı konumlandırmayla aynı şeyi söylüyor.
    title: 'İstanbul Nakliyat Hizmetleri | Evden Eve, Asansörlü, Ofis, Depolama',
    description:
      "İstanbul'da evden eve, asansörlü, parça eşya, ofis taşıma, depolama, ambalajlama ve şehirler arası nakliyat. Yedi hizmetin kapsamı ayrı ayrı.",
  },
}

// ── Uygulama ───────────────────────────────────────────────────────────────
const ayar = await p.siteSettings.findFirst()
if (!ayar) {
  console.log('Site Ayarları kaydı yok — atlandı.')
} else {
  const guncelleme = {}
  for (const [alan, deger] of Object.entries(AYARLAR)) {
    const mevcut = ayar[alan]
    if (deger === null) {
      // Bilerek boşaltılan alan
      if (mevcut !== null && mevcut !== '') {
        guncelleme[alan] = null
        console.log(`  boşaltıldı  ${alan}  (otomatik üretilecek)`)
      }
      continue
    }
    if (yerTutucuMu(mevcut) || hepsiniEz) {
      guncelleme[alan] = deger
      console.log(`  yazıldı     ${alan}  (${deger.length} karakter)`)
    } else {
      console.log(`  atlandı     ${alan}  (elle yazılmış, korundu)`)
    }
  }
  // Devir alanları: yalnız BİLİNEN eski değerin aynısıysa değiştirilir.
  for (const [alan, { eskisi, yenisi }] of Object.entries(DEVIR)) {
    const mevcut = String(ayar[alan] ?? '').trim()
    if (mevcut === yenisi) {
      console.log(`  güncel      ${alan}`)
    } else if (mevcut === eskisi || yerTutucuMu(mevcut) || hepsiniEz) {
      guncelleme[alan] = yenisi
      console.log(`  devredildi  ${alan}  → ${yenisi.slice(0, 46)}${yenisi.length > 46 ? '…' : ''}`)
    } else {
      console.log(`  atlandı     ${alan}  (elle değiştirilmiş, korundu)`)
    }
  }

  if (Object.keys(guncelleme).length) {
    await p.siteSettings.update({ where: { id: ayar.id }, data: guncelleme })
  }

  // Kullanılmayan alanlar hakkında uyarı — doldurmanın faydası yok.
  if (ayar.metaTitle) {
    console.log('\n  NOT: `metaTitle` alanı doluymuş ama kodda HİÇBİR YERDE okunmuyor.')
  }
  if (ayar.metaKeywords) {
    console.log('  NOT: `metaKeywords` <meta name="keywords"> olarak basılıyor;')
    console.log('       Google 2009\'dan beri bu etiketi tamamen yok sayıyor.')
  }
}

for (const [sayfa, veri] of Object.entries(META)) {
  const mevcut = await p.meta.findUnique({ where: { page: sayfa } })
  if (!mevcut) {
    await p.meta.create({ data: { sectionName: 'metas', page: sayfa, ...veri } })
    console.log(`  oluşturuldu meta/${sayfa}`)
    continue
  }
  const ayni = mevcut.title === veri.title && mevcut.description === veri.description
  if (ayni) {
    console.log(`  güncel      meta/${sayfa}`)
    continue
  }
  await p.meta.update({ where: { page: sayfa }, data: veri })
  console.log(`  yazıldı     meta/${sayfa}  (başlık ${veri.title.length}, açıklama ${veri.description.length})`)
}

await p.$disconnect()
