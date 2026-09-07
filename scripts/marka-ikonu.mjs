// scripts/marka-ikonu.mjs
//
// SEKME İKONU (FAVICON) — TEK GEOMETRİDEN BÜTÜN BOYUTLAR.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN BU BETİK VAR
//
// Depoda duran ikon seti EMEKLİ MARKAYA aitti: yeşil (#3B5D50) karo,
// beyaz ev, sarı (#F9BF29) kapı. İki ayrı sorunu vardı.
//
//   1. RENK. Site Kâğıt / Mürekkep / Bakır paletine geçti (`tokens.css`).
//      Yeşil ve kehribar artık sitede HİÇBİR yerde geçmiyor. Sekmedeki
//      ikon, açılan sayfayla aynı markayı göstermiyordu.
//
//   2. KONU. Ev + kapı EMLAK ikonografisi. Site ev satmıyor, İstanbul
//      içinde EŞYA TAŞIYOR. Üstelik "kapaklı çatı" biçimi ölçümde
//      (48px) yeniden ev gibi okunduğu için taslak aşamasında elendi.
//
// YENİ İŞARET: KOLİ — kapak, gövde ve kapağı mühürleyen bakır bant.
//
// NEDEN BAKIR YALNIZ BANTTA
// `kesit-cizimleri.mjs` bu sitenin çizim dilini şöyle kuruyor: bakır,
// ÖLÇÜLEN ASIL ŞEYİ işaretler ve her çizimde YALNIZ BİR argüman vardır.
// Kolide o tek şey mühür: kapağın kapandığı yer. Bakır oraya kondu,
// başka hiçbir yere.
//
// Taslakta bakırın kutunun DIŞINA taşan bir ölçü çizgisi olduğu bir
// varyant da denendi (daha "teknik" duruyordu) ve ELENDİ: sitenin kendi
// disiplini süsü reddediyor (`Kapanis.vue`: "kart / panel / form yok").
// Bant, gerçekte bandın olduğu yerde duruyor; efekt için uzamıyor.
//
// ═════════════════════════════════════════════════════════════════════════
// 16 PİKSELDE NE AYAKTA KALIYOR — ÖLÇÜLDÜ, TAHMİN EDİLMEDİ
//
// Taslaklar 16/32/48'de üretilip 8× büyütülerek karşılaştırıldı. İki
// ölçüm bugünkü geometriyi belirledi:
//
//   · İNCE DİKEY BAKIR ÖLÜYOR. 2,6 birim genişliğinde dikey bir ek yeri
//     16px'te 1,3 piksele iniyor; kenar yumuşatma onu iki yanındaki
//     kâğıtla karıştırıyor ve bakır PEMBEYE dönüyor. Yatay bant ise tüm
//     genişliği kat ettiği için uzunluğu boyunca hiç seyrelmiyor.
//     → Bant yatay. Kalınlığı 2,2 birim: 16px'te 1,1 piksel, yani bir
//       tam pikselin altına düşmüyor.
//
//   · KAPAK TAŞMASI SİLÜETİ KURTARIYOR. Kapak ve gövde aynı genişlikte
//     olduğunda işaret 16px'te "iki açık şerit" gibi okunuyordu. Gövde
//     her iki yandan 1,6 birim içeri alınınca silüetin kendisi koliyi
//     söylüyor — iç detaya gerek kalmadan.
//
// BAKIR TONU: #C0592A. `--c-signal` (#B4441C) da denendi; mürekkep
// zeminde 16px'te merkez piksel rgb(154,75,47)'ye düşüyor, #C0592A ise
// rgb(163,89,56)'da kalıyor. `kesit-cizimleri.mjs` de aynı gerekçeyle
// zaten bu tonu kullanıyor — yeni renk icat edilmedi, kütükten alındı.
//
// KARO NEDEN DOLU (ŞEFFAF DEĞİL)
// Eski dosyanın notu doğruydu ve ölçümle tekrar doğrulandı: sekme şeridi
// açık da (#DEE1E6) koyu da (#2B2D30) olabiliyor. Şeffaf bir sembol
// birinde kayboluyor. Dolu mürekkep karo ikisinde de seçiliyor.
//
// KULLANIM
//   node scripts/marka-ikonu.mjs      (npm run marka-ikonu)
//
// Aynı girdiyle aynı çıktı — yeniden çalıştırılabilir.
import sharp from 'sharp'
import { writeFileSync, statSync } from 'node:fs'

const CIKTI = 'public'

/**
 * PALET — sitenin kütüğünden, yeni renk YOK.
 *   murekkep  --c-ink    (27 26 24)   karo zemini
 *   kagit     --c-paper  (247 244 239) kolinin gövdesi
 *   bakir     kesit çizimlerinin `etkin` tonu — mühür
 */
const R = {
  murekkep: '#1B1A18',
  kagit: '#F7F4EF',
  bakir: '#C0592A',
}

/**
 * GEOMETRİ — 32 birimlik karede. Sayılar 16px ölçümünden geldi (yukarı).
 *
 * Dikey denge: kapak 6,8'de başlıyor, gövde 25,2'de bitiyor → işaretin
 * merkezi tam 16,0, yani karonun optik merkezi. Yatay: kapak ve bant
 * 5,6–26,4 (merkez 16), gövde 7,2–24,8 (merkez 16).
 */
const G = {
  karo: 32,
  yaricap: 7, // eski ikonla aynı — sekmede denenmiş ve tutmuş bir değer

  kapakX: 5.6,
  kapakY: 6.8,
  kapakEn: 20.8,
  kapakBoy: 6.4,

  bantY: 13.2,
  bantBoy: 2.2, // 16px'te 1,1 piksel — tam pikselin altına düşmüyor

  govdeX: 7.2,
  govdeY: 15.4,
  govdeEn: 17.6, // kapaktan 1,6 birim dar → taşma, silüetten koli okunuyor
  govdeBoy: 9.8,
}

/**
 * İşaretin kendisi. `yaricap` 0 verilirse karo tam taşar (apple-touch).
 *
 * NEDEN APPLE-TOUCH KÖŞESİZ: iOS ikonu KENDİ süperelips maskesiyle
 * kırpıyor. Dosyaya ayrıca yuvarlatma konulursa, bizim köşemizle iOS'un
 * maskesi arasında kalan şerit saydam kalıyor ve cihaz orayı siyaha
 * dolduruyor — koyu karonun etrafında ikinci, daha koyu bir çerçeve
 * çıkıyor. Tam taşan mürekkep bunu tamamen ortadan kaldırıyor.
 */
function isaret(yaricap = G.yaricap) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G.karo} ${G.karo}" width="${G.karo}" height="${G.karo}">
  <rect width="${G.karo}" height="${G.karo}"${yaricap ? ` rx="${yaricap}"` : ''} fill="${R.murekkep}"/>
  <rect x="${G.kapakX}" y="${G.kapakY}" width="${G.kapakEn}" height="${G.kapakBoy}" fill="${R.kagit}"/>
  <rect x="${G.govdeX}" y="${G.govdeY}" width="${G.govdeEn}" height="${G.govdeBoy}" fill="${R.kagit}"/>
  <rect x="${G.kapakX}" y="${G.bantY}" width="${G.kapakEn}" height="${G.bantBoy}" fill="${R.bakir}"/>
</svg>`
}

const png = (svg, px) => sharp(Buffer.from(svg)).resize(px, px).png({ compressionLevel: 9 }).toBuffer()

/**
 * ICO KABI — içine PNG gömülüyor (Vista+ ve bütün güncel tarayıcılar
 * destekliyor; klasik BMP gövdesine gerek yok).
 *
 * NEDEN .ico HÂLÂ GEREKLİ: `<link>` etiketlerini görmeyen ya da onlardan
 * ÖNCE davranan istemciler var — tarayıcı sekmesi ilk boyamada, Windows
 * kısayolları ve bazı RSS/sohbet önizlemeleri doğrudan kökteki
 * /favicon.ico'yu istiyor. Depoda `favicon.ico` YOKTU (adı yanlışlıkla
 * `favicon.ico.png` idi), yani bu istekler 404 dönüyordu.
 *
 * Yapı: ICONDIR (6 bayt) + her boyut için ICONDIRENTRY (16 bayt) + veri.
 */
function icoKur(pngler) {
  const BASLIK = 6
  const GIRDI = 16
  const basi = Buffer.alloc(BASLIK)
  basi.writeUInt16LE(0, 0) // ayrılmış
  basi.writeUInt16LE(1, 2) // tür: 1 = ikon
  basi.writeUInt16LE(pngler.length, 4)

  let ofset = BASLIK + GIRDI * pngler.length
  const girdiler = pngler.map(({ px, veri }) => {
    const g = Buffer.alloc(GIRDI)
    g.writeUInt8(px >= 256 ? 0 : px, 0) // 0 = 256
    g.writeUInt8(px >= 256 ? 0 : px, 1)
    g.writeUInt8(0, 2) // palet yok
    g.writeUInt8(0, 3) // ayrılmış
    g.writeUInt16LE(1, 4) // renk düzlemi
    g.writeUInt16LE(32, 6) // bit/piksel
    g.writeUInt32LE(veri.length, 8)
    g.writeUInt32LE(ofset, 12)
    ofset += veri.length
    return g
  })
  return Buffer.concat([basi, ...girdiler, ...pngler.map((p) => p.veri)])
}

const kb = (yol) => (statSync(yol).size / 1024).toFixed(1).padStart(7)

// ── üretim ───────────────────────────────────────────────────────────────
const svgYuvarlak = isaret()
const svgTasan = isaret(0)

writeFileSync(`${CIKTI}/favicon.svg`, svgYuvarlak)

// Sekme boyutları + büyük boy. 512 açık grafiklerde ve masaüstü
// kısayollarında kullanılıyor; apple-touch 180 iOS'un beklediği ölçü.
const boyutlar = [16, 32, 48, 512]
for (const px of boyutlar) {
  writeFileSync(`${CIKTI}/favicon-${px}.png`, await png(svgYuvarlak, px))
}
writeFileSync(`${CIKTI}/apple-touch-icon.png`, await png(svgTasan, 180))

// .ico içine 16/32/48 giriyor. 512 GİRMİYOR: .ico'yu okuyan istemciler
// dosyanın tamamını indiriyor, büyük boy oraya konursa 16 piksellik bir
// sekme için onlarca kilobayt gereksiz yere iniyor.
writeFileSync(
  `${CIKTI}/favicon.ico`,
  icoKur(await Promise.all([16, 32, 48].map(async (px) => ({ px, veri: await png(svgYuvarlak, px) })))),
)

console.log('MARKA İKONU — koli / mürekkep karo / bakır mühür')
for (const ad of ['favicon.svg', 'favicon.ico', 'favicon-16.png', 'favicon-32.png', 'favicon-48.png', 'favicon-512.png', 'apple-touch-icon.png']) {
  console.log(`  ${ad.padEnd(22)} ${kb(`${CIKTI}/${ad}`)} KB`)
}
