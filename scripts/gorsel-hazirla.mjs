/**
 * GÖRSEL HAZIRLAMA — çevrimdışı, derleme öncesi çalışır.
 *
 *     node scripts/gorsel-hazirla.mjs           (kuru çalıştırma, sadece rapor)
 *     node scripts/gorsel-hazirla.mjs uygula    (dosyaları yazar)
 *
 * NEDEN SUNUCUDA DEĞİL DE BURADA
 * Site paylaşımlı cPanel hosting'de yayınlanıyor. Orada görsel işlemek üç
 * duvara toslar: bellek limiti (sharp bir PNG'yi ham hâlde belleğe açar),
 * CPU kotası (CloudLinux LVE saniye bazında kısar) ve platforma özgü ikili
 * dosya sorunu (Windows'ta derlenen sharp Linux'ta yüklenmez). Bu script
 * işi bir kez burada yapar; sunucu yalnızca hazır dosyayı servis eder.
 *
 * KAYNAK VE HEDEF AYRI
 *   gorsel-kaynak/  → dokunulmayan orijinaller (siteye dağıtılmaz)
 *   public/images/  → üretilen dosyalar (dağıtılan)
 * Bu ayrım şart: çıktı girdinin üzerine yazarsa script her çalıştırıldığında
 * zaten sıkıştırılmış dosyayı yeniden sıkıştırır ve kalite her seferinde biraz
 * daha düşer. Kaynak ayrı olduğu için komut istediğin kadar çalıştırılabilir,
 * sonuç hep aynı olur.
 *
 * NE ÜRETİR
 *   name.jpg                 → 1600px, optimize JPEG (webp desteklemeyen yerler için)
 *   name-160.webp … -2048    → responsive varyantlar
 *   gorsel-varyantlar.json   → hangi dosyanın hangi genişlikleri var (sağlayıcı bunu okur)
 *
 * SVG'ler olduğu gibi kopyalanır (vektör, zaten küçük).
 */
import { readdirSync, statSync, writeFileSync, readFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { join, parse, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..')
const KAYNAK_KLASORU = join(KOK, 'gorsel-kaynak')
const HEDEF_KLASORU = join(KOK, 'public', 'images')
const VARYANT_DOSYASI = join(KOK, 'app', 'providers', 'gorsel-varyantlar.json')

/**
 * Üretilecek genişlikler. Kaynaktan geniş olanlar atlanır (büyütme yapılmaz).
 *
 * Alt uç neden 160'a kadar iniyor: bileşenlerde 48px (yorum avatarı), 220px ve
 * 230px gibi küçük slotlar var. Merdiven 640'ta başlasaydı 48px'lik bir avatar
 * için 640px'lik dosya inecekti — mobilde saçma bir israf.
 * Üst uç neden 2048: 1280px genişliğinde bir kahraman görsel retina ekranda
 * 2560 fiziksel piksel ister; 1600'de kalmak o ekranlarda yumuşak görünüyordu.
 */
const GENISLIKLER = [160, 320, 640, 1024, 1600, 2048]
const WEBP_KALITE = 78
const JPEG_KALITE = 82

/**
 * SAHNE PROFİLİ — ana sayfa V2'nin kompozisyon fotoğrafları.
 *
 * Bu dosyalar yukarıdaki genel profile girmiyor, çünkü iki farklı işleri var:
 *
 *  1) Merdiven farkı. Genel profil 160'tan başlıyor (48px'lik avatar slotları
 *     için). Sahne fotoğrafları hiçbir yerde 320'nin altında gösterilmiyor;
 *     buna karşılık masaüstünde 640 ile 1024 arasında yoğun kullanılıyorlar,
 *     o aralıkta 768 basamağı olmadan 1024 iniyor ve mobil-orta ekranlarda
 *     boşuna bayt gidiyordu.
 *  2) Taban raster yok. Genel profil her kaynağa aynı adla 1600px'lik bir
 *     JPEG/PNG taban dosyası üretiyor (veritabanındaki eski `/images/x.jpg`
 *     kayıtları için). Sahne fotoğraflarını yalnız `NuxtImg` çağırıyor ve
 *     her çağrıda genişlik veriyor — yani taban dosya hiç istenmiyor. PNG
 *     tabanı üretmek dağıtım paketine ~2 MB ekliyor, üstelik `palette: true`
 *     ile 256 renge inen bir fotoğraf gözle görülür şekilde bantlanıyor.
 *
 * Bu set daha önce elle üretilmişti; buraya alınmasının sebebi tek komutun
 * (`npm run gorseller`) her şeyi yeniden üretebilmesi. Aksi hâlde komut bir
 * daha çalıştırıldığında bu dosyaların varyant kayıtları genel profille
 * ezilirdi.
 */
const SAHNE = new Set([
  'hero-istanbul',
  'stage-a',
  'stage-b',
  'bleed-sabitleme',
  'sahne-kat',
  'sahne-erisim',
  'sahne-paketleme',
  'sahne-sokum',
])
const SAHNE_GENISLIKLER = [320, 640, 768, 1024]

/**
 * Sahne profili neden 78 değil 52 kalitede: bu set LCP'yi doğrudan belirliyor
 * ve sayfanın en ağır transferi.
 *
 * 78 → 62 → 52 basamakları 1:1 kırpmada karşılaştırıldı; en zorlayıcı iki
 * kare seçildi (paketleme makrosunun karton/balonlu naylon dokusu ve
 * kahraman karenin ambalaj yüzeyi). Üçü arasında gözle fark yok, buna
 * karşılık 78'den 52'ye inince dosya üçte bir küçülüyor. Bu set masaüstünde
 * en fazla 1,4 kat büyütülerek gösteriliyor, yani 768'lik varyant neredeyse
 * 1:1 izleniyor — karşılaştırma tam o ölçekte yapıldı.
 *
 * Panel görselleri ve veritabanındaki eski kayıtlar 78'de kalıyor; onlar bu
 * bütçeyi paylaşmıyor ve tek karede LCP belirlemiyorlar.
 */
const SAHNE_KALITE = 52

const UYGULA = process.argv[2] === 'uygula'
const mb = (b) => (b / 1048576).toFixed(2)

const varyantlar = {}
let oncesi = 0
let sonrasi = 0
const rapor = []

if (!existsSync(KAYNAK_KLASORU)) {
  console.error(
    `Kaynak klasör yok: gorsel-kaynak/\n` +
    `Orijinal görselleri oraya koy; bu komut onları okuyup public/images altına\n` +
    `optimize edilmiş hâllerini üretir. Kaynak klasör siteye dağıtılmaz.`
  )
  process.exit(1)
}

mkdirSync(HEDEF_KLASORU, { recursive: true })

// SVG'ler işlenmez, olduğu gibi kopyalanır.
let svgSayisi = 0
for (const dosyaAdi of readdirSync(KAYNAK_KLASORU)) {
  if (!/\.svg$/i.test(dosyaAdi)) continue
  if (UYGULA) copyFileSync(join(KAYNAK_KLASORU, dosyaAdi), join(HEDEF_KLASORU, dosyaAdi))
  svgSayisi++
}

for (const dosyaAdi of readdirSync(KAYNAK_KLASORU).sort((a, b) => a.localeCompare(b, 'tr'))) {
  if (!/\.(jpe?g|png)$/i.test(dosyaAdi)) continue

  const kaynakYol = join(KAYNAK_KLASORU, dosyaAdi)
  const { name } = parse(dosyaAdi)
  const hamBoyut = statSync(kaynakYol).size
  oncesi += hamBoyut

  // Kaynak ÖNCE belleğe alınıyor. sharp'a dosya yolu verilirse Windows'ta
  // dosya tutamacı açık kalıyor ve aynı ada yazmaya çalıştığımızda
  // "UNKNOWN: open" ile patlıyor — çıktı girdinin üzerine yazdığı için bu
  // kaçınılmazdı. Tampondan okuyunca kaynakla bağ kopuyor.
  const kaynak = readFileSync(kaynakYol)

  const meta = await sharp(kaynak).metadata()
  const kaynakGenislik = meta.width ?? 0
  const sahne = SAHNE.has(name)

  // 1) Taban dosya: aynı adla, 1600px'e indirilmiş, optimize JPEG.
  //    Aynı adı koruyoruz çünkü veritabanında 137 kayıt /images/nakliye2.jpg
  //    diye bu yolu tutuyor — yol değişirse hepsini güncellemek gerekirdi.
  //    Sahne profilinde taban üretilmiyor (gerekçe SAHNE tanımında).
  const tabanGenislik = Math.min(kaynakGenislik || 1600, 1600)
  const taban = sahne
    ? null
    : await sharp(kaynak)
        .resize({ width: tabanGenislik, withoutEnlargement: true })
        .jpeg({ quality: JPEG_KALITE, mozjpeg: true })
        .toBuffer()

  let yeniToplam = taban ? taban.length : 0
  const uretilen = []

  // 2) Responsive webp varyantları
  for (const g of (sahne ? SAHNE_GENISLIKLER : GENISLIKLER)) {
    if (kaynakGenislik && g > kaynakGenislik) continue   // büyütme yok
    const tampon = await sharp(kaynak)
      .resize({ width: g, withoutEnlargement: true })
      .webp({ quality: sahne ? SAHNE_KALITE : WEBP_KALITE })
      .toBuffer()
    yeniToplam += tampon.length
    uretilen.push({ genislik: g, tampon })
  }

  // Kaynak, üretilen en büyük basamaktan genişse kendi genişliğinde de bir
  // varyant üret. Aksi hâlde 1536px'lik bir görselde 2048 elenir, en büyük
  // varyant 1024'te kalır ve elde olan çözünürlüğün yarısı çöpe gider —
  // `100vw` ile gösterilen bir görselde bu gözle görülür bulanıklık demek.
  const enBuyuk = uretilen.length ? uretilen[uretilen.length - 1].genislik : 0
  const kaynakTavan = Math.min(kaynakGenislik || 0, 2560)
  if (kaynakTavan > enBuyuk) {
    const tampon = await sharp(kaynak)
      .resize({ width: kaynakTavan, withoutEnlargement: true })
      .webp({ quality: sahne ? SAHNE_KALITE : WEBP_KALITE })
      .toBuffer()
    yeniToplam += tampon.length
    uretilen.push({ genislik: kaynakTavan, tampon })
  }

  sonrasi += yeniToplam
  rapor.push({ dosyaAdi, kaynakGenislik, hamBoyut, yeniToplam, adet: uretilen.length })

  // Taban dosyanın uzantısı kaynağınkiyle AYNI kalır. Sebebi: veritabanındaki
  // 137 kayıt ve bileşenler görseli `/images/nakliye3.png` gibi kendi
  // uzantısıyla tutuyor; hepsini .jpg'ye çevirmek o referansları kırardı.
  const tabanUzanti = /\.png$/i.test(dosyaAdi) ? 'png' : 'jpg'
  const onEk = `/images/${name}-`

  // Sağlayıcının okuyacağı harita: kaynak yol -> mevcut genişlikler.
  // Sahne profilinde ANAHTAR `.webp`: bileşenler bu seti `/images/x.webp`
  // diye çağırıyor, kaynak dosyanın PNG olması onları ilgilendirmiyor.
  // Taban da 1024'lük webp — o profilde raster taban üretilmiyor.
  varyantlar[sahne ? `/images/${name}.webp` : `/images/${dosyaAdi}`] = {
    taban: sahne ? `${onEk}1024.webp` : `/images/${name}.${tabanUzanti}`,
    genislikler: uretilen.map((u) => u.genislik),
    onEk,
  }

  if (UYGULA) {
    if (taban) {
      const tabanTampon = tabanUzanti === 'png'
        ? await sharp(kaynak).resize({ width: tabanGenislik, withoutEnlargement: true })
            .png({ compressionLevel: 9, palette: true }).toBuffer()
        : taban
      writeFileSync(join(HEDEF_KLASORU, `${name}.${tabanUzanti}`), tabanTampon)
    }

    for (const u of uretilen) {
      writeFileSync(join(HEDEF_KLASORU, `${name}-${u.genislik}.webp`), u.tampon)
    }
  }
}

rapor.sort((a, b) => b.hamBoyut - a.hamBoyut)
console.log('dosya'.padEnd(26) + 'kaynak'.padStart(7) + 'öncesi'.padStart(10) + 'sonrası'.padStart(10) + '  varyant')
console.log('-'.repeat(66))
for (const r of rapor) {
  console.log(
    r.dosyaAdi.padEnd(26) + String(r.kaynakGenislik).padStart(6) + 'px' +
    (mb(r.hamBoyut) + ' MB').padStart(9) + (mb(r.yeniToplam) + ' MB').padStart(10) +
    String(r.adet).padStart(8)
  )
}
console.log('-'.repeat(66))
console.log(`TOPLAM${' '.repeat(22)}${(mb(oncesi) + ' MB').padStart(17)}${(mb(sonrasi) + ' MB').padStart(10)}`)
console.log(`kazanç: %${((1 - sonrasi / oncesi) * 100).toFixed(0)}`)
console.log(`${rapor.length} raster + ${svgSayisi} SVG (SVG'ler olduğu gibi kopyalandı)`)

if (UYGULA) {
  mkdirSync(dirname(VARYANT_DOSYASI), { recursive: true })
  writeFileSync(VARYANT_DOSYASI, JSON.stringify(varyantlar, null, 2) + '\n', 'utf8')
  console.log(`\nvaryant haritası yazıldı: app/providers/gorsel-varyantlar.json (${Object.keys(varyantlar).length} kayıt)`)
} else {
  console.log('\n(kuru çalıştırma — yazmak için: node scripts/gorsel-hazirla.mjs uygula)')
}
