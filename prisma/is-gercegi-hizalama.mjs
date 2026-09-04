// prisma/is-gercegi-hizalama.mjs
//
//     npm run is-gercegi -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run is-gercegi                → hizalamayı uygular
//
// DOĞRULANMAMIŞ SÜREÇ TAAHHÜTLERİNİN VERİ TABANI TARAFI.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN
//
// M15 denetimi /hakkimizda ve /iletisim metinlerinde üç süreç taahhüdü
// buldu. Kullanıcı bunları tek tek doğruladı:
//
//   1. Her işte keşif yapılıyor mu?                    HAYIR
//   2. Kapsam müşteriye YAZILI olarak veriliyor mu?    EMİN DEĞİL
//   3. Taşıma öncesi SÖZLEŞME imzalanıyor mu?          EMİN DEĞİL
//   4. Taşıma günü tek muhatap oluyor mu?              EVET
//
// Sitenin kendisi bu konuda zaten tutarsızdı: M14B'de fiyat notundan
// "yazılı olarak paylaşılıyor" doğrulanamadığı için kaldırılmış, "keşif"
// kelimesi de aynı gerekçeyle yeni metne konmamıştı. Ama aynı taahhütler
// bu iki sayfanın merkezinde duruyordu. Bu betik o farkı kapatıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// NE DEĞİŞMİYOR
//
// · Bölümlerin YAPISI: 02'nin dört kararı, 03'ün dört ölçüm kalemi, sıra,
//   numaralandırma, fotoğraflar — hiçbiri değişmiyor.
// · Anlatılan İŞ: neyin neden ölçüldüğü aynen kalıyor. Kalkan tek şey o
//   ölçümün MUTLAKA bir keşif ziyaretinde yapıldığı ve sonucun YAZILI
//   verildiği iddiası.
// · "Taşıma günü tek muhatabınız oluyoruz" — DOĞRULANMIŞ, aynen duruyor.
//   Kapsamı da genişletilmiyor: "garanti", "kesinlikle", "her koşulda",
//   "7/24" gibi hiçbir yeni sıfat eklenmiyor.
//
// ─────────────────────────────────────────────────────────────────────────
// GÜVENLİ YAZMA
//
// Her alan yalnız BİLİNEN eski metinden birine eşitse yazılıyor. Panelden
// elle değiştirilmiş bir metin EZİLMİYOR; o durumda uyarı basılıp geçiliyor.
// İkinci koşu 0 yazma üretiyor.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })
const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

/**
 * HİZALAMA KÜTÜĞÜ.
 *
 * `eski`: tanınan önceki kuşak(lar). `yeni`: yazılacak metin.
 * `neden`: hangi doğrulanmamış taahhüdün kaldırıldığı.
 */
const ABOUT_ALANLARI = [
  {
    alan: 'description1',
    neden: 'koşulsuz "adres görülüyor" + "kapsam yazılıyor"',
    eski: [
      "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Bir taşınmanın nasıl geçeceğini çoğu zaman mesafe değil, iki adresin koşulları belirliyor. Bu yüzden işin büyük bölümü taşıma gününde değil, ondan önce yapılıyor: adres görülüyor, kapsam yazılıyor, gün buna göre kuruluyor.",
    ],
    yeni:
      "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Bir taşınmanın nasıl geçeceğini çoğu zaman mesafe değil, iki adresin koşulları belirliyor. Bu yüzden işin büyük bölümü taşıma gününde değil, ondan önce yapılıyor: koşullar konuşuluyor, kapsam netleşiyor, gün buna göre kuruluyor.",
  },
  {
    alan: 'historyText1',
    neden: '"neyin dahil olduğunu yazıya dökmek"',
    eski: [
      'İşe şehir içi ev taşımalarıyla başladık. En çok duyduğumuz şikâyet fiyatla ilgiliydi: telefonda bir rakam söyleniyor, taşıma günü kat farkı, asansör farkı, ambalaj farkı diye başka bir rakam çıkıyordu. Biz de tersini yapmayı seçtik — adresi görmeden rakam vermemek, neyin dahil olduğunu yazıya dökmek.',
    ],
    yeni:
      'İşe şehir içi ev taşımalarıyla başladık. En çok duyduğumuz şikâyet fiyatla ilgiliydi: telefonda bir rakam söyleniyor, taşıma günü kat farkı, asansör farkı, ambalaj farkı diye başka bir rakam çıkıyordu. Biz de tersini yapmayı seçtik — koşulları öğrenmeden rakam vermemek, neyin dahil olduğunu baştan netleştirmek.',
  },
]

const IC_SAYFA_ALANLARI = [
  {
    sayfa: 'hakkimizda',
    bolum: 'saha',
    alan: 'heading',
    neden: 'koşulsuz keşif ("Keşifte ne kayda geçiyor?")',
    eski: ['Keşifte ne kayda geçiyor?'],
    yeni: 'Planı ne belirliyor?',
  },
  {
    sayfa: 'hakkimizda',
    bolum: 'saha',
    alan: 'lead',
    neden: 'koşulsuz keşif ("her adreste") — fikir korunuyor, zorunluluk kalkıyor',
    eski: [
      'Keşif bir nezaket ziyareti değil, ölçüm. Aşağıdaki dördü her adreste aynı sırayla kaydediliyor ve teklifin dayanağı bunlar oluyor.',
    ],
    yeni:
      'Ölçüm taşıma gününden önce başlıyor. Planın dayanağı aşağıdaki dört başlık; hangisinin nasıl öğrenildiği işin türüne ve adrese göre değişiyor.',
  },
  {
    sayfa: 'hakkimizda',
    bolum: 'saha',
    alan: 'closing',
    neden: '"kapsam yazıya dökülüyor" + "tek tek yazılıyor" + "sözleşmede belirtiliyor"',
    eski: [
      'Keşifte çıkan kapsam yazıya dökülüyor: hangi işlerin dahil olduğu, hangi parçaların sökülüp kurulacağı, ambalaj malzemesinin kime ait olduğu. Kapsam değiştiğinde teklif de değişiyor — bu yüzden neyin dahil olduğu baştan tek tek yazılıyor. Taşıma sırasında doğabilecek sorumluluğun kapsamı ve sınırları da sözleşmede belirtiliyor.',
    ],
    yeni:
      'Çıkan kapsam baştan netleştiriliyor: hangi işlerin dahil olduğu, hangi parçaların sökülüp kurulacağı, ambalaj malzemesinin kime ait olduğu. Kapsam değiştiğinde teklif de değişiyor — bu yüzden neyin dahil olduğu tek tek konuşuluyor. Taşıma sırasında doğabilecek sorumluluğun kapsamı ve sınırları da önceden netleştiriliyor.',
  },
  {
    sayfa: 'hakkimizda',
    bolum: 'yontem',
    alan: 'note',
    neden: 'koşulsuz keşif (fotoğraf künyesi)',
    eski: ['KAPIDAN GEÇMEYEN PARÇA KEŞİFTE BELİRLENİYOR'],
    yeni: 'KAPIDAN GEÇMEYEN PARÇA ÖNCEDEN BELİRLENİYOR',
  },
  {
    sayfa: 'iletisim',
    bolum: 'kanallar',
    alan: 'lead',
    neden: 'koşulsuz keşif ("keşif planlanırken")',
    eski: [
      'Telefon, tarihi yaklaşmış ve bir an önce yön arayan işler için doğru kanal. Kapsamı yazarak anlatmak isteyenler ya da çalışma saatleri dışında ulaşanlar için aşağıdaki form daha rahat: yazdıklarınız kayda giriyor ve keşif planlanırken önümüzde duruyor.',
    ],
    yeni:
      'Telefon, tarihi yaklaşmış ve bir an önce yön arayan işler için doğru kanal. Kapsamı yazarak anlatmak isteyenler ya da çalışma saatleri dışında ulaşanlar için aşağıdaki form daha rahat: yazdıklarınız kayda giriyor ve taşıma planlanırken önümüzde duruyor.',
  },
  {
    sayfa: 'iletisim',
    bolum: 'form',
    alan: 'lead',
    neden: 'koşulsuz keşif ("keşif için doğru günü")',
    eski: [
      'Mesaj kutusuna aşağıdakileri yazarsanız keşif için doğru günü ve ekibi baştan ayırabiliyoruz. Bildiğiniz kadarı yeterli.',
    ],
    yeni:
      'Mesaj kutusuna aşağıdakileri yazarsanız doğru günü ve ekibi baştan planlayabiliyoruz. Bildiğiniz kadarı yeterli.',
  },
  {
    sayfa: 'iletisim',
    bolum: 'form',
    alan: 'note',
    neden: '"keşif için gün ayırıyoruz" + "keşiften önce fiyat konuşulmuyor"',
    eski: [
      'Formu gönderdiğinizde talebiniz kayda giriyor. Sonraki adım genellikle kısa bir telefon görüşmesi oluyor: adresleri ve tarihi teyit edip keşif için gün ayırıyoruz. Keşiften önce fiyat konuşulmuyor, çünkü plan görülmeden çıkmıyor.',
    ],
    // M14B'deki fiyat notuyla aynı sözleşme: tutarın NE ZAMAN netleştiğini
    // söylüyor, hangi ARAÇLA (keşif/yazı/sözleşme) netleştiğini değil.
    yeni:
      'Formu gönderdiğinizde talebiniz kayda giriyor. Sonraki adım genellikle kısa bir telefon görüşmesi oluyor: adresleri ve tarihi teyit ediyoruz. Tutar, taşıma koşulları değerlendirildikten sonra netleşiyor.',
  },
]

/**
 * META KAYITLARI — M16B'de eklendi.
 *
 * NEDEN SONRADAN: M15B `app/utils/sayfa-meta.ts` içindeki `about`
 * varsayılanından "keşifte" kelimesini çıkardı ve iş bitti sanıldı. Ama
 * `usePageSeo` öncelik sırası şu:
 *
 *     panelden girilen Meta kaydı  >  sayfa-meta.ts varsayılanı  >  Site Ayarları
 *
 * Veri tabanında `Meta("about")` kaydı VAR. Yani düzeltilen satır hiç
 * basılmıyordu; arama sonucunda görünen açıklama hâlâ "keşifte neyi
 * ölçtüğümüz" diyordu — sayfanın kendi gövdesi bunu artık söylemediği
 * hâlde. M16 denetimi bu farkı ölçtü.
 *
 * Bu alan bu kütüğe konuyor çünkü kapattığı iddia M15B'nin iddiası:
 * /hakkimizda sayfasının koşulsuz keşif taahhüdü.
 */
const META_ALANLARI = [
  {
    sayfa: 'about',
    alan: 'description',
    neden: 'koşulsuz keşif ("keşifte neyi ölçtüğümüz") — DB kaydı kod düzeltmesini eziyordu',
    eski: [
      "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Nasıl çalıştığımız, keşifte neyi ölçtüğümüz ve kapsamı nasıl belirlediğimiz.",
    ],
    yeni:
      "İstanbul'da evden eve, ofis ve parça eşya taşıması yapıyoruz. Nasıl çalıştığımız, neyi ölçtüğümüz ve kapsamı nasıl belirlediğimiz.",
  },
]

/** Yazılacak yeni metinlerde doğrulanmamış iddia kalmadığını sınar. */
const YASAKLI = [
  'keşif', 'keşfe', 'keşifte', 'yazıya dök', 'yazılı', 'sözleşme',
  'ücretsiz', 'garanti', 'sigortal', 'kesin fiyat', 'sabit fiyat', '%100',
]
const kucult = (s) => String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()

let yazilan = 0
let atlanan = 0
let korunan = 0

console.log('═══ ÖN KONTROL — yeni metinlerde doğrulanmamış iddia')
let kirli = 0
for (const k of [...ABOUT_ALANLARI, ...IC_SAYFA_ALANLARI, ...META_ALANLARI]) {
  const iz = YASAKLI.filter((y) => kucult(k.yeni).includes(kucult(y)))
  if (iz.length) { kirli++; console.log(`  ⚑ ${k.alan}: ${iz.join(', ')}`) }
}
console.log(kirli ? `  ${kirli} alanda iz var — YAZILMAYACAK` : '  temiz')
if (kirli) { await p.$disconnect(); process.exit(1) }

// ─────────────────────────────────────────── AboutSection
console.log('\n═══ AboutSection')
const about = await p.aboutSection.findFirst()
if (!about) {
  console.log('  kayıt yok — atlandı')
} else {
  for (const k of ABOUT_ALANLARI) {
    const simdi = norm(about[k.alan])
    if (simdi === norm(k.yeni)) { korunan++; console.log(`  ${k.alan}: zaten güncel`); continue }
    if (!k.eski.some((e) => norm(e) === simdi)) {
      atlanan++
      console.log(`  ${k.alan}: ELLE YAZILMIŞ — EZİLMEDİ`)
      console.log(`    mevcut: ${simdi.slice(0, 110)}…`)
      continue
    }
    console.log(`  ${k.alan}: ${k.neden}`)
    console.log(`    ÖNCE : ${simdi}`)
    console.log(`    SONRA: ${norm(k.yeni)}`)
    if (!YALNIZ_DOGRULA) {
      await p.aboutSection.update({ where: { id: about.id }, data: { [k.alan]: k.yeni } })
    }
    yazilan++
  }
}

// ─────────────────────────────────────────── InternalPageSection
console.log('\n═══ InternalPageSection')
for (const k of IC_SAYFA_ALANLARI) {
  const kayit = await p.internalPageSection.findFirst({
    where: { pageKey: k.sayfa, sectionKey: k.bolum },
  })
  if (!kayit) { console.log(`  ${k.sayfa}.${k.bolum}: kayıt yok — atlandı`); atlanan++; continue }
  const simdi = norm(kayit[k.alan])
  if (simdi === norm(k.yeni)) { korunan++; console.log(`  ${k.sayfa}.${k.bolum}.${k.alan}: zaten güncel`); continue }
  if (!k.eski.some((e) => norm(e) === simdi)) {
    atlanan++
    console.log(`  ${k.sayfa}.${k.bolum}.${k.alan}: ELLE YAZILMIŞ — EZİLMEDİ`)
    console.log(`    mevcut: ${simdi.slice(0, 110)}…`)
    continue
  }
  console.log(`  ${k.sayfa}.${k.bolum}.${k.alan}: ${k.neden}`)
  console.log(`    ÖNCE : ${simdi}`)
  console.log(`    SONRA: ${norm(k.yeni)}`)
  if (!YALNIZ_DOGRULA) {
    await p.internalPageSection.update({ where: { id: kayit.id }, data: { [k.alan]: k.yeni } })
  }
  yazilan++
}

// ─────────────────────────────────────────── Meta (panel SEO kaydı)
console.log('\n═══ Meta')
for (const k of META_ALANLARI) {
  const kayit = await p.meta.findFirst({ where: { page: k.sayfa } })
  if (!kayit) {
    // Kayıt yoksa sayfa-meta.ts varsayılanı basılıyor ve o zaten temiz.
    console.log(`  Meta(${k.sayfa}): kayıt yok — kod varsayılanı basılıyor, hizalama gerekmiyor`)
    continue
  }
  const simdi = norm(kayit[k.alan])
  if (simdi === norm(k.yeni)) { korunan++; console.log(`  Meta(${k.sayfa}).${k.alan}: zaten güncel`); continue }
  if (!k.eski.some((e) => norm(e) === simdi)) {
    atlanan++
    console.log(`  Meta(${k.sayfa}).${k.alan}: ELLE YAZILMIŞ — EZİLMEDİ`)
    console.log(`    mevcut: ${simdi.slice(0, 110)}…`)
    continue
  }
  console.log(`  Meta(${k.sayfa}).${k.alan}: ${k.neden}`)
  console.log(`    ÖNCE : ${simdi}`)
  console.log(`    SONRA: ${norm(k.yeni)}`)
  if (!YALNIZ_DOGRULA) {
    await p.meta.update({ where: { id: kayit.id }, data: { [k.alan]: k.yeni } })
  }
  yazilan++
}

console.log(
  `\n═══ SONUÇ  ${YALNIZ_DOGRULA ? 'yazılacak' : 'yazıldı'}: ${yazilan} · zaten güncel: ${korunan} · atlanan: ${atlanan}`
)
console.log('DOKUNULMAYAN: description3 ("tek muhatabınız" — DOĞRULANMIŞ), saha.items (dört ölçüm kalemi), yontem görselleri')

await p.$disconnect()
