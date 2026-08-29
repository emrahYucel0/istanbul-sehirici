// scripts/kesit-cizimleri.mjs
//
// ÜÇ İSTANBUL KOŞULUNUN TEKNİK ÇİZİMİ — VEKTÖR, HESAPLANMIŞ GEOMETRİ.
//
// ═════════════════════════════════════════════════════════════════════════
// NEDEN BU BETİK VAR
//
// Bölüm 02'nin üç karesi fotoğraf taşıyordu. Fotoğraflar düşük çözünürlüklü
// ve kadrajları zayıftı; koreografi güçlüydü ama içine koyduğu malzeme
// değildi. Yerlerine ÇİZİM konuldu — ve çizim "fotoğrafın yerine geçen
// süs" değil, metnin söylediği şeyin KANITI:
//
//   01  DAR SOKAK   metin diyor ki ölçülen şey sokağın genişliği değil,
//                   aracın durabildiği nokta ile kapı arasındaki GERÇEK
//                   yürüme mesafesi. Çizim tam olarak o mesafeyi ölçüyor —
//                   üstelik etiketteki sayı, çizilen yolun uzunluğundan
//                   HESAPLANIYOR; elle yazılmıyor.
//
//   02  KAT         metin diyor ki belirleyici olan kat sayısı değil,
//                   merdivenin dönüş sahanlığı. Çizim koltuğun dönüş
//                   zarfını sahanlığın üstüne bindiriyor: sığmadığı
//                   geometriden okunuyor, cümleden değil.
//
//   03  ERİŞİM      metin diyor ki randevusuz araç kapıda bekler. Çizim
//                   iki rotayı yan yana koyuyor: biri bariyerde bitiyor.
//
// NEDEN VEKTÖR
//   · 3840'ta da net. Raster kaynak 2.5× büyütülüyordu.
//   · Dosya ~20KB. Fotoğraf karesi 250KB+ idi.
//   · Sayılar değişken: kat, sahanlık, sokak genişliği burada birer sabit.
//     Değiştirin, çizim kendini yeniden kurar.
//
// PALET tek yerde (aşağıdaki `R`). Mavi teknik çizim diline geçilecekse
// `R.yapi` değerini değiştirmek yeterli; başka hiçbir yere dokunulmaz.
//
// KULLANIM
//   node scripts/kesit-cizimleri.mjs
//
// Çıktı: public/yuklemeler/kesit-*.svg  (üç dosya)
// Aynı girdiyle aynı çıktı — yeniden çalıştırılabilir.
import { writeFileSync, mkdirSync, statSync } from 'node:fs'

const CIKTI = 'public/yuklemeler'

/**
 * PALET — sitenin kütüğünden. Yeni renk YOK.
 *   yapi    taşıyıcı geometri (mürekkep)
 *   olcu    ikincil / ölçü / bağlam (ölçü grisi)
 *   etkin   ölçülen ASIL şey (bakır) — her çizimde yalnız BİR argüman
 */
const R = {
  yapi: '#1B1A18',
  olcu: '#B9AE9C',
  etkin: '#C0592A',
  poche: '#DCD4C7',
}

const MONO = "ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"

// ═════════════════════════════════════════════════════════════ İLKELLER

const yuvarla = (n) => Math.round(n * 100) / 100

class Kagit {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.p = []
    // Çizilen her şeyin sınırı. Kare üstünde scale(1.10)'a kadar mikro
    // parallax var; içerik %8 güvenli payın dışına çıkarsa KIRPILIR.
    // Bu yüzden sınır tahmin edilmiyor, biriktiriliyor.
    this.sinir = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity }
  }

  gor(x1, y1, x2, y2) {
    this.sinir.x1 = Math.min(this.sinir.x1, x1, x2)
    this.sinir.y1 = Math.min(this.sinir.y1, y1, y2)
    this.sinir.x2 = Math.max(this.sinir.x2, x1, x2)
    this.sinir.y2 = Math.max(this.sinir.y2, y1, y2)
  }

  ek(s) {
    this.p.push(s)
    return this
  }

  cizgi(x1, y1, x2, y2, { renk = R.yapi, kalinlik = 1, kesik = null } = {}) {
    this.gor(x1, y1, x2, y2)
    return this.ek(
      `<line x1="${yuvarla(x1)}" y1="${yuvarla(y1)}" x2="${yuvarla(x2)}" y2="${yuvarla(y2)}" stroke="${renk}" stroke-width="${kalinlik}"${kesik ? ` stroke-dasharray="${kesik}"` : ''}/>`
    )
  }

  kutu(x, y, w, h, { renk = R.yapi, kalinlik = 1, dolgu = 'none', kesik = null, r = 0 } = {}) {
    this.gor(x, y, x + w, y + h)
    return this.ek(
      `<rect x="${yuvarla(x)}" y="${yuvarla(y)}" width="${yuvarla(w)}" height="${yuvarla(h)}" rx="${r}" fill="${dolgu}" stroke="${renk}" stroke-width="${kalinlik}"${kesik ? ` stroke-dasharray="${kesik}"` : ''}/>`
    )
  }

  yol(d, { renk = R.yapi, kalinlik = 1, dolgu = 'none', kesik = null, uc = 'butt' } = {}) {
    return this.ek(
      `<path d="${d}" fill="${dolgu}" stroke="${renk}" stroke-width="${kalinlik}" stroke-linecap="${uc}" stroke-linejoin="round"${kesik ? ` stroke-dasharray="${kesik}"` : ''}/>`
    )
  }

  nokta(x, y, r = 3.2, renk = R.etkin) {
    this.gor(x - r, y - r, x + r, y + r)
    return this.ek(`<circle cx="${yuvarla(x)}" cy="${yuvarla(y)}" r="${r}" fill="${renk}"/>`)
  }

  yazi(x, y, metin, { renk = R.yapi, boyut = 11, hiza = 'start', aralik = 1.2, dondur = 0, agirlik = 400 } = {}) {
    // Metin kutusu ÖLÇÜLEMEZ (font yok), tahmin ediliyor: mono karakter
    // genişliği ≈ 0.62em + harf aralığı.
    const g = metin.length * (boyut * 0.62 + aralik)
    const sx = hiza === 'middle' ? x - g / 2 : hiza === 'end' ? x - g : x
    if (!dondur && metin) this.gor(sx, y - boyut, sx + g, y + boyut * 0.3)
    const t = dondur
      ? `transform="translate(${yuvarla(x)} ${yuvarla(y)}) rotate(${dondur})"`
      : `x="${yuvarla(x)}" y="${yuvarla(y)}"`
    return this.ek(
      `<text ${t} fill="${renk}" font-family="${MONO}" font-size="${boyut}" font-weight="${agirlik}" letter-spacing="${aralik}" text-anchor="${hiza}">${metin}</text>`
    )
  }

  /** Ölçü çizgisi: iki uçta serif, ortada etiket. */
  olcu(x1, y1, x2, y2, etiket, { renk = R.olcu, yaziRenk = null, boyut = 10.5, kaydir = 0 } = {}) {
    const dikey = Math.abs(x2 - x1) < 0.5
    const s = 5
    this.cizgi(x1, y1, x2, y2, { renk, kalinlik: 0.9 })
    for (const [x, y] of [[x1, y1], [x2, y2]]) {
      dikey
        ? this.cizgi(x - s, y, x + s, y, { renk, kalinlik: 0.9 })
        : this.cizgi(x, y - s, x, y + s, { renk, kalinlik: 0.9 })
    }
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const rk = yaziRenk || (renk === R.etkin ? R.etkin : R.yapi)
    return dikey
      ? this.yazi(mx - 10 + kaydir, my + 3.5, etiket, { renk: rk, boyut, hiza: 'end' })
      : this.yazi(mx + kaydir, my + 17, etiket, { renk: rk, boyut, hiza: 'middle' })
  }

  /** Poché — kesilen duvar dolgusu. Taralı değil, açık ton: kâğıt sakin kalsın. */
  duvar(x, y, w, h) {
    return this.kutu(x, y, w, h, { dolgu: R.poche, renk: R.yapi, kalinlik: 1 })
  }

  /** Açıklama oku: kırık çizgi + uç noktası + etiket. */
  aciklama(x, y, hx, hy, etiket, { renk = R.olcu, hiza = 'start', boyut = 10 } = {}) {
    this.yol(`M${yuvarla(x)} ${yuvarla(y)} H${yuvarla(hx)}`, { renk, kalinlik: 0.9 })
    this.cizgi(x, y, x, y, { renk })
    this.nokta(x, y, 2.4, renk)
    return this.yazi(hx + (hiza === 'end' ? -8 : 8), hy + 3.5, etiket, { renk, boyut, hiza })
  }

  sonuc() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img">
${this.p.join('\n')}
</svg>`
  }
}

/** Polyline uzunluğu — etiketteki metre HESAPLANIYOR, yazılmıyor. */
const yolUzunlugu = (nk) => {
  let t = 0
  for (let i = 1; i < nk.length; i++) {
    t += Math.hypot(nk[i][0] - nk[i - 1][0], nk[i][1] - nk[i - 1][1])
  }
  return t
}

const dizi = (nk) => 'M' + nk.map(([x, y]) => `${yuvarla(x)} ${yuvarla(y)}`).join(' L')

// ═════════════════════════════════════════════════ ÜÇ SAHNE
//
// TUVAL BOYUTU GÖSTERİM BOYUNA GÖRE. İlk sürüm 1200px'lik tuvale
// çizilmişti; kareler ölçüldüğünde 284–527px çıktı (1440'ta), yani çizim
// %25–45 ölçekle basılıyor ve 10.5px'lik etiketler 3–4 piksele düşüyordu.
// Ekranda bilgi değil DOKU görünüyordu.
//
// Bu yüzden her tuval, karesinin 1440'taki ölçüsüne yakın kuruldu ve
// içerik AZALTILDI: bir çizim burada bir pafta değil, TEK BİR ARGÜMAN
// taşıyabilir. Üçünde de en çok üç etiket var.
//
// Ölçek büyüdüğünde (2560/3440/3840) vektör olduğu için netlik artıyor,
// küçüldüğünde (mobil) geometri hâlâ okunuyor: kamyonun durduğu yer, yolun
// uzunluğu, koltuğun sığmaması, bariyerde biten rota.

function darSokak() {
  const S = 20
  const k = new Kagit(520, 310)
  const m = (n) => n * S

  const SOKAK = 3.2
  const PARK = 1.75
  const gecis = SOKAK - PARK

  const x0 = 42
  const x1 = 478
  const yUst = 160
  const yAlt = yUst + m(SOKAK)

  // ── kesilen yapı kütleleri
  k.duvar(x0, yUst - m(1.8), x1 - x0, m(1.8))
  k.duvar(x0, yAlt, x1 - x0, m(1.8))
  for (const x of [148, 254, 360]) k.cizgi(x, yUst - m(1.8), x, yUst, { kalinlik: 0.8 })
  for (const x of [180, 300, 410]) k.cizgi(x, yAlt, x, yAlt + m(1.8), { kalinlik: 0.8 })
  k.cizgi(x0, yUst, x1, yUst, { kalinlik: 1.4 })
  k.cizgi(x0, yAlt, x1, yAlt, { kalinlik: 1.4 })

  // ── park eden araçlar: geçişi 3.20'den 1.45'e düşüren şey
  for (const x of [190, 285, 380]) {
    k.kutu(x, yAlt - m(PARK), m(4.3), m(PARK), { renk: R.olcu, kalinlik: 1, r: 2 })
  }

  // ── kamyon
  const kx = x0
  const ky = yUst + m(0.25)
  k.kutu(kx, ky, m(6.5), m(2.2), { kalinlik: 1.5 })
  k.cizgi(kx + m(1.8), ky, kx + m(1.8), ky + m(2.2), { kalinlik: 1 })

  // ── bina girişi
  const gx = 452
  k.cizgi(gx, yUst, gx + m(0.9), yUst, { renk: '#F7F4EF', kalinlik: 3 })
  k.cizgi(gx, yUst, gx, yUst - m(0.9), { kalinlik: 1.3 })
  k.yol(`M${gx} ${yUst - m(0.9)} A${m(0.9)} ${m(0.9)} 0 0 1 ${gx + m(0.9)} ${yUst}`, {
    renk: R.olcu, kalinlik: 0.8, kesik: '3 3',
  })

  // ── elde taşıma yolu — tek argüman
  const yolNk = [
    [kx + m(6.5), ky + m(1.1)],
    [186, yUst + m(gecis) / 2],
    [gx - 4, yUst + m(gecis) / 2],
    [gx + m(0.45), yUst + 4],
  ]
  k.yol(dizi(yolNk), { renk: R.etkin, kalinlik: 2, kesik: '8 5', uc: 'round' })
  k.nokta(yolNk[0][0], yolNk[0][1], 4)
  k.nokta(yolNk[3][0], yolNk[3][1], 4)
  const metre = Math.round(yolUzunlugu(yolNk) / S)

  // ── etiketler: üç tane, hepsi okunur boyda
  k.cizgi(300, yUst + m(gecis) / 2, 300, 102, { renk: R.etkin, kalinlik: 1.2 })
  k.yazi(300, 94, `TAŞIMA MESAFESİ ${metre} m`, {
    renk: R.etkin, boyut: 16, hiza: 'middle', aralik: 1.4, agirlik: 500,
  })
  k.yazi(x0, 278, `GEÇİŞ ${gecis.toFixed(2)} · ARAÇ 2.20`, {
    renk: R.olcu, boyut: 13, aralik: 1.2,
  })
  return k
}

function katSahanlik() {
  const S = 82
  const k = new Kagit(290, 430)
  const m = (n) => n * S

  const KOL = 1.05
  const BOSLUK = 0.1
  const SAHANLIK = 1.05
  const GEN = KOL * 2 + BOSLUK
  const KB = 2.1
  const KD = 0.95
  const ACI = 45

  const px = 145 - m(GEN) / 2
  const py = 106
  const yS = py + m(SAHANLIK)
  const kolBoy = 1.2
  const yDip = yS + m(kolBoy)

  // ── kova
  k.duvar(px - 10, py - 10, m(GEN) + 20, 10)
  k.duvar(px - 10, py - 10, 10, m(SAHANLIK + kolBoy) + 20)
  k.duvar(px + m(GEN), py - 10, 10, m(SAHANLIK + kolBoy) + 20)
  k.kutu(px, py, m(GEN), m(SAHANLIK + kolBoy), { kalinlik: 1.5 })
  k.cizgi(px, yS, px + m(GEN), yS, { kalinlik: 1.4 })

  // ── basamaklar
  const adet = Math.round(kolBoy / 0.28)
  for (let i = 1; i < adet; i++) {
    const y = yS + m(kolBoy) * (i / adet)
    k.cizgi(px, y, px + m(KOL), y, { kalinlik: 0.9 })
    k.cizgi(px + m(KOL + BOSLUK), y, px + m(GEN), y, { kalinlik: 0.9 })
  }
  k.cizgi(px + m(KOL), py, px + m(KOL), yDip, { kalinlik: 0.9 })
  k.cizgi(px + m(KOL + BOSLUK), py, px + m(KOL + BOSLUK), yDip, { kalinlik: 0.9 })

  // ── sahanlık ölçüsü (etiketsiz; sayı altta)
  k.olcu(px - 26, py, px - 26, yS, '', { renk: R.olcu })

  // ── koltuk + gereken dönüş zarfı
  const cx = px + m(GEN) / 2
  const cy = py + m(SAHANLIK) / 2
  const rad = (ACI * Math.PI) / 180
  const zarf = KB * Math.abs(Math.sin(rad)) + KD * Math.abs(Math.cos(rad))
  k.gor(cx - m(zarf) / 2, cy - m(zarf) / 2, cx + m(zarf) / 2, cy + m(zarf) / 2)
  k.ek(
    `<g transform="translate(${yuvarla(cx)} ${yuvarla(cy)}) rotate(${ACI})">` +
      `<rect x="${yuvarla(-m(KB) / 2)}" y="${yuvarla(-m(KD) / 2)}" width="${yuvarla(m(KB))}" height="${yuvarla(m(KD))}" rx="4" fill="none" stroke="${R.etkin}" stroke-width="2.2"/>` +
      `<line x1="${yuvarla(-m(KB) / 2 + 11)}" y1="${yuvarla(-m(KD) / 2)}" x2="${yuvarla(-m(KB) / 2 + 11)}" y2="${yuvarla(m(KD) / 2)}" stroke="${R.etkin}" stroke-width="1.1"/>` +
      `</g>`
  )
  k.kutu(cx - m(zarf) / 2, cy - m(zarf) / 2, m(zarf), m(zarf), {
    renk: R.etkin, kalinlik: 1.2, kesik: '6 5',
  })

  // ── etiketler
  k.yazi(145, yDip + 56, `SAHANLIK ${SAHANLIK.toFixed(2)}`, {
    renk: R.olcu, boyut: 13, hiza: 'middle', aralik: 1.3,
  })
  k.yazi(145, yDip + 84, `GEREKLİ DÖNÜŞ ${zarf.toFixed(2)}`, {
    renk: R.etkin, boyut: 16, hiza: 'middle', aralik: 1.4, agirlik: 500,
  })
  return k
}

function kontrolluErisim() {
  const k = new Kagit(530, 370)

  const sx = 108
  const sy = 72
  const sw = 376
  const sh = 208
  const gy = sy + 128

  k.kutu(sx, sy, sw, sh, { kalinlik: 1.2, kesik: '10 5' })

  // ── giriş: yanak + bariyer
  k.duvar(sx - 5, gy - 42, 10, 34)
  k.duvar(sx - 5, gy + 8, 10, 34)
  k.cizgi(sx + 2, gy - 8, sx + 68, gy - 8, { kalinlik: 2.6 })
  for (let i = 0; i < 4; i++) k.cizgi(sx + 12 + i * 14, gy - 12, sx + 20 + i * 14, gy - 4, { kalinlik: 0.8 })
  k.nokta(sx + 2, gy - 8, 3.4, R.yapi)

  // ── araç kabul noktası
  const ax = sx + 92
  const ay = gy - 30
  k.kutu(ax, ay, 78, 50, { renk: R.etkin, kalinlik: 1.2, kesik: '5 4' })
  k.kutu(ax + 12, ay + 14, 54, 24, { kalinlik: 1.2 })
  k.cizgi(ax + 28, ay + 14, ax + 28, ay + 38, { kalinlik: 0.9 })

  // ── bloklar
  const bloklar = [
    { x: sx + 214, y: sy + 26, w: 74, h: 52, ad: 'A' },
    { x: sx + 300, y: sy + 26, w: 74, h: 52, ad: 'B' },
    { x: sx + 214, y: sy + 130, w: 74, h: 62, ad: 'C', hedef: true },
    { x: sx + 300, y: sy + 130, w: 74, h: 52, ad: 'D' },
  ]
  for (const b of bloklar) {
    k.kutu(b.x, b.y, b.w, b.h, {
      renk: b.hedef ? R.etkin : R.olcu,
      kalinlik: b.hedef ? 1.6 : 1,
      dolgu: b.hedef ? 'none' : R.poche,
    })
    k.yazi(b.x + b.w / 2, b.y + b.h / 2 + 5, b.ad, {
      renk: b.hedef ? R.etkin : R.yapi, boyut: 14, hiza: 'middle', aralik: 1.6, agirlik: 600,
    })
  }
  const c = bloklar[2]

  // ── yük asansörü + tahsis saati
  const ex = c.x + c.w - 24
  const ey = c.y + c.h - 24
  k.kutu(ex, ey, 18, 18, { renk: R.etkin, kalinlik: 1.2 })
  k.yol(`M${ex + 9} ${ey + 14} V${ey + 5} m0 0 l-3 4 m3 -4 l3 4`, { renk: R.etkin, kalinlik: 1 })

  // ── onaylı rota
  const rota = [
    [sx - 34, gy - 8],
    [ax + 39, gy - 8],
    [ax + 39, ay + 68],
    [c.x - 18, ay + 68],
    [c.x - 18, c.y + c.h - 16],
    [c.x - 3, c.y + c.h - 16],
  ]
  k.yol(dizi(rota), { renk: R.etkin, kalinlik: 2, uc: 'round' })
  k.nokta(rota[5][0], rota[5][1], 4)

  // ── randevusuz: bariyerde biter
  k.yol(dizi([[sx - 34, gy + 26], [sx - 22, gy + 26], [sx - 22, gy + 2], [sx - 12, gy + 2]]), {
    renk: R.olcu, kalinlik: 1.6, kesik: '6 4', uc: 'round',
  })
  k.yol(`M${sx - 9} ${gy - 4} l11 11 m0 -11 l-11 11`, { renk: R.olcu, kalinlik: 1.6 })

  // ── etiketler
  k.yazi(46, sy + sh + 50, 'RANDEVUSUZ BEKLER', { renk: R.olcu, boyut: 12, aralik: 1.2 })
  k.yazi(484, sy + sh + 50, 'RANDEVULU ROTA · İZİN ÖNCEDEN', {
    renk: R.etkin, boyut: 14, hiza: 'end', aralik: 1.3, agirlik: 500,
  })
  return k
}

// ═════════════════════════════════════════════════════════════ YAZ

mkdirSync(CIKTI, { recursive: true })

const isler = [
  ['kesit-dar-sokak.svg', darSokak()],
  ['kesit-kat-sahanlik.svg', katSahanlik()],
  ['kesit-kontrollu-erisim.svg', kontrolluErisim()],
]

// GÜVENLİ ALAN DENETİMİ — çizim `object-fit: contain` ile yerleşiyor ve
// üstünde scale(1.10)'a kadar mikro parallax var. İçerik kâğıdın %8'lik
// payına taşarsa etiket kırpılır. Bu yüzden sınır ÖLÇÜLÜYOR, göz kararı
// bırakılmıyor; taşma varsa betik hata veriyor.
const PAY = 0.08
let hata = 0

for (const [ad, k] of isler) {
  const yol = `${CIKTI}/${ad}`
  writeFileSync(yol, k.sonuc(), 'utf8')
  const gx = k.w * PAY
  const gy = k.h * PAY
  const s = k.sinir
  const tasan = [
    s.x1 < gx && `sol ${Math.round(gx - s.x1)}px`,
    s.y1 < gy && `üst ${Math.round(gy - s.y1)}px`,
    s.x2 > k.w - gx && `sağ ${Math.round(s.x2 - (k.w - gx))}px`,
    s.y2 > k.h - gy && `alt ${Math.round(s.y2 - (k.h - gy))}px`,
  ].filter(Boolean)
  const kb = (statSync(yol).size / 1024).toFixed(1) + 'KB'
  const oran = (k.w / k.h).toFixed(2)
  console.log(
    ad.padEnd(30),
    kb.padStart(7),
    `oran ${oran}`,
    `içerik ${Math.round(s.x1)},${Math.round(s.y1)} → ${Math.round(s.x2)},${Math.round(s.y2)}`,
    tasan.length ? '⛔ TAŞMA: ' + tasan.join(' · ') : '✔'
  )
  if (tasan.length) hata++
}

if (hata) {
  console.error(`
${hata} çizim güvenli alanın dışına taşıyor.`)
  process.exit(1)
}

// ═════════════════════════════════════════════════════════════ BAĞLAMA
//
// `--bagla` çizimleri CMS'e bağlar: `HomeSection('uc-istanbul')` öğelerinin
// `imagePath`/`imageAlt` alanlarını günceller. Görsel sahipliği PANELDE
// KALIYOR — bileşende sabit yol yok, yönetici isterse fotoğrafa döndürebilir.
//
// `--geri` önceki değerleri geri yazar; onlar `--bagla` sırasında
// `scripts/.kesit-onceki.json` dosyasına kaydediliyor.
//
// ALT METİN DEĞİŞİYOR ve bu bilinçli: mevcut alt metinler FOTOĞRAFI
// anlatıyordu ("...ambalajlı koltuk taşıyan iki nakliyeci"). Görsel artık
// teknik çizim; ekran okuyucuya olmayan bir fotoğrafı tarif etmek
// erişilebilirlik hatası olurdu.

const BAGLAMA = [
  {
    label: 'DAR SOKAK',
    imagePath: '/yuklemeler/kesit-dar-sokak.svg',
    imageAlt:
      'Dar sokağın plan çizimi: kamyon park sırasının başında duruyor, kalan ' +
      'geçiş 1.45 metre. Aracın durduğu noktadan bina girişine kadar elde ' +
      'taşınacak 21 metrelik yol işaretli.',
  },
  {
    label: 'KAT',
    imagePath: '/yuklemeler/kesit-kat-sahanlik.svg',
    imageAlt:
      'Merdiven sahanlığının plan detayı: 1.05 metrelik sahanlıkta dönmeye ' +
      'çalışan 2.10 × 0.95 metrelik koltuk, gerekli 2.16 metrelik dönüş ' +
      'zarfıyla birlikte gösteriliyor.',
  },
  {
    label: 'KONTROLLÜ ERİŞİM',
    imagePath: '/yuklemeler/kesit-kontrollu-erisim.svg',
    imageAlt:
      'Site vaziyet planı: bariyer, güvenlik kulübesi, araç kabul noktası ve ' +
      'C bloğundaki yük asansörüne giden randevulu rota; randevusuz aracın ' +
      'rotası bariyerde bitiyor.',
  },
]

const YEDEK = 'scripts/.kesit-onceki.json'

if (process.argv.includes('--bagla') || process.argv.includes('--geri')) {
  const { PrismaMariaDb } = await import('@prisma/adapter-mariadb')
  const { PrismaClient } = await import('../prisma/generated/client/client.ts')
  const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) })

  const bolum = await db.homeSection.findFirst({
    where: { sectionKey: 'uc-istanbul' },
    include: { items: { orderBy: { order: 'asc' } } },
  })
  if (!bolum) throw new Error("HomeSection('uc-istanbul') bulunamadı")

  if (process.argv.includes('--geri')) {
    const { readFileSync } = await import('node:fs')
    for (const o of JSON.parse(readFileSync(YEDEK, 'utf8'))) {
      await db.homeSectionItem.update({
        where: { id: o.id },
        data: { imagePath: o.imagePath, imageAlt: o.imageAlt },
      })
      console.log('geri:', o.label, '←', o.imagePath)
    }
  } else {
    const yedek = []
    for (const y of BAGLAMA) {
      const oge = bolum.items.find((i) => i.label === y.label)
      if (!oge) throw new Error(`"${y.label}" etiketli öğe yok`)
      yedek.push({ id: oge.id, label: oge.label, imagePath: oge.imagePath, imageAlt: oge.imageAlt })
      await db.homeSectionItem.update({
        where: { id: oge.id },
        data: { imagePath: y.imagePath, imageAlt: y.imageAlt },
      })
      console.log('bağlandı:', y.label, '→', y.imagePath)
    }
    writeFileSync(YEDEK, JSON.stringify(yedek, null, 2), 'utf8')
    console.log('önceki değerler:', YEDEK)
  }

  await db.$disconnect()
}
