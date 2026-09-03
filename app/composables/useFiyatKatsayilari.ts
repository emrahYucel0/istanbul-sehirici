// composables/useFiyatKatsayilari.ts
//
// FİYAT KATSAYILARININ TEK SÖZLEŞMESİ — `GET /api/price-estimator`.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Bu uç noktayı M14C'den önce yalnız `price/Hesaplayici.vue` okuyordu ve
// `transform`u kendi içinde tanımlıyordu. Artık iletişim sayfası da aynı
// katsayılara ihtiyaç duyuyor (hesap özetindeki aralığı YENİDEN üretmek
// için — bkz. utils/fiyat-devri.ts).
//
// İki çağıran aynı anahtarı FARKLI `transform` ile kullansaydı bu, depoda
// bir kez ölçülmüş olan hatanın aynısı olurdu: Nuxt önbelleği anahtar
// başına tek kayıt tutuyor ve `handler`/`transform`/`pick`/`getCachedData`
// /`default` imzalarını KAYNAK METNİNDEN hash'liyor. İmzalar tutmayınca
// NUXT_E3004 çıkıyor ve ikinci çağıran önbellekteki yabancı şekli olduğu
// gibi alıyor. (Aynı gerekçe ve aynı çözüm: composables/useLightPosts.ts.)
//
// Bu yüzden anahtar da dönüşüm de BURADA bir kez tanımlı; iki çağıran da
// aynı fonksiyon nesnelerini kullandığı için hash'ler zorunlu olarak eşit.
//
// ─────────────────────────────────────────────────────────────────────────
// KANONİK ŞEKİL
//
// Yalnız hesabın okuduğu alanlar iniyor; `createdAt`, `sectionName` gibi
// kayıt alanları sayfa yüküne girmiyor. Kayıt yoksa ya da uç nokta
// düşerse `null` — çağıran o durumda RAKAM GÖSTERMİYOR (koda gömülü yedek
// katsayı yok, bkz. utils/fiyat.ts).

/** Formda görünen ev büyüklüğü ve taban tutarı. */
export interface FiyatOdasi {
  id: number
  ad: string
  taban: number
}

/** Mesafe kademesi ve çarpanı. */
export interface FiyatMesafesi {
  id: number
  ad: string
  carpan: number
}

/**
 * `/api/price-estimator` yanıtının hesaba giren kısmı.
 *
 * AD `FiyatKatsayilari` DEĞİL: o ad `utils/fiyat.ts`te zaten var (saf
 * aritmetiğin beklediği dar küme) ve ikisi de otomatik içe aktarıma
 * girdiği için Nuxt "Duplicated imports" uyarısı veriyordu — yani hangi
 * tanımın kullanıldığı çağırana göre değişebiliyordu. Bu küme daha geniş
 * (oda ve mesafe listelerini de taşıyor), o yüzden kendi adını alıyor.
 */
export interface FiyatAyarlari {
  floorFee: number
  packingMultiplier: number
  storageFee: number
  rangePercent: number
  roundTo: number
  /** Sonucun altında basılan uyarı metni (panelden). */
  not: string
  odalar: FiyatOdasi[]
  mesafeler: FiyatMesafesi[]
}

/** Önbellek anahtarı — tek yerde yazılı. */
export const FIYAT_KATSAYI_ANAHTARI = 'price-estimator'

interface HamYanit {
  data?: {
    floorFee?: number
    packingMultiplier?: number
    storageFee?: number
    rangePercent?: number
    roundTo?: number
    note?: string | null
    sizes?: Array<{ id: number; label: string; basePrice: number }>
    distances?: Array<{ id: number; label: string; multiplier: number }>
  } | null
}

/** Ham yanıtı kanonik şekle indirger. Kayıt yoksa `null`. */
export function normalizeFiyatKatsayilari(yanit: HamYanit | null | undefined): FiyatAyarlari | null {
  const k = yanit?.data
  if (!k) return null
  return {
    floorFee: k.floorFee as number,
    packingMultiplier: k.packingMultiplier as number,
    storageFee: k.storageFee as number,
    rangePercent: k.rangePercent as number,
    roundTo: k.roundTo as number,
    not: String(k.note ?? '').trim(),
    odalar: (k.sizes || []).map((o) => ({ id: o.id, ad: o.label, taban: o.basePrice })),
    mesafeler: (k.distances || []).map((m) => ({ id: m.id, ad: m.label, carpan: m.multiplier })),
  }
}

/**
 * Fiyat katsayıları.
 *
 * @param atlansinMi Doğru dönerse istek HİÇ yapılmaz ve `null` döner.
 *   İletişim sayfası katsayılara YALNIZ geçerli bir hesap devri geldiğinde
 *   ihtiyaç duyuyor; doğrudan gelen ziyaretçide bu sorgu açılmıyor.
 *   Kapanış BURADA bir parametre — handler'ın kaynak metni iki çağıranda
 *   da aynı kalsın diye (bkz. useLightPosts).
 */
export function useFiyatKatsayilari(atlansinMi?: () => boolean) {
  return useAsyncData(
    FIYAT_KATSAYI_ANAHTARI,
    () =>
      atlansinMi?.()
        ? Promise.resolve(null)
        : $fetch<HamYanit>('/api/price-estimator'),
    { transform: normalizeFiyatKatsayilari }
  )
}
