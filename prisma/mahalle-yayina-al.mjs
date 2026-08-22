// prisma/mahalle-yayina-al.mjs
//
//     npm run mahalle-yayin -- --dogrula        → yalnız rapor, yazma YOK
//     npm run mahalle-yayin                     → kapıdan geçenleri yayına alır
//     npm run mahalle-yayin -- --geri <yol>     → tek kaydı geri çeker
//
// MAHALLE YAYIN KAPISI — TOPLU ÇALIŞTIRICI.
//
// ─────────────────────────────────────────────────────────────────────────
// KURALLAR ARTIK BU DOSYADA DEĞİL
//
// On iki maddelik kapı `server/domain/neighborhoods/neighborhood.gate.ts`
// içinde ve bu betik onu doğrudan çağırmıyor bile: servisin
// (`neighborhoods.service.ts`) `gateStatusAll()` / `publish()` /
// `unpublish()` işlevlerini kullanıyor — yani panelin kullandığı KOD
// YOLUNUN aynısı.
//
// Neden önemli: kurallar önce yalnız burada duruyordu. Panel açılırken
// ikinci bir kopya yazılsaydı, biri değiştiğinde CLI'ın yayına aldığı bir
// kaydı panel reddedebilir (ya da tersi) olurdu. Şimdi ikisi arasında
// davranış farkı ÜRETİLEMEZ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TOPLU SQL DEĞİL
//
// `UPDATE neighborhood SET isActive=1 WHERE ...` bir satırda yüzlerce
// sayfayı Google'a açardı ve hangisinin neden açıldığı hiçbir yerde yazılı
// olmazdı. Burada her kayıt tek tek KAPIDAN geçiyor; geçemeyen
// aktifleştirilmiyor ve sebebi yazdırılıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KAPIDAKİ MADDELER (gate modülünden, sırasıyla)
//
//   1. parent-istanbul   ebeveyn gerçekten bir İstanbul ilçesi mi
//   2. parent-aktif      ebeveyn ilçe yayında mı
//   3. adres-karakter    adres yalnız [a-z0-9-] mı
//   4. adres-eki         adres `-mahallesi` ile mi bitiyor
//   5. adres-benzersiz   adres başka bir mahallede kullanılıyor mu
//   6. title             başlık dolu mu
//   7. excerpt           giriş özeti dolu mu
//   8. content           gövde ≥ 400 karakter mi (etiketsiz)
//   9. meta-dolu         arama açıklaması var mı
//  10. meta-benzersiz    açıklama başka mahalleyle aynı mı
//  11. meta-uzunluk      açıklama 70-175 karakter mi
//  12. sss-sayi          en az 3 SSS var mı
//  13. sss-tam           her sorunun cevabı dolu mu
//  14. iddia             doğrulanmamış ticari iddia taşıyor mu
//  15. ilce-kopya        ilçe sayfasından paragraf kopyası var mı
//  16. kok-cakisma       adres başka bir sayfayı gölgeliyor mu (servis eki)
//
// 15. madde bu ailenin en gerçek riski: mahalle sayfası, ilçe sayfasının
// adı değiştirilmiş kopyası olursa iki sayfa da değer kaybeder.
import prisma from '../server/utils/prisma.ts'
import { neighborhoodsService } from '../server/domain/neighborhoods/neighborhoods.service.ts'

const argumanlar = process.argv.slice(2)
const YALNIZ_DOGRULA = argumanlar.includes('--dogrula')
const geriIndeks = argumanlar.indexOf('--geri')
const GERI_ALINACAK = geriIndeks >= 0 ? argumanlar[geriIndeks + 1] : null

const bitir = async (kod = 0) => {
  await prisma.$disconnect()
  process.exit(kod)
}

// --- geri alma ------------------------------------------------------------
if (GERI_ALINACAK) {
  const kayit = await prisma.neighborhood.findUnique({ where: { canonicalPath: GERI_ALINACAK } })
  if (!kayit) {
    console.error(`Kayıt bulunamadı: ${GERI_ALINACAK}`)
    await bitir(1)
  }

  const sonuc = await neighborhoodsService.unpublish(kayit.id)
  if (!sonuc.success) {
    console.error(`Geri alınamadı: ${sonuc.error}`)
    await bitir(1)
  }

  console.log(`geri alındı: ${GERI_ALINACAK} → isActive = false (sitemap'ten düşer, noindex olur)`)
  await bitir(0)
}

// --- değerlendirme --------------------------------------------------------
const rapor = await neighborhoodsService.gateStatusAll()
if (!rapor.success) {
  console.error(`Kapı raporu alınamadı: ${rapor.error}`)
  await bitir(1)
}

let gecen = 0
let zatenAktif = 0
let kalan = 0
const sebepler = new Map()

for (const satir of rapor.data) {
  if (!satir.kapi.gecti) {
    kalan++
    // Kabuk sayfaları (içerik hiç üretilmemiş) tek tek yazdırılmıyor —
    // yüzlerce satır rapor okunamaz. Sebep bazında toplanıyor.
    const anahtar = satir.kapi.hatalar[0].replace(/\(.*\)/, '').trim()
    sebepler.set(anahtar, (sebepler.get(anahtar) || 0) + 1)
    continue
  }

  if (satir.isActive) {
    console.log(`  zaten aktif  ${satir.canonicalPath}`)
    zatenAktif++
    continue
  }

  if (YALNIZ_DOGRULA) {
    console.log(`  GEÇTİ        ${satir.canonicalPath}   (--dogrula: yazılmadı)`)
    gecen++
    continue
  }

  // Yayına alma da servisten: kapı BURADA İKİNCİ KEZ çalışıyor. Fazladan
  // görünüyor ama ucuz ve doğru — panelden gelen istekle aynı yol.
  const sonuc = await neighborhoodsService.publish(satir.id)
  if (!sonuc.success) {
    console.log(`  ATLANDI      ${satir.canonicalPath} — ${sonuc.error}`)
    kalan++
    continue
  }
  console.log(`  yayına alındı ${satir.canonicalPath}`)
  gecen++
}

console.log(
  `\n${YALNIZ_DOGRULA ? 'DOĞRULAMA' : 'YAYIN'} SONUCU\n` +
    `  toplam kayıt        ${rapor.data.length}\n` +
    `  eligible            ${gecen}${YALNIZ_DOGRULA ? ' (yazılmadı)' : ''}\n` +
    `  already active      ${zatenAktif}\n` +
    `  failed              ${kalan}`
)

if (sebepler.size) {
  console.log('\nKAPIDAN GEÇEMEME SEBEPLERİ (ilk sebep bazında)')
  ;[...sebepler.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([sebep, n]) => console.log(`  ${String(n).padStart(4)} × ${sebep}`))
}

await bitir(0)
