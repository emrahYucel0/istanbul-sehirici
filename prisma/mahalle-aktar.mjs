// prisma/mahalle-aktar.mjs
//
//     npm run mahalle-aktar -- --dogrula    → yalnız rapor, HİÇBİR ŞEY yazmaz
//     npm run mahalle-aktar                 → eksik kayıtları oluşturur
//
// 473 MAHALLE ADININ `Region.neighborhoods` → `Neighborhood` AKTARIMI.
//
// ─────────────────────────────────────────────────────────────────────────
// KAYNAK VE HEDEF
//
//   KAYNAK   39 İstanbul ilçesinin `neighborhoods` JSON dizisi (473 ad)
//   HEDEF    `Neighborhood` tablosu
//
// Kaynak alan SİLİNMİYOR. Geçiş şöyle planlandı:
//
//   ŞİMDİ    Region.neighborhoods        (tek kaynak)
//   GEÇİŞ    Neighborhood + eski JSON    (ikisi birlikte, bu tur)
//   HEDEF    Neighborhood                (tek kaynak)
//
// ─────────────────────────────────────────────────────────────────────────
// ADRES BURADA ÜRETİLMİYOR
//
// `canonicalPath` shared/utils/mahalle.ts'ten geliyor — adres politikasının
// tek kaynağı orası. Betik kendi slug'ını hesaplasaydı, veri tabanındaki
// adres ile çalışma zamanındaki adres zamanla ayrışırdı (bir mahalle
// eklendiğinde çakışma durumu değişebiliyor).
//
// ─────────────────────────────────────────────────────────────────────────
// İDEMPOTENT VE PASİF
//
// Var olan kayıt DOKUNULMUYOR: içeriği panelden ya da tohum betiğinden
// yazılmış olabilir. Yalnız eksik olanlar ekleniyor ve hepsi
// `isActive: false` başlıyor — rota bugün zaten çözülüyor diye hiçbir
// sayfa kendiliğinden dizine girmiyor.
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { istanbulIlcesiMi } from '../shared/utils/istanbul.ts'
import { mahalleDizini } from '../shared/utils/mahalle.ts'
import { slugify } from '../shared/utils/slugify.ts'
import { PrismaClient } from './generated/client/client.ts'

const p = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

const YALNIZ_DOGRULA = process.argv.slice(2).includes('--dogrula')

const dizi = (v) => {
  try {
    const x = typeof v === 'string' ? JSON.parse(v) : v
    return Array.isArray(x) ? x : []
  } catch {
    return []
  }
}

// --- kaynak ---------------------------------------------------------------
const bolgeler = await p.region.findMany({
  select: { id: true, slug: true, title: true, subtitle: true, cities: true, neighborhoods: true },
})
const ilceler = bolgeler.filter((r) => istanbulIlcesiMi(r))

const kaynak = ilceler.map((r) => ({
  slug: r.slug,
  ad: (r.subtitle || r.title || r.slug).trim(),
  mahalleler: dizi(r.neighborhoods).map((x) => String(x ?? '').trim()).filter(Boolean),
}))

const kaynakAdedi = kaynak.reduce((t, i) => t + i.mahalleler.length, 0)
const dizin = mahalleDizini(kaynak)

console.log('KAYNAK')
console.log(`  İstanbul ilçesi        ${ilceler.length}`)
console.log(`  mahalle adı            ${kaynakAdedi}`)
console.log(`  üretilen adres         ${dizin.toplam}  (yedek ${dizin.yedekAdedi})`)
console.log(`  adres alamayan         ${kaynakAdedi - dizin.toplam}`)

const ilceyeGoreId = new Map(ilceler.map((r) => [r.slug, r.id]))

// --- hedef ----------------------------------------------------------------
const mevcut = await p.neighborhood.findMany({ select: { canonicalPath: true } })
const mevcutYol = new Set(mevcut.map((m) => m.canonicalPath))

let olusturulan = 0
let zatenVar = 0
let gecersiz = 0
let ebeveynYok = 0
const sorunlar = []

for (const [yol, girdi] of dizin.yolaGore) {
  const districtId = ilceyeGoreId.get(girdi.ilce)
  if (!districtId) {
    ebeveynYok++
    sorunlar.push(`${yol}: ebeveyn ilçe bulunamadı (${girdi.ilce})`)
    continue
  }
  const slug = slugify(girdi.ad)
  if (!slug) {
    gecersiz++
    sorunlar.push(`${yol}: ad slug'a çevrilemedi ("${girdi.ad}")`)
    continue
  }
  if (mevcutYol.has(yol)) {
    zatenVar++
    continue
  }
  if (YALNIZ_DOGRULA) {
    olusturulan++
    continue
  }
  await p.neighborhood.create({
    data: { districtId, name: girdi.ad, slug, canonicalPath: yol, isActive: false },
  })
  olusturulan++
}

// Hedefte olup kaynakta OLMAYAN kayıt (panelden ad silinmiş olabilir).
const dizinYollari = new Set(dizin.yolaGore.keys())
const artakalan = mevcut.filter((m) => !dizinYollari.has(m.canonicalPath))

console.log(`\n${YALNIZ_DOGRULA ? 'DOĞRULAMA' : 'AKTARIM'} SONUCU`)
console.log(`  created                    ${olusturulan}${YALNIZ_DOGRULA ? ' (yazılmadı)' : ''}`)
console.log(`  already existed            ${zatenVar}`)
console.log(`  invalid                    ${gecersiz}`)
console.log(`  missing parent             ${ebeveynYok}`)
console.log(`  path collision unresolved  ${kaynakAdedi - dizin.toplam}`)
console.log(`  kaynakta olmayan kayıt     ${artakalan.length}`)

if (sorunlar.length) {
  console.log('\nSORUNLAR')
  sorunlar.forEach((x) => console.log(`  ${x}`))
}
if (artakalan.length) {
  console.log('\nKAYNAKTA OLMAYAN (elle incelenmeli, betik SİLMEZ)')
  artakalan.forEach((m) => console.log(`  ${m.canonicalPath}`))
}

await p.$disconnect()
