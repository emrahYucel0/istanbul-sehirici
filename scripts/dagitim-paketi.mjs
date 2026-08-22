/**
 * DAĞITIM PAKETİ — sunucuya yüklenecek, sembolik bağlantı içermeyen kopya.
 *
 *     node scripts/dagitim-paketi.mjs
 *
 * NEDEN GEREKLİ
 * Nitro, `.output/server/node_modules` içinde pnpm benzeri bir depo kuruyor:
 * aynı paketin farklı sürümleri `.nitro/` altında bir kez duruyor, kullanan
 * paketlere ise SEMBOLİK BAĞLANTI konuyor. Bu bağlantılar MUTLAK yol taşıyor,
 * örneğin:
 *
 *   .output/server/node_modules/@vue/compiler-core/node_modules/entities
 *     → C:/.../ege-esya/.output/server/node_modules/.nitro/entities@7.0.1
 *
 * Bu klasör sunucuya olduğu gibi taşındığında hedef yol orada bulunmadığı
 * için bağlantı kopuyor ve uygulama şu hatayla açılmıyor:
 *
 *   Error: Cannot find module 'entities/decode'
 *   Require stack: .../@vue/compiler-core/dist/compiler-core.cjs.prod.js
 *
 * Bu betik `.output`'u bağlantıları ÇÖZEREK kopyalıyor; çıkan klasörde hiç
 * sembolik bağlantı kalmıyor, dolayısıyla hangi yöntemle yüklenirse
 * yüklensin (FTP, zip, File Manager) sorun çıkmıyor.
 *
 * Boyut kaygısı yok: bağlantıların tamamı `entities` paketine ait ve paket
 * küçük; ölçüldüğünde toplam boyut değişmiyor.
 */
import { cp, rm, mkdir, readdir, lstat, readlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const KOK = process.cwd()
const KAYNAK = path.join(KOK, '.output')
const HEDEF = path.join(KOK, 'dagitim')

if (!existsSync(KAYNAK)) {
  console.error('.output bulunamadı. Önce `npm run build` çalıştırın.')
  process.exit(1)
}

/** Klasördeki tüm sembolik bağlantıları bulur. */
async function baglantilariBul(dizin, bulunan = []) {
  let girdiler
  try {
    girdiler = await readdir(dizin, { withFileTypes: true })
  } catch {
    return bulunan
  }
  for (const g of girdiler) {
    const tamYol = path.join(dizin, g.name)
    const durum = await lstat(tamYol).catch(() => null)
    if (!durum) continue
    if (durum.isSymbolicLink()) {
      bulunan.push({ yol: tamYol, hedef: await readlink(tamYol).catch(() => '?') })
    } else if (durum.isDirectory()) {
      await baglantilariBul(tamYol, bulunan)
    }
  }
  return bulunan
}

const kaynakBaglantilar = await baglantilariBul(KAYNAK)
console.log(`.output içindeki sembolik bağlantı: ${kaynakBaglantilar.length}`)
for (const b of kaynakBaglantilar) {
  console.log(`   ${path.relative(KOK, b.yol)}`)
}

await rm(HEDEF, { recursive: true, force: true })
await mkdir(HEDEF, { recursive: true })

console.log('\nkopyalanıyor (bağlantılar çözülerek)...')
await cp(KAYNAK, path.join(HEDEF, '.output'), { recursive: true, dereference: true })

// Sunucuda gereken betikler: yedekleme cron'u ve veritabanı teşhisi.
await mkdir(path.join(HEDEF, 'scripts'), { recursive: true })
// Liste BİLEREK açık yazılıyor: scripts/ klasörünün tamamı kopyalansaydı
// yalnızca geliştirme makinesinde anlamlı olan araçlar (gorsel-hazirla,
// font-altkume, duman-testi …) da sunucuya çıkardı.
for (const dosya of ['yedekle.mjs', 'yedek-cron.sh', 'db-baglanti-testi.mjs']) {
  await cp(path.join(KOK, 'scripts', dosya), path.join(HEDEF, 'scripts', dosya))
}

const kalan = await baglantilariBul(HEDEF)
console.log(`\nhedefte kalan sembolik bağlantı: ${kalan.length}`)
for (const b of kalan) console.log(`   KALDI: ${path.relative(KOK, b.yol)} → ${b.hedef}`)

if (kalan.length > 0) {
  console.error('\nBağlantı kaldı — bu paket sunucuda çalışmayabilir.')
  process.exit(1)
}

console.log('\nHazır: dagitim/')
console.log('  dagitim/.output          → /home/KULLANICI/nakliye/.output')
console.log('  dagitim/scripts          → /home/KULLANICI/nakliye/scripts')
console.log('\nBu klasörün İÇİNDEKİLERİ sunucuda uygulama kökine yüklenecek.')
