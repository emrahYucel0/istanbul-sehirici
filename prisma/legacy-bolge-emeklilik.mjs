// prisma/legacy-bolge-emeklilik.mjs
//
// ESKİ TÜRKİYE BÖLGE SAYFALARINI YAYINDAN ÇEKER — SİLMEZ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Sitenin kapsamı İstanbul Eve Nakliyat: ana sayfa İstanbul otorite
// sayfası, altında 39 ilçe ve ilçelerin mahalleleri var. Başka illerin
// bağımsız iniş sayfaları (Ankara, İzmir, Bursa…) bu mimarinin parçası
// değil. Bu kayıtlar eski markadan devralındı ve metinlerinde doğrulanmamış
// ticari iddialar taşıyorlar.
//
// ─────────────────────────────────────────────────────────────────────────
// EMEKLİLİK ≠ SİLME
//
// `isActive` false'a çekiliyor, satır DURUYOR. Bunun üç somut sonucu var:
//   · Sayfa 404 dönüyor, sitemap'ten ve herkese açık listelerden düşüyor.
//   · Kök adres REZERVE kalıyor — `kokAdresleriTopla()` yayın durumuna
//     bakmadan bütün satırları topluyor, yani /ankara adresini yarın başka
//     bir yazı ya da hizmet alamıyor.
//   · Yönetici kaydı Bölgeler panelinin "Legacy" sekmesinde görmeye devam
//     ediyor; karar geri alınabilir.
//
// ─────────────────────────────────────────────────────────────────────────
// KAPALI KÜME NASIL TÜRETİLİYOR
//
// Elle yazılmış slug listesi YOK. Küme çalışma anında üç kuralla çıkıyor:
//
//     isActive === true                       (zaten yayında olanlar)
//   && istanbulIlcesiMi(kayit) === false      (İstanbul ilçesi değil)
//   && slug !== ISTANBUL_IL_SLUG              (özel `istanbul` kaydı değil)
//
// `istanbulIlcesiMi` M6'da Bölge panelinin kapsam sekmelerini de besleyen
// aynı yardımcı; ikinci bir sınıflandırma kuralı üretilmedi.
//
// `istanbul` kaydı bilerek dışarıda: adresi `nuxt.config.ts` routeRules ile
// kalıcı olarak `/`'a yönlendiriliyor ve kayıt o devri taşıyor. Yayından
// çekmek yönlendirmeyi bozmaz ama kaydın anlamını değiştirir; bu turun
// kapsamı değil.
//
// ─────────────────────────────────────────────────────────────────────────
// YAZMA YOLU
//
// Doğrudan Prisma toplu güncellemesi YAPILMIYOR. Her kayıt tek tek
// `regionsService.update()` üzerinden geçiyor — panelin kullandığı yolun
// aynısı. Kazanılan şey: İstanbul ilçelerini koruyan kural
// (`isActive: ilce ? undefined : …`) burada da geçerli, yani betik yanlış
// bir kaydı hedeflese bile ilçe yayın durumu gövdeden değiştirilemiyor.
//
// KULLANIM
//   node --env-file=.env prisma/legacy-bolge-emeklilik.mjs            (kuru çalıştırma)
//   node --env-file=.env prisma/legacy-bolge-emeklilik.mjs --uygula   (yazar)
//   node --env-file=.env prisma/legacy-bolge-emeklilik.mjs --geri-al  (yayına döndürür)
//
// Yeniden çalıştırılabilir: hedef küme zaten boşsa hiçbir şey yapmaz.
import prisma from '../server/utils/prisma.ts'
import { regionsService } from '../server/domain/regions/regions.service.ts'
import { istanbulIlcesiMi, ISTANBUL_IL_SLUG } from '../shared/utils/istanbul.ts'

const uygula = process.argv.includes('--uygula')
const geriAl = process.argv.includes('--geri-al')
const hedefDurum = geriAl ? true : false

const hepsi = await prisma.region.findMany({
  select: { id: true, slug: true, title: true, cities: true, isActive: true },
})

const legacyMi = (r) => !istanbulIlcesiMi(r) && r.slug !== ISTANBUL_IL_SLUG

const hedefler = hepsi
  .filter((r) => legacyMi(r) && r.isActive !== hedefDurum)
  .sort((a, b) => a.slug.localeCompare(b.slug))

// Geri alma modunda kör davranmıyoruz: yalnız bu betiğin çektiği kayıtlar
// geri gelsin diye 335 legacy kaydın tamamı değil, dosyaya yazılmış küme
// kullanılıyor. Dosya yoksa geri alma reddediliyor.
let geriAlKumesi = null
if (geriAl) {
  const fs = await import('node:fs')
  const yol = 'prisma/legacy-bolge-emeklilik-kayit.json'
  if (!fs.existsSync(yol)) {
    console.error(`Geri alma için ${yol} gerekli; dosya yok. Hangi kayıtların çekildiği bilinmiyor.`)
    process.exit(1)
  }
  geriAlKumesi = new Set(JSON.parse(fs.readFileSync(yol, 'utf8')).sluglar)
}

const secilen = geriAl ? hedefler.filter((r) => geriAlKumesi.has(r.slug)) : hedefler

console.log('═══════════════════════════════════════════════════════')
console.log(geriAl ? 'GERİ ALMA' : 'EMEKLİLİK', uygula ? '· UYGULANIYOR' : '· KURU ÇALIŞTIRMA (yazma yok)')
console.log('═══════════════════════════════════════════════════════')
console.log('Region toplam        ', hepsi.length)
console.log('İstanbul ilçesi      ', hepsi.filter(istanbulIlcesiMi).length, '— DOKUNULMUYOR')
console.log('özel `istanbul`      ', hepsi.filter((r) => r.slug === ISTANBUL_IL_SLUG).length, '— DOKUNULMUYOR')
console.log('legacy Türkiye       ', hepsi.filter(legacyMi).length)
console.log('  · bugün yayında    ', hepsi.filter((r) => legacyMi(r) && r.isActive).length)
console.log('hedef                ', secilen.length, `→ isActive: ${hedefDurum}`)

if (!secilen.length) {
  console.log('\nYapılacak bir şey yok.')
  await prisma.$disconnect()
  process.exit(0)
}

console.log('')
for (const r of secilen) console.log('  ', String(r.id).padStart(4), r.slug.padEnd(16), r.title)

if (!uygula && !geriAl) {
  console.log('\nKuru çalıştırma. Yazmak için: --uygula')
  await prisma.$disconnect()
  process.exit(0)
}

console.log('')
let basarili = 0
const hatalar = []
for (const r of secilen) {
  const sonuc = await regionsService.update({
    id: r.id,
    slug: r.slug,
    title: r.title,
    isActive: hedefDurum,
  })
  if (sonuc.success) {
    basarili++
    console.log('   ✔', r.slug)
  } else {
    hatalar.push(`${r.slug}: ${sonuc.error}`)
    console.log('   ✘', r.slug, '—', sonuc.error)
  }
}

// Doğrulama: hedef durum gerçekten yazıldı mı, ve İstanbul tarafı bozulmadı mı.
const sonra = await prisma.region.findMany({ select: { slug: true, cities: true, isActive: true } })
const ilceAktif = sonra.filter((r) => istanbulIlcesiMi(r) && r.isActive).length
const legacyAktif = sonra.filter((r) => !istanbulIlcesiMi(r) && r.slug !== ISTANBUL_IL_SLUG && r.isActive).length
const ilAktif = sonra.filter((r) => r.slug === ISTANBUL_IL_SLUG && r.isActive).length

console.log('\n─── SONUÇ ───')
console.log('işlenen              ', basarili, '/', secilen.length)
console.log('Region toplam        ', sonra.length, sonra.length === hepsi.length ? '(değişmedi ✓)' : '⚠ DEĞİŞTİ')
console.log('İstanbul ilçesi aktif', ilceAktif, ilceAktif === 39 ? '✓' : '⚠')
console.log('özel istanbul aktif  ', ilAktif, ilAktif === 1 ? '✓' : '⚠')
console.log('legacy aktif         ', legacyAktif)

if (hatalar.length) {
  console.log('\nHATALAR:')
  for (const h of hatalar) console.log('  ', h)
}

if (uygula && !geriAl && basarili) {
  const fs = await import('node:fs')
  fs.writeFileSync(
    'prisma/legacy-bolge-emeklilik-kayit.json',
    JSON.stringify({ tarih: new Date().toISOString(), sluglar: secilen.map((r) => r.slug) }, null, 1)
  )
  console.log('\nGeri alma kaydı yazıldı: prisma/legacy-bolge-emeklilik-kayit.json')
}

await prisma.$disconnect()
process.exit(hatalar.length ? 1 : 0)
