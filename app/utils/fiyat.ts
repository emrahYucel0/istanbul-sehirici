// app/utils/fiyat.ts
//
// TAHMİNİ TAŞIMA TUTARI — saf hesap.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN AYRI DOSYA
//
// Hesap eskiden `components/base/PriceEstimator.vue` içindeki bir
// `computed` bloğundaydı: test edilemiyordu ve uç durumların ne ürettiği
// ancak tarayıcıda elle denenerek görülebiliyordu. Formül buraya taşındı,
// bileşen artık yalnız sunum yapıyor.
//
// ─────────────────────────────────────────────────────────────────────────
// KATSAYILAR BURADA DEĞİL
//
// Taban tutarlar, mesafe çarpanları, kat ücreti, paketleme çarpanı,
// depolama ücreti, aralık yüzdesi ve yuvarlama adımı YÖNETİM PANELİNDEN
// geliyor (`/api/price-estimator`). Bu dosya hiçbir iş rakamı tanımlamıyor
// — yalnız verilen katsayılarla aritmetiği yapıyor. Fiyat politikası bir
// iş kararı; kodda sabitlenirse her değişiklik yeniden dağıtım gerektirir.
//
// ─────────────────────────────────────────────────────────────────────────
// FORMÜL DEĞİŞMEDİ
//
// Sıra ve işlemler eski bileşendeki hâliyle birebir aynı:
//
//     tutar  = taban × mesafeÇarpanı
//     tutar += katEki(çıkış)  + katEki(varış)
//     eğer paketleme  → tutar ×= paketlemeÇarpanı
//     eğer depolama   → tutar += depolamaÜcreti
//     alt = yuvarla(tutar × (1 − aralık))
//     üst = yuvarla(tutar × (1 + aralık))
//
//     katEki = asansör varsa 0, yoksa max(0, kat − 1) × katÜcreti
//              (zemin ve 1. kat ücretsiz sayılıyor — mevcut kural)
//
// EKLENEN TEK ŞEY GÜVENLİK SINIRLARI (bkz. `KAT_EN_COK` ve `sayiya`).

/**
 * Kat alanının kabul ettiği aralık. Girdideki `min`/`max` ile aynı.
 *
 * TANIM ARTIK `shared/`TE. Sınırı üç yer okuyor: formdaki `min`/`max`,
 * aşağıdaki sıkıştırma ve hesaplayıcı → iletişim devrinin doğrulaması.
 * Sonuncusu SUNUCUDA da çalıştığı için tanım paylaşılan dosyaya taşındı
 * (bkz. shared/utils/fiyat-devri.ts). Buradan yeniden dışa veriliyor:
 * mevcut içe aktarmalar (`~/utils/fiyat`) olduğu gibi çalışmaya devam
 * ediyor ve iki ayrı sabit doğmuyor.
 */
export { KAT_EN_AZ, KAT_EN_COK } from '#shared/utils/fiyat-devri'
import { KAT_EN_AZ, KAT_EN_COK } from '#shared/utils/fiyat-devri'

export interface FiyatKatsayilari {
  floorFee: number
  packingMultiplier: number
  storageFee: number
  rangePercent: number
  roundTo: number
}

export interface FiyatGirdisi {
  taban: number
  mesafeCarpani: number
  cikisKat: number
  cikisAsansor: boolean
  varisKat: number
  varisAsansor: boolean
  paketleme: boolean
  depolama: boolean
}

export interface FiyatAraligi {
  alt: number
  ust: number
}

/**
 * Sayıya çevirir; çevrilemiyorsa yedeğe düşer.
 *
 * NEDEN GEREKLİ: kat alanı `type="number"` ama tarayıcı boş metin ve bazı
 * yazımlar için `''` döndürüyor, `v-model.number` de onu olduğu gibi
 * bırakıyor. Ayrıca katsayılar bir API'den geliyor — panelde bir alan
 * bozulursa `NaN` doğrudan ekrandaki tutara sızardı.
 */
const sayiya = (deger: unknown, yedek = 0): number => {
  const n = typeof deger === 'number' ? deger : Number(deger)
  return Number.isFinite(n) ? n : yedek
}

/** Değeri kapalı aralığa sıkıştırır. */
const sinirla = (deger: number, enAz: number, enCok: number): number =>
  Math.min(Math.max(deger, enAz), enCok)

/**
 * Asansörsüz kat eki. Zemin ve 1. kat ücretsiz (mevcut kural).
 *
 * KAT SINIRLANIYOR. Öncesinde sınırlanmıyordu: alan `max="30"` yazmasına
 * rağmen tarayıcı bunu yalnız form doğrulamasında uyguluyor, burada form
 * yok. Ölçüldü — kata 999 yazıldığında araç "1.718.000 – 2.324.000 TL"
 * gösteriyordu. Artık girdinin kendi ilan ettiği aralığa sıkıştırılıyor;
 * yani hesap yalnız ZATEN GEÇERSİZ sayılan değerlerde değişiyor.
 */
export function katEki(kat: unknown, asansorVar: boolean, katUcreti: number): number {
  if (asansorVar) return 0
  const guvenliKat = sinirla(Math.floor(sayiya(kat, 0)), KAT_EN_AZ, KAT_EN_COK)
  const ucret = Math.max(0, sayiya(katUcreti, 0))
  return Math.max(0, guvenliKat - 1) * ucret
}

/**
 * Tahmini aralığı hesaplar.
 *
 * Katsayılar okunamıyorsa (panel kaydı yok, API düştü) `null` döner —
 * bileşen o durumda RAKAM GÖSTERMİYOR. Öncesinde koda gömülü yedek
 * rakamlar vardı ve ölçüldüğünde panelde duran gerçek değerlerin yaklaşık
 * dörtte biriydiler (kat ücreti 450'ye karşı 2.000; 2+1 tabanı 12.000'e
 * karşı 45.000). Yani yedek devreye girse kullanıcı sessizce yanlış bir
 * fiyat görürdü. Eski rakamı göstermektense hiç göstermemek doğru.
 */
export function tahminiAralik(
  girdi: FiyatGirdisi,
  katsayilar: FiyatKatsayilari
): FiyatAraligi | null {
  const taban = sayiya(girdi.taban, NaN)
  const carpan = sayiya(girdi.mesafeCarpani, NaN)
  if (!Number.isFinite(taban) || !Number.isFinite(carpan) || taban <= 0 || carpan <= 0) return null

  const katUcreti = Math.max(0, sayiya(katsayilar.floorFee, 0))
  const paketlemeCarpani = Math.max(1, sayiya(katsayilar.packingMultiplier, 1))
  const depolamaUcreti = Math.max(0, sayiya(katsayilar.storageFee, 0))
  // Aralık yüzdesi 0–100 arasında tutuluyor: 100'ün üzerinde bir değer alt
  // sınırı NEGATİF yapardı.
  const aralikYuzdesi = sinirla(sayiya(katsayilar.rangePercent, 0), 0, 100)
  const yuvarlamaAdimi = Math.max(1, Math.floor(sayiya(katsayilar.roundTo, 1)))

  let tutar = taban * carpan
  tutar += katEki(girdi.cikisKat, girdi.cikisAsansor, katUcreti)
  tutar += katEki(girdi.varisKat, girdi.varisAsansor, katUcreti)

  if (girdi.paketleme) tutar *= paketlemeCarpani
  if (girdi.depolama) tutar += depolamaUcreti

  if (!Number.isFinite(tutar)) return null

  const pay = aralikYuzdesi / 100
  const alt = Math.round((tutar * (1 - pay)) / yuvarlamaAdimi) * yuvarlamaAdimi
  const ust = Math.round((tutar * (1 + pay)) / yuvarlamaAdimi) * yuvarlamaAdimi

  return { alt: Math.max(0, alt), ust: Math.max(0, ust) }
}

/**
 * Tutarı Türkçe biçimde yazar. Para birimi metinde ayrıca belirtiliyor,
 * bu yüzden yalnız sayı biçimleniyor (12.500 gibi).
 */
export const tlYaz = (n: number): string => Math.round(sayiya(n, 0)).toLocaleString('tr-TR')
