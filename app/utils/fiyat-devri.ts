// app/utils/fiyat-devri.ts
//
// DEVRİN İSTEMCİ TARAFI — paylaşılan sözleşme + tutar.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN İKİ DOSYA
//
// Devrin doğrulaması ve kanonik özeti SUNUCUDA da çalışmak zorunda: talep
// kaydedilirken mesaj kutusuna güvenilemiyor (kullanıcı silebilir). O
// yüzden çerçevesiz olan her şey `shared/utils/fiyat-devri.ts`e taşındı ve
// sunucu da aynı fonksiyonları çağırıyor.
//
// BURADA KALAN TEK ŞEY TUTAR. Aralık `utils/fiyat.ts`teki aritmetiği
// gerektiriyor ve o yalnız EKRANDA kullanılıyor — veri tabanına hiçbir
// fiyat yazılmıyor (bkz. shared → `devirOzeti`). Böylece paylaşılan dosya
// aritmetikten bağımsız kalıyor.
//
// YENİDEN DIŞA VERME: sayfalar ve bileşenler `app/utils` altındaki adları
// otomatik içe aktarımla kullanıyor. Paylaşılan adlar buradan yeniden
// dışa veriliyor ki çağıranlar iki ayrı yeri bilmek zorunda kalmasın.
import { tahminiAralik, type FiyatKatsayilari } from './fiyat'
import {
  devirEtiketleriniCoz,
  type DevirEtiketleri,
  type DevirGirdisi,
  type DevirMesafesi,
  type DevirOdasi,
} from '#shared/utils/fiyat-devri'

export {
  DEVIR_KAYNAGI,
  DEVIR_HEDEFI,
  DEVIR_KAYNAK_SAYFASI,
  DEVIR_ANAHTARLARI,
  KAT_EN_AZ,
  KAT_EN_COK,
  fiyatDevriniOku,
  fiyatDevriYolu,
  devirAlanlari,
  devirEtiketleriniCoz,
  devirOzeti,
  devirliMesaj,
  katCumlesi,
  ekHizmetler,
  OZET_BASLIGI,
  NOT_BASLIGI,
} from '#shared/utils/fiyat-devri'

export type { DevirGirdisi, DevirEtiketleri, DevirOdasi, DevirMesafesi }

/** Etiketleri çözülmüş devir + EKRANDA gösterilen tahmini aralık. */
export interface DevirCozumu extends DevirEtiketleri {
  /** Katsayılar okunamazsa `null` — o zaman RAKAM GÖSTERİLMİYOR. */
  aralik: { alt: number; ust: number } | null
}

/** `fiyatDevriniCoz` için gereken katsayı kümesi. */
export interface DevirKatsayilari extends FiyatKatsayilari {
  odalar: Array<DevirOdasi & { taban: number }>
  mesafeler: Array<DevirMesafesi & { carpan: number }>
}

/**
 * Girdiyi panel listesine karşı doğrular, etiketleri çözer ve aralığı
 * YENİDEN hesaplar.
 *
 * Aralık `tahminiAralik` ile üretiliyor — hesaplayıcının kullandığı
 * fonksiyonun aynısı. İkinci bir uygulama yok, katsayı sabitlenmiyor ve
 * adres satırındaki hiçbir sayı okunmuyor.
 */
export function fiyatDevriniCoz(
  girdi: DevirGirdisi | null,
  katsayilar: DevirKatsayilari | null | undefined
): DevirCozumu | null {
  if (!katsayilar) return null

  const etiketler = devirEtiketleriniCoz(girdi, katsayilar.odalar, katsayilar.mesafeler)
  if (!etiketler) return null

  const oda = katsayilar.odalar.find((o) => o.id === etiketler.girdi.odaId)!
  const mesafe = katsayilar.mesafeler.find((m) => m.id === etiketler.girdi.mesafeId)!

  return {
    ...etiketler,
    aralik: tahminiAralik(
      {
        taban: oda.taban,
        mesafeCarpani: mesafe.carpan,
        cikisKat: etiketler.girdi.cikisKat,
        cikisAsansor: etiketler.girdi.cikisAsansor,
        varisKat: etiketler.girdi.varisKat,
        varisAsansor: etiketler.girdi.varisAsansor,
        paketleme: etiketler.girdi.paketleme,
        depolama: etiketler.girdi.depolama,
      },
      katsayilar
    ),
  }
}
