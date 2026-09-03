// prisma/fiyat-notu-tohum.mjs
//
//     npm run fiyat-notu -- --dogrula   → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run fiyat-notu                → devri uygular
//
// FİYAT HESAPLAMA UYARI METNİ — İDDİA DEVRİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN
//
// `PriceEstimator.note` alanı hesaplayıcının altında EKRANDA basılıyor ve
// şunu yazıyordu:
//
//     "… Kesin fiyat; eşya miktarı, park mesafesi, asansör uygunluğu ve
//      montaj ihtiyacına göre ücretsiz keşif sonrasında netleşir."
//
// İki doğrulanmamış iddia: "ücretsiz keşif" ve "kesin fiyat". Metnin geri
// kalanı doğru ve değerli — aracın hesaba katmadığı koşulları sayıyor —
// bu yüzden metin silinmiyor, iddiaları çıkarılmış hâliyle yeniden
// yazılıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// ÜÇÜNCÜ KUŞAK (M14B) — "YAZILI OLARAK" DA ÇIKTI
//
// İkinci kuşak metin şunu diyordu:
//
//     "… Tutar, iki adres görüldükten sonra YAZILI OLARAK paylaşılıyor."
//
// M14 denetiminde sayfanın görünen metnindeki TEK doğrulanmamış iddia
// buydu — ve aynı taahhüt koddan zaten bilerek çıkarılmıştı:
// `price/SonrakiAdim.vue` içinde «"yazılı olarak veriliyor" ÇIKARILDI:
// teklifin biçimi (yazılı/sözlü) hakkında doğrulanmamış bir taahhüt»
// notu duruyor. Yani kodun sahibi olduğu metin taahhüdü bırakmış, CMS'in
// sahibi olduğu metin sürdürüyordu.
//
// Kullanıcı taahhüdün gerçekliğini DOĞRULAYAMADI → kaldırıldı.
//
// Yerine gelen cümle tutarın NE ZAMAN netleştiğini söylüyor, HANGİ
// BİÇİMDE iletileceğini değil. "keşif" kelimesi de bilerek yok: her işte
// keşif yapıldığı ayrıca doğrulanmış bir taahhüt değil. Yeni hiçbir
// iddia eklenmedi.
//
// KATSAYILARA DOKUNULMUYOR. Taban tutarlar, mesafe çarpanları, kat ücreti,
// paketleme çarpanı, depolama ücreti, aralık yüzdesi ve yuvarlama adımı
// birer İŞ KARARI; bu betik yalnız `note` metnini değiştiriyor.
//
// ─────────────────────────────────────────────────────────────────────────
// GÜVENLİ YAZMA
//
// Alan yalnız boşsa ya da BİLİNEN ESKİ KUŞAKLARDAN birinin aynısıysa
// yazılıyor. Panelden elle değiştirilmiş bir metin EZİLMİYOR. İkinci koşu
// 0 yazma üretiyor.
//
// KUŞAKLAR NEDEN BİRİKİYOR: yalnız son kuşak tanınsaydı, birinci kuşakta
// kalmış bir kurulum "elle yazılmış" sanılır ve iddia sessizce ekranda
// kalırdı.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

/**
 * TANINAN ESKİ KUŞAKLAR — üzerine yazılması GÜVENLİ olan metinler.
 * Bu listede olmayan bir metin elle yazılmış sayılır ve korunur.
 */
const ESKI_KUSAKLAR = [
  // 1. kuşak — "ücretsiz keşif" + "kesin fiyat"
  'Bu bir ön tahmindir, teklif değildir. Kesin fiyat; eşya miktarı, park mesafesi, asansör uygunluğu ve montaj ihtiyacına göre ücretsiz keşif sonrasında netleşir.',
  // 2. kuşak — "yazılı olarak" (M14 denetiminde bulundu)
  'Bu bir ön tahmindir, teklif değildir. Aralık yalnız yukarıdaki altı bilgiden çıkıyor; park mesafesi, asansör kabininin ölçüsü, sökülecek parçalar ve site giriş koşulları hesaba girmiyor. Tutar, iki adres görüldükten sonra yazılı olarak paylaşılıyor.',
]

// 3. kuşak — iletişim biçimi hakkında taahhüt YOK.
const YENI =
  'Bu bir ön tahmindir, teklif değildir. Aralık yalnız yukarıdaki altı bilgiden çıkıyor; park mesafesi, asansör kabininin ölçüsü, sökülecek parçalar ve site giriş koşulları hesaba girmiyor. Tutar, taşıma koşulları değerlendirildikten sonra netleşiyor.'

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

const kayit = await p.priceEstimator.findFirst({ where: { sectionName: 'price-estimator' } })
if (!kayit) {
  console.error('Kayıt bulunamadı: price-estimator')
  await p.$disconnect()
  process.exit(1)
}

const simdi = norm(kayit.note)

const taninanEski = ESKI_KUSAKLAR.findIndex((m) => simdi === norm(m))

console.log(`ÖNCE: ${JSON.stringify(simdi)}`)

if (simdi === norm(YENI)) {
  console.log('note: zaten güncel — yazma yok.')
} else if (simdi && taninanEski === -1) {
  console.log('note: elle yazılmış — EZİLMEDİ. Panelden gözden geçirilmeli.')
  console.log(`  mevcut: ${simdi.slice(0, 120)}…`)
} else {
  if (!YALNIZ_DOGRULA) {
    await p.priceEstimator.update({ where: { id: kayit.id }, data: { note: YENI } })
  }
  console.log(`note: ${YALNIZ_DOGRULA ? 'YAZILACAK' : 'yazıldı'} (${YENI.length} karakter)`)
  console.log(`  tanınan eski kuşak: ${taninanEski === -1 ? 'boştu' : taninanEski + 1}`)
  console.log('  çıkarılan iddialar: "ücretsiz keşif", "kesin fiyat", "yazılı olarak"')
  console.log(`SONRA: ${JSON.stringify(norm(YENI))}`)
}

// --- katsayılar: yalnız RAPOR, dokunma -----------------------------------
const guncel = await p.priceEstimator.findFirst({
  where: { sectionName: 'price-estimator' },
  include: { sizes: { orderBy: { order: 'asc' } }, distances: { orderBy: { order: 'asc' } } },
})

console.log(
  '\nİŞ KATSAYILARI (bu betik DOKUNMUYOR — panelden yönetiliyor)\n' +
    `  kat ücreti          ${guncel.floorFee}\n` +
    `  paketleme çarpanı   ${guncel.packingMultiplier}\n` +
    `  depolama ücreti     ${guncel.storageFee}\n` +
    `  aralık yüzdesi      ${guncel.rangePercent}\n` +
    `  yuvarlama adımı     ${guncel.roundTo}\n` +
    `  taban tutar         ${guncel.sizes.map((s) => `${s.label}=${s.basePrice}`).join(' · ')}\n` +
    `  mesafe çarpanı      ${guncel.distances.map((d) => `${d.label}=${d.multiplier}`).join(' · ')}`
)

await p.$disconnect()
