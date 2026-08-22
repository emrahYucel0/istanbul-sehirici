// shared/utils/mahalle.ts
//
// MAHALLE ADRES POLİTİKASI — TEK KAYNAK.
//
// Adresler DÜZ (flat), ilçe önekli değil:
//
//     /yayalar-mahallesi          ✔
//     /pendik/yayalar-mahallesi   ✘
//
// Düz adres, hiyerarşinin olmadığı anlamına gelmiyor: sıralama yol izi ve
// iç bağlantılarla gösteriliyor (Ana sayfa → Bölgelerimiz → Pendik →
// Yayalar Mahallesi).
//
// ─────────────────────────────────────────────────────────────────────────
// ÇAKIŞMA POLİTİKASI — ÖLÇÜLDÜ
//
// 473 mahalle adının `slugify(ad) + '-mahallesi'` karşılığı BENZERSİZ
// DEĞİL: 41 grup çakışıyor, 109 kayıt etkileniyor. En kalabalıkları
// "Merkez" (7 ilçe), "Cumhuriyet" (6), "Fevzi Çakmak" (5), "Fatih" (5).
//
// Çakışan kayıt ilçe önekli yedek adrese düşüyor:
//
//     /fatih-mahallesi            → çakışıyor, kimseye verilmiyor
//     /sultanbeyli-fatih-mahallesi
//     /kucukcekmece-fatih-mahallesi
//
// Bir grubun TAMAMI yedeğe düşüyor; "ilki tabanı alsın" DENMİYOR. Aksi
// hâlde panelden bir ilçeye yeni mahalle eklendiğinde başka bir ilçenin
// yayındaki adresi el değiştirirdi.
//
// ─────────────────────────────────────────────────────────────────────────
// MEVCUT ADRESLER HER ZAMAN ÖNCELİKLİ
//
// `-mahallesi` eki, kök ad alanındaki 412 adresin hiçbirinde yok (ölçüldü),
// yani bugün çakışma yok. Yine de kural kodda duruyor: `dolu` kümesi
// verildiğinde o adresi taşıyan mahalle de yedeğe düşer. Yayındaki bir
// adres mahalle uğruna EZİLMEZ.

// Uzantı AÇIK yazılı: bu modül hem Nuxt/Vite tarafından hem de doğrudan
// Node ile (prisma/*.mjs betikleri, doğrulama araçları) yükleniyor. Node'un
// ESM çözümleyicisi uzantısız göreli yolu bulamıyor.
import { slugify } from './slugify.ts'

/** Adres eki — mahalle adreslerini kök ad alanında ayrı tutan tek işaret. */
export const MAHALLE_EKI = 'mahallesi'

export interface MahalleGirdisi {
  /** Kanonik yol, baştaki bölü olmadan: "yayalar-mahallesi" */
  yol: string
  /** Görünen ad: "Yayalar" */
  ad: string
  /** Bağlı olduğu ilçenin slug'ı: "pendik" */
  ilce: string
  /** Görünen ilçe adı: "Pendik" */
  ilceAd: string
  /** Çakışma yüzünden ilçe önekli yedek adres mi kullanıldı? */
  yedek: boolean
}

/**
 * Görünen başlık: "Yayalar" → "Yayalar Mahallesi".
 *
 * Adında zaten "mahalle" geçen kayıtlarda ek TEKRARLANMIYOR ("Yenimahalle
 * Mahallesi" olmuyor). Veri setinde iki böyle kayıt var, ikisi de
 * "Yenimahalle". Adres eki ise her koşulda duruyor — orada `-mahallesi`
 * bir okuma değil, kök ad alanını ayıran işaret.
 */
export const mahalleBasligi = (ad: string): string =>
  /mahalle/i.test(ad) ? ad.trim() : `${ad.trim()} Mahallesi`

/** Çakışma yoksa kullanılan taban adres. */
export const mahalleTabanYolu = (ad: string): string => `${slugify(ad)}-${MAHALLE_EKI}`

/** Çakışma hâlinde kullanılan ilçe önekli yedek adres. */
export const mahalleYedekYolu = (ilceSlug: string, ad: string): string =>
  `${ilceSlug}-${slugify(ad)}-${MAHALLE_EKI}`

export interface IlceMahalleleri {
  slug: string
  ad: string
  mahalleler: string[]
}

export interface MahalleDizini {
  /** yol → girdi */
  yolaGore: Map<string, MahalleGirdisi>
  /** ilçe slug'ı → o ilçenin girdileri (veri sırasında) */
  ilceyeGore: Map<string, MahalleGirdisi[]>
  toplam: number
  yedekAdedi: number
}

/**
 * 39 ilçenin mahalle listelerinden çakışmasız adres dizini üretir.
 *
 * DETERMİNİSTİK: aynı girdi her zaman aynı adresleri verir. Sunucu ve
 * istemci aynı işlevi çağırdığı için hidrasyon uyuşmazlığı da mümkün değil.
 *
 * @param ilceler ilçe başına { slug, ad, mahalleler[] }
 * @param dolu    kök ad alanında ZATEN kullanılan adresler (varsa)
 */
export const mahalleDizini = (
  ilceler: IlceMahalleleri[],
  dolu: Set<string> = new Set()
): MahalleDizini => {
  // 1) Taban adresleri say — hangi taban birden fazla mahalleye düşüyor?
  const tabanSayisi = new Map<string, number>()
  for (const ilce of ilceler) {
    for (const ad of ilce.mahalleler) {
      const temiz = String(ad ?? '').trim()
      if (!temiz) continue
      const taban = mahalleTabanYolu(temiz)
      tabanSayisi.set(taban, (tabanSayisi.get(taban) || 0) + 1)
    }
  }

  // 2) Adresleri ata.
  const yolaGore = new Map<string, MahalleGirdisi>()
  const ilceyeGore = new Map<string, MahalleGirdisi[]>()
  let yedekAdedi = 0

  for (const ilce of ilceler) {
    const girdiler: MahalleGirdisi[] = []
    for (const ad of ilce.mahalleler) {
      const temiz = String(ad ?? '').trim()
      if (!temiz) continue

      const taban = mahalleTabanYolu(temiz)
      // Taban `-mahallesi` ile bitiyor ama gövdesi boşsa (ad tamamen
      // noktalama ise) adres üretilmiyor — `/-mahallesi` gibi bir yol
      // oluşmasın.
      if (taban === `-${MAHALLE_EKI}`) continue

      const cakisiyor = (tabanSayisi.get(taban) || 0) > 1 || dolu.has(taban)
      const yol = cakisiyor ? mahalleYedekYolu(ilce.slug, temiz) : taban
      if (cakisiyor) yedekAdedi++

      // Yedek adres de doluysa ya da başka bir yedekle çakışıyorsa kayıt
      // adres ALMIYOR. Sessizce yanlış sayfayı açmaktansa hiç açmamak
      // doğrusu; sayı final raporda görünür.
      if (yolaGore.has(yol) || dolu.has(yol)) continue

      const girdi: MahalleGirdisi = { yol, ad: temiz, ilce: ilce.slug, ilceAd: ilce.ad, yedek: cakisiyor }
      yolaGore.set(yol, girdi)
      girdiler.push(girdi)
    }
    ilceyeGore.set(ilce.slug, girdiler)
  }

  return { yolaGore, ilceyeGore, toplam: yolaGore.size, yedekAdedi }
}
