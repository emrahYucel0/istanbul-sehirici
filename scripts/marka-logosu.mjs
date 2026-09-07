// scripts/marka-logosu.mjs
//
// MARKA YAZISI (WORDMARK) — "EGE KENT NAKLİYAT".
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN BU BETİK VAR
//
// `public/logo.svg` ve `logo-beyaz.svg` EMEKLİ MARKAYA aitti: yeşil
// (#3B5D50) ev sembolü, sarı (#F9BF29) kapı. Site Kâğıt / Mürekkep / Bakır
// paletine geçtiği hâlde bu iki dosya eski kimlikte kalmıştı ve dosyanın
// kendi notuna göre DIŞARIDA kullanılıyorlar: e-posta imzası, Google
// İşletme Profili, sosyal medya. Yani markanın site dışındaki yüzü hâlâ
// eski markaydı.
//
// Yerlerine sembol değil YAZI kondu. Sebep: kare/simge ihtiyacı zaten
// karşılandı — `scripts/marka-ikonu.mjs` koli işaretini üretiyor ve
// profil fotoğrafı, sekme, uygulama simgesi gibi KARE bağlamların tamamı
// onun işi. Bir markanın diğer yarısı yazıdır; imza, antet ve yatay
// yerleşimlerde gereken şey oydu ve yoktu.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN <text> DEĞİL, KONTUR
//
// Bu dosyalar SİTE DIŞINDA açılıyor. Orada Archivo kurulu değil; <text>
// kullanılsaydı logo her ortamda başka bir yazı tipiyle, yani başka bir
// logo olarak görünürdü. Harfler bu yüzden gerçek Archivo konturları:
// `scripts/veri/archivo-790-kapital.json` (üretimi:
// `python scripts/marka-logosu-glifleri.py`). Logo hiçbir yazı tipine
// bağlı değil.
//
// AĞIRLIK 790 — `Footer.vue` içindeki `.fr-marka` ile aynı. Logo, sitedeki
// marka yazısının aynısı; ayrı bir çizim değil.
//
// ═════════════════════════════════════════════════════════════════════════
// HARF ARALIĞI: -0,05em (footer -0,07em)
//
// Aynı olmaması BİLEREK. Footer'daki yazı 51–104px arasında görünüyor;
// logo ise imzada ve antette çoğu zaman 20–40px kapital yüksekliğinde
// basılacak. Tipografide sıkılık punto ile ters orantılı ayarlanır: büyük
// boyda sıkı, küçük boyda açık. Aynı -0,07em küçük boyda harfleri
// birbirine yapıştırırdı. Dört aralık (-0,07 / -0,05 / -0,03 / -0,01)
// üretilip karşılaştırıldı; -0,05em sitenin sıkı karakterini koruyup
// küçük boyda dağılmayan tek değerdi.
//
// ═════════════════════════════════════════════════════════════════════════
// RENK
//
// EGE ve NAKLİYAT: `--c-ink` (#1B1A18). Saf siyah (#000) DEĞİL — sitenin
// hiçbir yerinde saf siyah yok; mürekkep tonu sıcak ve palete ait. Ekranda
// siyah okunuyor, yan yana konduğunda siteye ait duruyor.
//
// KENT: bakır. İki dosyada İKİ FARKLI BASAMAK kullanılıyor ve bu kasıtlı:
//   · logo.svg (kâğıt zemin)     #B4441C — `--c-signal`, açık zeminde
//                                 kontrastı yüksek olan kanonik basamak
//   · logo-beyaz.svg (koyu zemin) #C0592A — bir tık parlak; koyu zeminde
//                                 kanonik basamak sönükleşiyor
// İki ayrı renk değil, aynı bakırın iki zemine göre ayarlanmış hâli.
// Sekme ikonu da koyu karo üzerinde durduğu için #C0592A kullanıyor.
//
// ═════════════════════════════════════════════════════════════════════════
// KUTU (viewBox) TAM MÜREKKEP SINIRINDA
//
// Etrafına pay konmadı: logoyu yerleştiren kişi kendi boşluğunu verir,
// dosyanın içine gömülü bir pay onun ölçüsünü bozar. Kutunun üstü 881
// birim — kapital yüksekliği 686 olmasına rağmen. Fark NAKLİYAT'taki
// İ'nin noktası; o da logonun parçası, kırpılamaz.
//
// KULLANIM
//   node scripts/marka-logosu.mjs      (npm run marka-logosu)
//
// Aynı girdiyle aynı çıktı — yeniden çalıştırılabilir.
import sharp from 'sharp'
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const VERI = 'scripts/veri/archivo-790-kapital.json'
const CIKTI = 'public'

const F = JSON.parse(readFileSync(VERI, 'utf8'))

/**
 * Marka adı burada SABİT — ve bu, sitedeki kuralın istisnası değil.
 * Site içinde ad panelden geliyor (`useSiteSettings().brandName`). Ama bu
 * betik SİTE DIŞI bir varlık üretiyor: logo dosyasının kendisi. Bir logo
 * dosyası çalışma anında değişemez; harfleri çizilmiş bir nesnedir.
 * Marka adı panelden değiştirilirse bu betik yeniden çalıştırılır.
 *
 * İ (U+0130) kaçış dizisiyle yazılıyor: bu karakter kabuk/konsol
 * katmanlarından geçerken U+FFFD'ye dönüşüp veriyi sessizce bozuyor
 * (ölçüldü — bkz. marka-logosu-glifleri.py başlığı).
 */
const KELIMELER = ['EGE', 'KENT', 'NAKLİYAT']
const VURGULU = 1 // dizideki "KENT" — bakır olan kelime

const MUREKKEP = '#1B1A18'
const KAGIT = '#F7F4EF'
const BAKIR_ACIK_ZEMIN = '#B4441C' // --c-signal
const BAKIR_KOYU_ZEMIN = '#C0592A'

const HARF_ARALIK = -0.05 // em
const KELIME_BOSLUK = 0.22 // em

/**
 * Kelimeleri soldan sağa dizer, her kelime için bir <g> üretir ve
 * mürekkep sınırlarını döndürür.
 *
 * Font koordinatları Y YUKARI, SVG ise Y AŞAĞI. Bu yüzden çıktı bir
 * `scale(1,-1)` grubunun içine konuyor ve viewBox'ın tepesi -ust oluyor.
 */
function diz(renkler) {
  const t = HARF_ARALIK * F.upem
  let x = 0
  let ust = -Infinity
  let alt = Infinity
  const gruplar = []

  KELIMELER.forEach((kelime, ki) => {
    const yollar = []
    for (const ch of kelime) {
      const g = F.glifler[ch]
      if (!g) throw new Error(`glif verisi yok: U+${ch.codePointAt(0).toString(16).toUpperCase()}`)
      yollar.push(`<path d="${g.d}" transform="translate(${+x.toFixed(2)} 0)"/>`)
      ust = Math.max(ust, g.sinir[3])
      alt = Math.min(alt, g.sinir[1])
      x += g.ilerleme + t
    }
    gruplar.push(`<g fill="${renkler[ki]}">${yollar.join('')}</g>`)
    // Son harften sonra bir kez fazladan `t` eklendi; kelime boşluğu net
    // KELIME_BOSLUK kadar olsun diye geri alınıyor.
    if (ki < KELIMELER.length - 1) x += KELIME_BOSLUK * F.upem - t
  })

  const sonKelime = KELIMELER[KELIMELER.length - 1]
  const sonHarf = F.glifler[sonKelime[sonKelime.length - 1]]
  const sag = x - sonHarf.ilerleme - t + sonHarf.sinir[2]
  const sol = F.glifler[KELIMELER[0][0]].sinir[0]

  return { ic: gruplar.join(''), sol, sag, ust, alt }
}

function svgKur(bakir, govde) {
  const renkler = KELIMELER.map((_, i) => (i === VURGULU ? bakir : govde))
  const r = diz(renkler)
  const en = r.sag - r.sol
  const boy = r.ust - r.alt
  const vb = `${+r.sol.toFixed(2)} ${+(-r.ust).toFixed(2)} ${+en.toFixed(2)} ${+boy.toFixed(2)}`
  return {
    metin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${KELIMELER.join(' ')}"><g transform="scale(1,-1)">${r.ic}</g></svg>`,
    en,
    boy,
  }
}

const kb = (yol) => (statSync(yol).size / 1024).toFixed(1).padStart(6)

// ── üretim ───────────────────────────────────────────────────────────────
const acik = svgKur(BAKIR_ACIK_ZEMIN, MUREKKEP) // kâğıt zemin için
const koyu = svgKur(BAKIR_KOYU_ZEMIN, KAGIT) // koyu zemin için

writeFileSync(`${CIKTI}/logo.svg`, acik.metin)
writeFileSync(`${CIKTI}/logo-beyaz.svg`, koyu.metin)

// PNG de üretiliyor: dosyanın kendi kullanım notunda geçen Google İşletme
// Profili SVG KABUL ETMİYOR; birçok e-posta istemcisi de SVG'yi engelliyor.
// Zemin SAYDAM — logo hangi zemine konursa ona oturuyor.
const PNG_EN = 1200
for (const [ad, kaynak] of [['logo.png', acik], ['logo-beyaz.png', koyu]]) {
  writeFileSync(`${CIKTI}/${ad}`, await sharp(Buffer.from(kaynak.metin)).resize({ width: PNG_EN }).png({ compressionLevel: 9 }).toBuffer())
}

console.log('MARKA YAZISI — ' + KELIMELER.join(' ') + '   ("KENT" bakır)')
console.log(`  oran ${(acik.en / acik.boy).toFixed(2)}:1   harf aralığı ${HARF_ARALIK}em   ağırlık ${F.agirlik}`)
for (const ad of ['logo.svg', 'logo-beyaz.svg', 'logo.png', 'logo-beyaz.png']) {
  console.log(`  ${ad.padEnd(18)} ${kb(`${CIKTI}/${ad}`)} KB`)
}
