import { describe, it, expect } from 'vitest'
import { tahminiAralik, katEki, tlYaz, KAT_EN_COK } from './fiyat'

/**
 * Katsayılar panelden geliyor; testlerde SABİT bir küme kullanılıyor ki
 * panelde bir rakam değiştiğinde testler kırılmasın. Değerler bu testin
 * yazıldığı andaki kayıtlı değerlerle aynı — beklenen sonuçlar elle
 * doğrulanabilsin diye.
 */
const KATSAYI = {
  floorFee: 2000,
  packingMultiplier: 1.18,
  storageFee: 10000,
  rangePercent: 15,
  roundTo: 500,
}

/** 2+1 · şehir içi · iki tarafta da asansör (mevcut varsayılan konum). */
const TEMEL = {
  taban: 45000,
  mesafeCarpani: 1,
  cikisKat: 2,
  cikisAsansor: true,
  varisKat: 2,
  varisAsansor: true,
  paketleme: false,
  depolama: false,
}

describe('tahminiAralik — taban davranış', () => {
  // 45.000 × 1 = 45.000 → ±%15 → 38.250 / 51.750 → 500'e yuvarlanınca
  // 38.500 / 51.500. Ekranda ölçülen değerle birebir aynı.
  it('varsayılan konumda ekrandaki aralığı üretir', () => {
    expect(tahminiAralik(TEMEL, KATSAYI)).toEqual({ alt: 38500, ust: 51500 })
  })

  it('mesafe çarpanını uygular', () => {
    // 45.000 × 2,3 = 103.500 → ±%15 → 87.975 / 119.025 → 88.000 / 119.000
    expect(tahminiAralik({ ...TEMEL, mesafeCarpani: 2.3 }, KATSAYI)).toEqual({
      alt: 88000,
      ust: 119000,
    })
  })

  it('asansör varken kat tutarı etkilemez', () => {
    const a = tahminiAralik({ ...TEMEL, cikisKat: 0 }, KATSAYI)
    const b = tahminiAralik({ ...TEMEL, cikisKat: 30 }, KATSAYI)
    expect(a).toEqual(b)
  })

  it('asansörsüz katı ekler (zemin ve 1. kat ücretsiz)', () => {
    // 45.000 + (4−1)×2.000 = 51.000 → ±%15 → 43.350 / 58.650 → 43.500 / 58.500
    expect(tahminiAralik({ ...TEMEL, cikisKat: 4, cikisAsansor: false }, KATSAYI)).toEqual({
      alt: 43500,
      ust: 58500,
    })
  })

  it('paketleme çarpanı, kat eki EKLENDİKTEN sonra uygulanır', () => {
    // (45.000 + 2.000) × 1,18 = 55.460 → ±%15 → 47.141 / 63.779 → 47.000 / 64.000
    const sonuc = tahminiAralik(
      { ...TEMEL, cikisKat: 2, cikisAsansor: false, paketleme: true },
      KATSAYI
    )
    expect(sonuc).toEqual({ alt: 47000, ust: 64000 })
  })

  it('depolama ücreti çarpandan SONRA eklenir', () => {
    // 45.000 × 1,18 = 53.100 → + 10.000 = 63.100 → ±%15 → 53.635 / 72.565
    const sonuc = tahminiAralik({ ...TEMEL, paketleme: true, depolama: true }, KATSAYI)
    expect(sonuc).toEqual({ alt: 53500, ust: 72500 })
  })

  it('her iki adresin katı ayrı ayrı ekleniyor', () => {
    const tek = tahminiAralik({ ...TEMEL, cikisKat: 5, cikisAsansor: false }, KATSAYI)!
    const cift = tahminiAralik(
      { ...TEMEL, cikisKat: 5, cikisAsansor: false, varisKat: 5, varisAsansor: false },
      KATSAYI
    )!
    expect(cift.alt).toBeGreaterThan(tek.alt)
  })
})

describe('tahminiAralik — sınırlar', () => {
  it('en düşük geçerli girdilerde bile pozitif kalır', () => {
    const sonuc = tahminiAralik(
      { ...TEMEL, taban: 1, mesafeCarpani: 0.1, cikisKat: 0, varisKat: 0 },
      KATSAYI
    )
    expect(sonuc).not.toBeNull()
    expect(sonuc!.alt).toBeGreaterThanOrEqual(0)
    expect(sonuc!.ust).toBeGreaterThanOrEqual(sonuc!.alt)
  })

  it('en yüksek geçerli girdilerde de sonlu sayı üretir', () => {
    const sonuc = tahminiAralik(
      {
        taban: 100000,
        mesafeCarpani: 10,
        cikisKat: KAT_EN_COK,
        cikisAsansor: false,
        varisKat: KAT_EN_COK,
        varisAsansor: false,
        paketleme: true,
        depolama: true,
      },
      KATSAYI
    )!
    expect(Number.isFinite(sonuc.alt)).toBe(true)
    expect(Number.isFinite(sonuc.ust)).toBe(true)
  })

  // ÖLÇÜLEN HATA: alan `max="30"` yazıyordu ama JS sınırlamıyordu; kata 999
  // yazıldığında araç 1.718.000 – 2.324.000 TL gösteriyordu.
  it('kat üst sınırın üzerine çıkarılamaz', () => {
    const sinirda = tahminiAralik({ ...TEMEL, cikisKat: KAT_EN_COK, cikisAsansor: false }, KATSAYI)
    const asiri = tahminiAralik({ ...TEMEL, cikisKat: 999, cikisAsansor: false }, KATSAYI)
    expect(asiri).toEqual(sinirda)
  })

  it('negatif kat sıfır gibi ele alınır', () => {
    const sifir = tahminiAralik({ ...TEMEL, cikisKat: 0, cikisAsansor: false }, KATSAYI)
    const negatif = tahminiAralik({ ...TEMEL, cikisKat: -50, cikisAsansor: false }, KATSAYI)
    expect(negatif).toEqual(sifir)
  })

  it('ondalık kat aşağı yuvarlanır', () => {
    const a = tahminiAralik({ ...TEMEL, cikisKat: 4.9, cikisAsansor: false }, KATSAYI)
    const b = tahminiAralik({ ...TEMEL, cikisKat: 4, cikisAsansor: false }, KATSAYI)
    expect(a).toEqual(b)
  })
})

describe('tahminiAralik — bozuk girdi', () => {
  it.each([
    ['boş metin', ''],
    ['harf', 'abc'],
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
  ])('kat alanı %s olduğunda sonuç bozulmaz', (_ad, deger) => {
    const sonuc = tahminiAralik({ ...TEMEL, cikisKat: deger as never, cikisAsansor: false }, KATSAYI)
    expect(sonuc).toEqual({ alt: 38500, ust: 51500 })
  })

  it.each([
    ['taban NaN', { taban: Number.NaN }],
    ['taban 0', { taban: 0 }],
    ['taban negatif', { taban: -5000 }],
    ['çarpan NaN', { mesafeCarpani: Number.NaN }],
    ['çarpan 0', { mesafeCarpani: 0 }],
    ['taban undefined', { taban: undefined }],
  ])('%s → sonuç yok (null), NaN GÖSTERİLMEZ', (_ad, ezme) => {
    expect(tahminiAralik({ ...TEMEL, ...(ezme as object) }, KATSAYI)).toBeNull()
  })

  it('katsayılar bozuksa güvenli varsayılanlara düşer, çökmez', () => {
    const sonuc = tahminiAralik(TEMEL, {
      floorFee: Number.NaN,
      packingMultiplier: Number.NaN,
      storageFee: Number.NaN,
      rangePercent: Number.NaN,
      roundTo: 0,
    })
    // Aralık yüzdesi 0'a düştüğü için alt ve üst aynı; NaN yok, negatif yok.
    expect(sonuc).toEqual({ alt: 45000, ust: 45000 })
  })

  it('aralık yüzdesi 100 üstü olsa da alt sınır negatif olmaz', () => {
    const sonuc = tahminiAralik(TEMEL, { ...KATSAYI, rangePercent: 500 })!
    expect(sonuc.alt).toBeGreaterThanOrEqual(0)
  })

  it('hiçbir geçerli kombinasyon NaN/Infinity/negatif üretmez', () => {
    const tabanlar = [25000, 45000, 100000]
    const carpanlar = [1, 1.45, 1.85, 2.3]
    const katlar = [0, 1, 2, 15, 30]
    for (const taban of tabanlar)
      for (const mesafeCarpani of carpanlar)
        for (const kat of katlar)
          for (const asansor of [true, false])
            for (const paketleme of [true, false])
              for (const depolama of [true, false]) {
                const s = tahminiAralik(
                  {
                    taban,
                    mesafeCarpani,
                    cikisKat: kat,
                    cikisAsansor: asansor,
                    varisKat: kat,
                    varisAsansor: asansor,
                    paketleme,
                    depolama,
                  },
                  KATSAYI
                )
                expect(s).not.toBeNull()
                expect(Number.isFinite(s!.alt)).toBe(true)
                expect(Number.isFinite(s!.ust)).toBe(true)
                expect(s!.alt).toBeGreaterThan(0)
                expect(s!.ust).toBeGreaterThanOrEqual(s!.alt)
              }
  })
})

describe('katEki', () => {
  it('asansör varken her zaman 0', () => {
    expect(katEki(30, true, 2000)).toBe(0)
  })
  it('zemin ve 1. kat ücretsiz', () => {
    expect(katEki(0, false, 2000)).toBe(0)
    expect(katEki(1, false, 2000)).toBe(0)
    expect(katEki(2, false, 2000)).toBe(2000)
  })
  it('negatif kat ücreti 0 sayılır', () => {
    expect(katEki(5, false, -100)).toBe(0)
  })
})

describe('tlYaz', () => {
  it('binlik ayracını Türkçe biçimde koyar', () => {
    expect(tlYaz(12500)).toBe('12.500')
    expect(tlYaz(1718000)).toBe('1.718.000')
  })
  it('ondalığı yuvarlar', () => {
    expect(tlYaz(12499.6)).toBe('12.500')
  })
  it('bozuk girdide 0 yazar', () => {
    expect(tlYaz(Number.NaN)).toBe('0')
  })
})
