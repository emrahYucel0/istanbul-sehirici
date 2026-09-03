// app/utils/fiyat-devri.test.ts
//
// HESAPLAYICI → İLETİŞİM DEVRİ.
//
// Bu dosyanın koruduğu asıl şey GÜVEN SINIRI: adres satırı kullanıcının
// elinde, dolayısıyla oradan gelen hiçbir değer doğrulanmadan ekrana ya da
// veri tabanına ulaşmamalı. Özellikle TUTAR adres satırında hiç taşınmıyor;
// aralık her zaman panelin kendi katsayılarından yeniden hesaplanıyor.
import { describe, expect, it } from 'vitest'
import {
  DEVIR_KAYNAGI,
  DEVIR_HEDEFI,
  DEVIR_KAYNAK_SAYFASI,
  devirOzeti,
  devirliMesaj,
  ekHizmetler,
  OZET_BASLIGI,
  NOT_BASLIGI,
  fiyatDevriniCoz,
  fiyatDevriniOku,
  fiyatDevriYolu,
  katCumlesi,
} from './fiyat-devri'
import { tahminiAralik } from './fiyat'

/** Panelin gerçek değerleriyle aynı biçimde bir katsayı kümesi. */
const KATSAYILAR = {
  floorFee: 2000,
  packingMultiplier: 1.18,
  storageFee: 10000,
  rangePercent: 15,
  roundTo: 500,
  odalar: [
    { id: 1, ad: '1+0 / Stüdyo', taban: 25000 },
    { id: 3, ad: '2+1', taban: 45000 },
    { id: 6, ad: 'Ofis / İşyeri', taban: 100000 },
  ],
  mesafeler: [
    { id: 1, ad: 'Aynı şehir içinde', carpan: 1 },
    { id: 4, ad: 'Uzun mesafe (700 km+)', carpan: 2.3 },
  ],
}

const GECERLI = {
  kaynak: DEVIR_KAYNAGI,
  oda: '3',
  mesafe: '1',
  cikisKat: '2',
  cikisAsansor: '1',
  varisKat: '4',
  varisAsansor: '0',
  paketleme: '0',
  depolama: '0',
}

// ═══════════════════════════════════════════ BİÇİM DOĞRULAMASI

describe('fiyatDevriniOku — geçerli adres', () => {
  it('sekiz alanı da okur', () => {
    expect(fiyatDevriniOku(GECERLI)).toEqual({
      odaId: 3,
      mesafeId: 1,
      cikisKat: 2,
      cikisAsansor: true,
      varisKat: 4,
      varisAsansor: false,
      paketleme: false,
      depolama: false,
    })
  })

  it('sınır katları kabul eder', () => {
    expect(fiyatDevriniOku({ ...GECERLI, cikisKat: '0', varisKat: '30' })).toMatchObject({
      cikisKat: 0,
      varisKat: 30,
    })
  })
})

describe('fiyatDevriniOku — reddedilenler', () => {
  it('kaynak işareti yoksa okumaz', () => {
    const { kaynak, ...eksik } = GECERLI
    expect(fiyatDevriniOku(eksik)).toBeNull()
    expect(fiyatDevriniOku({ ...GECERLI, kaynak: 'baska-yer' })).toBeNull()
  })

  it.each([
    'oda',
    'mesafe',
    'cikisKat',
    'cikisAsansor',
    'varisKat',
    'varisAsansor',
    'paketleme',
    'depolama',
  ])('%s eksikse devir tamamen geçersiz', (alan) => {
    const kopya: Record<string, string> = { ...GECERLI }
    delete kopya[alan]
    // HEPSİ YA DA HİÇBİRİ: eksik `paketleme` "paketleme yok" diye
    // okunsaydı kullanıcının seçmediği bir yapılandırma gösterilirdi.
    expect(fiyatDevriniOku(kopya)).toBeNull()
  })

  it.each([
    ['metin', 'HACK'],
    ['boş', ''],
    ['negatif', '-5'],
    ['ondalık', '3.7'],
    ['üstel', '1e3'],
    ['boşluklu', ' 3 '],
  ] as [string, string][])('oda değeri %s ise reddedilir', (_ad, deger) => {
    expect(fiyatDevriniOku({ ...GECERLI, oda: deger })).toBeNull()
  })

  it('kat aralığın dışındaysa reddedilir — sessizce sıkıştırılmaz', () => {
    expect(fiyatDevriniOku({ ...GECERLI, cikisKat: '31' })).toBeNull()
    expect(fiyatDevriniOku({ ...GECERLI, cikisKat: '999' })).toBeNull()
    expect(fiyatDevriniOku({ ...GECERLI, varisKat: '-1' })).toBeNull()
  })

  it('mantıksal alanlar yalnız 1/0 kabul eder', () => {
    for (const d of ['true', 'false', 'on', 'yes', '', '2']) {
      expect(fiyatDevriniOku({ ...GECERLI, paketleme: d }), d).toBeNull()
    }
  })

  it('aynı anahtar birden çok kez gelirse ilkini okur, çökmez', () => {
    expect(fiyatDevriniOku({ ...GECERLI, oda: ['3', '6'] })).toMatchObject({ odaId: 3 })
  })

  it('tanımadığı anahtarları hiç okumaz', () => {
    const kirli = { ...GECERLI, __proto__: 'x', constructor: 'y', fiyat: '1', alt: '9', ust: '9' }
    const c = fiyatDevriniOku(kirli)
    expect(c).not.toBeNull()
    // Yalnız sekiz alan dönüyor; fazladan hiçbir anahtar sızmıyor.
    expect(Object.keys(c as object).sort()).toEqual(
      [
        'cikisAsansor',
        'cikisKat',
        'depolama',
        'mesafeId',
        'odaId',
        'paketleme',
        'varisAsansor',
        'varisKat',
      ].sort()
    )
  })

  it('boş ve bozuk girdide istisna atmaz', () => {
    expect(fiyatDevriniOku({})).toBeNull()
    expect(fiyatDevriniOku({ kaynak: null, oda: undefined })).toBeNull()
  })
})

// ═══════════════════════════════════════════ GERÇEKLİK DOĞRULAMASI

describe('fiyatDevriniCoz', () => {
  it('etiketleri panelden çözer, kimliği ekrana taşımaz', () => {
    const c = fiyatDevriniCoz(fiyatDevriniOku(GECERLI), KATSAYILAR)
    expect(c?.odaAdi).toBe('2+1')
    expect(c?.mesafeAdi).toBe('Aynı şehir içinde')
  })

  it('bilinmeyen oda kimliği devri geçersiz kılar', () => {
    const g = fiyatDevriniOku({ ...GECERLI, oda: '99' })
    expect(g).not.toBeNull()
    // Biçim doğru ama kayıt yok: ilk seçeneğe DÜŞMÜYOR.
    expect(fiyatDevriniCoz(g, KATSAYILAR)).toBeNull()
  })

  it('bilinmeyen mesafe kimliği devri geçersiz kılar', () => {
    expect(fiyatDevriniCoz(fiyatDevriniOku({ ...GECERLI, mesafe: '99' }), KATSAYILAR)).toBeNull()
  })

  it('katsayı yoksa çözüm de yok', () => {
    expect(fiyatDevriniCoz(fiyatDevriniOku(GECERLI), null)).toBeNull()
  })

  it('aralık hesaplayıcının kendi fonksiyonundan geliyor', () => {
    const c = fiyatDevriniCoz(fiyatDevriniOku(GECERLI), KATSAYILAR)
    const beklenen = tahminiAralik(
      {
        taban: 45000,
        mesafeCarpani: 1,
        cikisKat: 2,
        cikisAsansor: true,
        varisKat: 4,
        varisAsansor: false,
        paketleme: false,
        depolama: false,
      },
      KATSAYILAR
    )
    expect(c?.aralik).toEqual(beklenen)
  })

  it('ADRESTEKİ SAHTE TUTAR SONUCU DEĞİŞTİRMİYOR', () => {
    // Güven sınırı: adres satırına fiyat yazmak bir işe yaramamalı.
    const temiz = fiyatDevriniCoz(fiyatDevriniOku(GECERLI), KATSAYILAR)
    const sahte = fiyatDevriniCoz(
      fiyatDevriniOku({ ...GECERLI, alt: '1', ust: '2', fiyat: '1', taban: '1' }),
      KATSAYILAR
    )
    expect(sahte?.aralik).toEqual(temiz?.aralik)
  })
})

// ═══════════════════════════════════════════ ADRES ÜRETİMİ

describe('fiyatDevriYolu', () => {
  const girdi = {
    odaId: 3,
    mesafeId: 1,
    cikisKat: 2,
    cikisAsansor: true,
    varisKat: 4,
    varisAsansor: false,
    paketleme: true,
    depolama: false,
  }

  it('iletişim sayfasına gidiyor', () => {
    expect(fiyatDevriYolu(girdi).startsWith(`${DEVIR_HEDEFI}?`)).toBe(true)
  })

  it('ürettiği adres kendi okuyucusundan geçiyor', () => {
    const sorgu = Object.fromEntries(
      new URLSearchParams(fiyatDevriYolu(girdi).split('?')[1] as string)
    )
    expect(fiyatDevriniOku(sorgu)).toEqual(girdi)
  })

  /**
   * Adresteki ANAHTARLAR sınanıyor, ham dize değil: `kaynak` değeri
   * "fiyat-hesaplama" olduğu için ham dizede "fiyat" geçmesi normal ve
   * doğru — taşınmaması gereken şey `fiyat=` gibi bir PARAMETRE.
   */
  const anahtarlar = () => [
    ...new URLSearchParams(fiyatDevriYolu(girdi).split('?')[1] as string).keys(),
  ]

  it('yalnız dokuz beklenen anahtar var', () => {
    expect(anahtarlar().sort()).toEqual(
      [
        'kaynak',
        'oda',
        'mesafe',
        'cikisKat',
        'cikisAsansor',
        'varisKat',
        'varisAsansor',
        'paketleme',
        'depolama',
      ].sort()
    )
  })

  it('tutar ya da katsayı TAŞIMIYOR', () => {
    for (const yasak of ['alt', 'ust', 'fiyat', 'taban', 'carpan', 'tutar', 'aralik']) {
      expect(anahtarlar().includes(yasak), yasak).toBe(false)
    }
  })

  it('kişisel bilgi taşımıyor', () => {
    for (const yasak of ['ad', 'isim', 'telefon', 'eposta', 'mail', 'adres', 'not', 'mesaj']) {
      expect(anahtarlar().includes(yasak), yasak).toBe(false)
    }
  })
})

// ═══════════════════════════════════════════ METİN

describe('devirOzeti — talep kaydına yazılan kanonik metin', () => {
  const etiketler = fiyatDevriniCoz(
    fiyatDevriniOku({ ...GECERLI, paketleme: '1' }),
    KATSAYILAR
  )!

  it('seçimleri doğal Türkçeyle yazıyor', () => {
    const m = devirOzeti(etiketler)
    expect(m).toContain(OZET_BASLIGI)
    expect(m).toContain('- Ev: 2+1')
    expect(m).toContain('- Mesafe: Aynı şehir içinde')
    expect(m).toContain('- Çıkış: 2. kat · asansör var')
    expect(m).toContain('- Varış: 4. kat · asansör yok')
    expect(m).toContain('- Ek hizmet: paketleme')
  })

  it('"true"/"false" ve kimlik yazmıyor', () => {
    const m = devirOzeti(etiketler)
    for (const yasak of ['true', 'false', 'odaId', 'mesafeId', 'id=']) {
      expect(m.includes(yasak), yasak).toBe(false)
    }
  })

  it('TUTAR YAZMIYOR — kayıt bir teklif değil', () => {
    const m = devirOzeti(etiketler)
    expect(m).not.toMatch(/\d{1,3}\.\d{3}/)
    expect(m).not.toContain('TL')
  })

  it('doğrulanmamış iddia taşımıyor', () => {
    const m = devirOzeti(etiketler).toLowerCase()
    for (const yasak of [
      'kesin fiyat',
      'sabit fiyat',
      'garanti',
      'ücretsiz',
      'yazılı olarak',
      '%100',
      'sigortalı',
    ]) {
      expect(m.includes(yasak), yasak).toBe(false)
    }
  })

  it('ek hizmet seçilmediyse o satır hiç yok', () => {
    const c = fiyatDevriniCoz(fiyatDevriniOku(GECERLI), KATSAYILAR)!
    expect(devirOzeti(c)).not.toContain('Ek hizmet')
  })
})

describe('devirliMesaj — özet ile kullanıcı notunun sınırı', () => {
  const etiketler = fiyatDevriniCoz(fiyatDevriniOku(GECERLI), KATSAYILAR)!
  const ozet = devirOzeti(etiketler)

  it('kullanıcı notu KORUNUYOR ve özetten sonra geliyor', () => {
    const m = devirliMesaj(ozet, 'Kapıdan geçmeyen bir gardırop var.')
    expect(m.startsWith(OZET_BASLIGI)).toBe(true)
    expect(m).toContain(NOT_BASLIGI)
    expect(m).toContain('Kapıdan geçmeyen bir gardırop var.')
    // Özet notun ÖNÜNDE: personel önce ne seçildiğini görüyor.
    expect(m.indexOf(OZET_BASLIGI)).toBeLessThan(m.indexOf(NOT_BASLIGI))
  })

  it('not boşsa "Kullanıcı notu" başlığı hiç yazılmıyor', () => {
    for (const bos of ['', '   ', '\n\n']) {
      const m = devirliMesaj(ozet, bos)
      expect(m).toBe(ozet)
      expect(m).not.toContain(NOT_BASLIGI)
    }
  })

  it('kullanıcının metni KIRPILMIYOR, ezilmiyor', () => {
    const uzun = 'A'.repeat(500) + '\nikinci satır'
    const m = devirliMesaj(ozet, uzun)
    expect(m).toContain(uzun)
  })

  it('kullanıcı özeti taklit eden metin yazsa bile KANONİK olan üstte', () => {
    // Kullanıcı kutuya sahte bir özet yazarsa da sunucunun ürettiği
    // gerçek özet metnin BAŞINDA duruyor.
    const sahte = `${OZET_BASLIGI}\n- Ev: 1+0 / Stüdyo`
    const m = devirliMesaj(ozet, sahte)
    expect(m.startsWith(ozet)).toBe(true)
    expect(m.indexOf('- Ev: 2+1')).toBeLessThan(m.indexOf('- Ev: 1+0 / Stüdyo'))
  })
})

describe('yardımcılar', () => {
  it('kat cümlesi', () => {
    expect(katCumlesi(0, true)).toBe('0. kat · asansör var')
    expect(katCumlesi(4, false)).toBe('4. kat · asansör yok')
  })

  it('ek hizmet listesi', () => {
    const t = { paketleme: true, depolama: true } as never
    expect(ekHizmetler(t)).toEqual(['paketleme', 'depolama'])
    expect(ekHizmetler({ paketleme: false, depolama: false } as never)).toEqual([])
  })

  it('kaynak sayfası sabiti hesaplayıcının yolu', () => {
    expect(DEVIR_KAYNAK_SAYFASI).toBe('/fiyat-hesaplama')
  })
})
