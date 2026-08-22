// prisma/ilce-yayina-al.mjs
//
//     npm run ilce-yayin -- --dogrula     → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run ilce-yayin                  → kapıdan geçenleri aktifleştirir
//     npm run ilce-yayin -- --geri <slug> → tek bir ilçeyi geri pasifleştirir
//
// İSTANBUL İLÇESİ YAYIN KAPISI — TOPLU ÇALIŞTIRICI.
//
// ─────────────────────────────────────────────────────────────────────────
// KURALLAR ARTIK BU DOSYADA DEĞİL
//
// On maddelik kapı `server/domain/regions/district.gate.ts` içinde ve bu
// betik onu doğrudan çağırmıyor bile: servisin
// (`regions.service.ts`) `districtGateStatusAll()` / `publishDistrict()` /
// `unpublishDistrict()` işlevlerini kullanıyor — yani panelin kullandığı
// KOD YOLUNUN aynısı.
//
// Neden önemli: kurallar önce yalnız burada duruyordu ve panel onları hiç
// görmüyordu; `RegionPanel`'deki bir onay kutusu kapıyı tamamen atlayarak
// ilçeyi yayına sokabiliyordu. Artık ikisi arasında davranış farkı
// ÜRETİLEMEZ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN TOPLU SQL DEĞİL
//
// `UPDATE region SET isActive=1 WHERE ...` bir satırda 39 sayfayı Google'a
// açardı ve hangisinin neden açıldığı hiçbir yerde yazılı olmazdı. Burada
// her kayıt tek tek KAPIDAN geçiyor; geçemeyen aktifleştirilmiyor ve sebebi
// yazdırılıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KAPIDAKİ MADDELER (district.gate.ts'ten, sırasıyla)
//
//   1. istanbul-ilcesi    kayıt gerçekten bir İstanbul ilçesi mi
//   2. yaka               yakası biliniyor mu (Avrupa / Anadolu)
//   3. title              H1 kaynağı dolu mu
//   4. subtitle           görünen ilçe adı dolu mu
//   5. meta-dolu          arama açıklaması var mı
//   6. meta-benzersiz     açıklama başka ilçeyle aynı mı
//   7. iddia              doğrulanmamış ticari iddia taşıyor mu (14 ifade)
//   8. content            gövde ≥ 200 karakter mi (etiketsiz)
//   9. mahalle-listesi    mahalle listesi dolu mu
//  10. mahalle-adlari     listede boş ad var mı
//  11. sss-tam            her sorunun cevabı dolu mu
//  12. slug               adres [a-z0-9-] mı
import prisma from '../server/utils/prisma.ts'
import { regionsService } from '../server/domain/regions/regions.service.ts'

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
  const sonuc = await regionsService.unpublishDistrict(GERI_ALINACAK)
  if (!sonuc.success) {
    console.error(`Geri alınamadı: ${sonuc.error}`)
    await bitir(1)
  }
  console.log(`geri alındı: ${GERI_ALINACAK} → isActive = false`)
  await bitir(0)
}

// --- değerlendirme --------------------------------------------------------
const rapor = await regionsService.districtGateStatusAll()
if (!rapor.success) {
  console.error(`Kapı raporu alınamadı: ${rapor.error}`)
  await bitir(1)
}

let aktiflestirilen = 0
let zatenAktif = 0
let kapidaKalan = 0
const sorunlular = []

// Sıra: slug'a göre — betiğin eski çıktısı yaka listesinin sırasındaydı,
// alfabetik sıra okunurluğu artırıyor ve sonucu değiştirmiyor.
for (const satir of [...rapor.data].sort((a, b) => a.slug.localeCompare(b.slug, 'tr'))) {
  if (!satir.kapi.gecti) {
    console.log(`  KAPIDA       ${satir.slug.padEnd(15)} ${satir.kapi.hatalar.join(' · ')}`)
    sorunlular.push([satir.slug, satir.kapi.hatalar])
    kapidaKalan++
    continue
  }

  if (satir.isActive) {
    console.log(`  zaten aktif  ${satir.slug}`)
    zatenAktif++
    continue
  }

  if (YALNIZ_DOGRULA) {
    console.log(`  GEÇTİ        ${satir.slug}   (--dogrula: yazılmadı)`)
    aktiflestirilen++
    continue
  }

  // Yayına alma da servisten: kapı BURADA İKİNCİ KEZ çalışıyor. Fazladan
  // görünüyor ama ucuz ve doğru — panelden gelen istekle aynı yol.
  const sonuc = await regionsService.publishDistrict(satir.slug)
  if (!sonuc.success) {
    console.log(`  ATLANDI      ${satir.slug} — ${sonuc.error}`)
    sorunlular.push([satir.slug, [sonuc.error]])
    kapidaKalan++
    continue
  }
  console.log(`  aktifleşti   ${satir.slug}`)
  aktiflestirilen++
}

console.log(
  `\n${YALNIZ_DOGRULA ? 'DOĞRULAMA' : 'AKTİVASYON'} SONUCU\n` +
    `  toplam ilçe:        ${rapor.data.length}\n` +
    `  activated:          ${aktiflestirilen}${YALNIZ_DOGRULA ? ' (yazılmadı)' : ''}\n` +
    `  skipped (aktifti):  ${zatenAktif}\n` +
    `  failed validation:  ${kapidaKalan}`
)
if (sorunlular.length) {
  console.log('\nKAPIDAN GEÇEMEYENLER')
  sorunlular.forEach(([slug, hatalar]) => console.log(`  ${slug}: ${hatalar.join(' · ')}`))
}

await bitir(0)
