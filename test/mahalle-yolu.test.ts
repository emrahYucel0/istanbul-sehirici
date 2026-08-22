// test/mahalle-yolu.test.ts
//
// ADRES POLİTİKASININ TESTİ.
//
// `shared/utils/mahalle.ts` yayındaki 473 adresin tek kaynağı ve bugüne
// kadar hiç testi yoktu — oysa buradaki bir davranış değişikliği yayındaki
// adreslerin sessizce el değiştirmesi demek. Panel mahalle oluşturmaya
// açıldığı için bu dosya artık bir yazma yolunu da koruyor.
//
// NOT: dosya `test/` altında çünkü vitest kapsamı `shared/**` içermiyor
// (bkz. vitest.config.ts → include).
import { describe, expect, it } from 'vitest'
import {
  MAHALLE_EKI,
  mahalleBasligi,
  mahalleTabanYolu,
  mahalleYedekYolu,
  mahalleDizini,
} from '../shared/utils/mahalle'

describe('mahalleBasligi — görünen ad', () => {
  it('ek YOKSA "Mahallesi" ekliyor', () => {
    expect(mahalleBasligi('Yayalar')).toBe('Yayalar Mahallesi')
  })

  it('adında zaten "mahalle" geçen kayıtta ek TEKRARLANMIYOR', () => {
    // Veri setinde iki böyle kayıt var ("Yenimahalle"); "Yenimahalle
    // Mahallesi" okunmaz bir başlık olurdu.
    expect(mahalleBasligi('Yenimahalle')).toBe('Yenimahalle')
  })

  it('baştaki/sondaki boşluğu kırpıyor', () => {
    expect(mahalleBasligi('  Moda  ')).toBe('Moda Mahallesi')
  })
})

describe('mahalleTabanYolu — Türkçe normalizasyon', () => {
  it('Türkçe harfleri ASCII karşılığına indiriyor', () => {
    expect(mahalleTabanYolu('Çınardere')).toBe(`cinardere-${MAHALLE_EKI}`)
    expect(mahalleTabanYolu('Güzelyalı')).toBe(`guzelyali-${MAHALLE_EKI}`)
    expect(mahalleTabanYolu('Şirinevler')).toBe(`sirinevler-${MAHALLE_EKI}`)
  })

  it('büyük I harfini kaybetmiyor (tr-TR küçültme tuzağı)', () => {
    // "Iğdır" hatası: tr yerelinde I → ı, sonra ASCII olmadığı için
    // siliniyordu ve adres "gdir" oluyordu.
    expect(mahalleTabanYolu('Idealtepe')).toBe(`idealtepe-${MAHALLE_EKI}`)
  })

  it('çok kelimeli adı tek tireyle birleştiriyor', () => {
    expect(mahalleTabanYolu('Mustafa Kemal Paşa')).toBe(`mustafa-kemal-pasa-${MAHALLE_EKI}`)
  })

  it('aynı girdi her zaman aynı çıktıyı veriyor', () => {
    const a = mahalleTabanYolu('Fevzi Çakmak')
    const b = mahalleTabanYolu('Fevzi Çakmak')
    expect(a).toBe(b)
  })
})

describe('mahalleYedekYolu — ilçe önekli adres', () => {
  it('ilçe slug\'ını başa alıyor', () => {
    expect(mahalleYedekYolu('pendik', 'Fevzi Çakmak')).toBe(`pendik-fevzi-cakmak-${MAHALLE_EKI}`)
  })
})

describe('mahalleDizini — çakışma politikası', () => {
  const ilceler = [
    { slug: 'pendik', ad: 'Pendik', mahalleler: ['Kaynarca', 'Merkez'] },
    { slug: 'kartal', ad: 'Kartal', mahalleler: ['Merkez', 'Soğanlık'] },
  ]

  it('benzersiz ad TABAN adresi alıyor', () => {
    const dizin = mahalleDizini(ilceler)
    expect(dizin.yolaGore.get(`kaynarca-${MAHALLE_EKI}`)?.ad).toBe('Kaynarca')
    expect(dizin.yolaGore.get(`kaynarca-${MAHALLE_EKI}`)?.yedek).toBe(false)
  })

  it('çakışan grubun TAMAMI ilçe önekli adrese düşüyor', () => {
    // "ilki tabanı alsın" DENMİYOR: aksi hâlde yeni bir ilçeye aynı ad
    // eklendiğinde başka bir ilçenin yayındaki adresi el değiştirirdi.
    const dizin = mahalleDizini(ilceler)
    expect(dizin.yolaGore.has(`merkez-${MAHALLE_EKI}`)).toBe(false)
    expect(dizin.yolaGore.get(`pendik-merkez-${MAHALLE_EKI}`)?.ad).toBe('Merkez')
    expect(dizin.yolaGore.get(`kartal-merkez-${MAHALLE_EKI}`)?.ad).toBe('Merkez')
    expect(dizin.yedekAdedi).toBe(2)
  })

  it('kök ad alanında DOLU olan adres mahalleye verilmiyor', () => {
    const dolu = new Set([`kaynarca-${MAHALLE_EKI}`])
    const dizin = mahalleDizini(ilceler, dolu)
    expect(dizin.yolaGore.get(`pendik-kaynarca-${MAHALLE_EKI}`)?.ad).toBe('Kaynarca')
  })

  it('ilçeye göre gruplama doğru', () => {
    const dizin = mahalleDizini(ilceler)
    expect(dizin.ilceyeGore.get('pendik')?.map((x) => x.ad)).toEqual(['Kaynarca', 'Merkez'])
    expect(dizin.ilceyeGore.get('kartal')?.map((x) => x.ad)).toEqual(['Merkez', 'Soğanlık'])
  })

  it('DETERMİNİSTİK: aynı girdi iki kez aynı dizini üretiyor', () => {
    const a = mahalleDizini(ilceler)
    const b = mahalleDizini(ilceler)
    expect([...a.yolaGore.keys()].sort()).toEqual([...b.yolaGore.keys()].sort())
  })

  it('boş ve yalnız noktalamadan oluşan ad adres ÜRETMİYOR', () => {
    // Aksi hâlde `/-mahallesi` gibi bir adres oluşurdu.
    const dizin = mahalleDizini([
      { slug: 'pendik', ad: 'Pendik', mahalleler: ['', '   ', '---', 'Kaynarca'] },
    ])
    expect(dizin.toplam).toBe(1)
    expect(dizin.yolaGore.has(`-${MAHALLE_EKI}`)).toBe(false)
  })

  it('aynı ilçede aynı ad iki kez geçerse ikinci kayıt adres almıyor', () => {
    const dizin = mahalleDizini([
      { slug: 'pendik', ad: 'Pendik', mahalleler: ['Kaynarca', 'Kaynarca'] },
    ])
    // İkisi de aynı yedeğe düşer, ikincisi sessizce yanlış sayfayı açmak
    // yerine hiç adres almaz.
    expect(dizin.ilceyeGore.get('pendik')?.length).toBe(1)
  })
})
