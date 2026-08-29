// scripts/harita-cizimi.mjs
//
// İSTANBUL HARİTASINI SAYFANIN ÇİZGİ DİLİNE ÇEVİRİR.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN BU BETİK VAR
//
// Kapsam bölümünün arkasında bir İstanbul haritası duruyor. Harita
// ELDE ÇİZİLMEDİ: uydurulmuş bir kıyı şeridi ya da uydurulmuş ilçe
// sınırları, veri gibi görünen ama doğru olmayan bir grafik olurdu.
//
// Kaynak, depoda zaten duran gerçek harita: `istanbul-harita-gorseli.png`
// (1448×1086, saydam zeminli). Sorun geometride değil SUNUMDA — kare koyu
// zeminli, JPEG artefaktlı ve renk lekeli; sayfanın kâğıt/mürekkep diline
// hiç uymuyor.
//
// Bu betik geometriye DOKUNMADAN sunumu çeviriyor:
//   1. her pikselin "mürekkep ağırlığı" hesaplanıyor
//        w = (alfa / 255) × (1 − parlaklık / 255)
//      yani hem saydam olmayan hem koyu olan piksel çok mürekkep demek.
//      Kıyı çizgisi ve yollar bu yüzden kalıyor, açık gri kara dolgusu
//      neredeyse tamamen siliniyor.
//   2. ağırlık bir eğriden geçiriliyor (KONTRAST/GAMA) — çizgiler ayrışsın,
//      artefakt gürültüsü eşiğin altında kalsın.
//   3. RGB tek bir mürekkep tonuna sabitleniyor. Kaynaktaki kırmızı/sarı
//      lekeler parlaklığa indirgendiği için kendiliğinden kayboluyor.
//   4. sonuç saydam WebP olarak yazılıyor; sayfa onu kendi kâğıt zemini
//      üzerinde birleştiriyor, yani zemin rengi CSS'te kalıyor.
//
// KULLANIM
//   node scripts/harita-cizimi.mjs              (yalnız varlık)
//   node scripts/harita-cizimi.mjs --onizleme  (+ kâğıt zeminli önizleme)
//
// Yeniden çalıştırılabilir: kaynak değişmediyse çıktı da aynı.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const KAYNAK = 'public/images/istanbul-harita-gorseli.png'
const HEDEF = 'public/images/istanbul-harita-cizim.webp'

/** Mürekkep tonu — `--c-ink` (27 26 24). Sayfada tek renk ailesi. */
const INK = [27, 26, 24]

/**
 * Eğri parametreleri. Üçü de ÖLÇÜLEREK seçildi (histogram: parlaklık
 * 48–207 arasında iki tümsek; koyu tümsek kıyı/sınır, açık tümsek kara).
 *   ESIK      bunun altındaki ağırlık tamamen atılıyor → artefakt gürültüsü
 *   KAZANC    eşik üstü ağırlığı yayan çarpan
 *   GAMA      <1 açık çizgileri de görünür kılıyor, >1 yalnız koyuları
 *   TAVAN     en koyu pikselin bile geçemeyeceği opaklık — harita bir
 *             filigran, bir illüstrasyon değil
 */
const ESIK = 0.11
const KAZANC = 2.3
const GAMA = 1.25
const TAVAN = 0.58

const kirp = (x, a, b) => (x < a ? a : x > b ? b : x)

const { data, info } = await sharp(KAYNAK)
  .raw()
  .toBuffer({ resolveWithObject: true })

const cikti = Buffer.alloc(info.width * info.height * 4)
let yazilan = 0

for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
  const a = (info.channels === 4 ? data[i + 3] : 255) / 255
  const parlaklik = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
  const agirlik = a * (1 - parlaklik)

  let o = 0
  if (agirlik > ESIK) {
    o = kirp(Math.pow((agirlik - ESIK) * KAZANC, GAMA), 0, 1) * TAVAN
  }

  cikti[j] = INK[0]
  cikti[j + 1] = INK[1]
  cikti[j + 2] = INK[2]
  cikti[j + 3] = Math.round(o * 255)
  if (o > 0) yazilan++
}

const ham = sharp(cikti, { raw: { width: info.width, height: info.height, channels: 4 } })
await ham.clone().webp({ quality: 82, alphaQuality: 92, effort: 6 }).toFile(HEDEF)

/**
 * RESPONSIVE VARYANTLAR — ölçülen bir mobil maliyetin karşılığı.
 *
 * Kare `NuxtImg` DEĞİL (gerekçe Kapsam.vue'da: IPX bu saydam WebP'yi
 * yeniden kodlarken çizgileri bulanıklaştırıyor). Ama tek dosya olarak
 * kalınca 390px'lik bir ekrana 1448px'lik 253 KB'lık görsel iniyordu —
 * Lighthouse mobil koşusunda sayfanın EN BÜYÜK kaynağı, hero'nun on
 * katı. Ölçüldü, tahmin değil.
 *
 * Çözüm boru hattını değiştirmiyor: varyantlar da BURADA, aynı mürekkep
 * tamponundan, aynı webp ayarlarıyla üretiliyor. Çalışma anında yeniden
 * kodlama yok; `<img>` yalnız hazır dosyalar arasından seçiyor.
 *
 * Basamaklar render ölçümünden: mobil 360–390, tablet 834, masaüstü
 * 1440, 2560+ ekranda 1980 (kaynak 1448 olduğu için orada zaten taban
 * dosya kullanılıyor).
 */
const VARYANTLAR = [480, 768, 1024]
const uretilen = []
for (const g of VARYANTLAR) {
  if (g >= info.width) continue
  const yol = HEDEF.replace(/\.webp$/, `-${g}.webp`)
  await ham
    .clone()
    .resize({ width: g, kernel: 'lanczos3', withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 92, effort: 6 })
    .toFile(yol)
  uretilen.push([g, yol, readFileSync(yol).length])
}

const bayt = readFileSync(HEDEF)
const ozet = createHash('sha256').update(bayt).digest('hex').slice(0, 12)

console.log('kaynak :', KAYNAK, `${info.width}×${info.height}`)
console.log('hedef  :', HEDEF, (bayt.length / 1024).toFixed(0) + 'KB', 'sha256:' + ozet)
console.log('mürekkep taşıyan piksel: %' + ((yazilan / (info.width * info.height)) * 100).toFixed(1))
console.log('eğri   : eşik', ESIK, '· kazanç', KAZANC, '· gama', GAMA, '· tavan', TAVAN)
for (const [g, yol, b] of uretilen) {
  console.log('varyant:', String(g).padStart(4), yol, (b / 1024).toFixed(0) + 'KB')
}

// Önizleme yalnız `--onizleme` ile üretiliyor: karenin kâğıt zemine
// bindirilmiş hâli, yani sayfada nasıl görüneceği. Varsayılan olarak
// yazılmıyor ki `public/` içinde ölü dosya kalmasın.
if (process.argv.includes('--onizleme')) {
  const ONIZLEME = 'public/images/_harita-onizleme.png'
  await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 4,
      background: { r: 247, g: 244, b: 239, alpha: 1 },
    },
  })
    .composite([{ input: HEDEF }])
    .png()
    .toFile(ONIZLEME)
  console.log('önizleme:', ONIZLEME)
}
