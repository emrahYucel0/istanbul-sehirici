// app/utils/mutlak-url.test.ts
import { describe, expect, it } from 'vitest'
import { mutlakUrl } from './mutlak-url.ts'

const KOK = 'https://istanbulevenakliyat.com'

describe('göreli yol mutlaklaşıyor', () => {
  it.each([
    ['/yuklemeler/foto-1024.webp', 'https://istanbulevenakliyat.com/yuklemeler/foto-1024.webp'],
    ['/images/hero-istanbul-1024.webp', 'https://istanbulevenakliyat.com/images/hero-istanbul-1024.webp'],
    ['images/a.webp', 'https://istanbulevenakliyat.com/images/a.webp'],
    ['//yuklemeler//a.webp', '//yuklemeler//a.webp'],
  ])('%s → %s', (yol, beklenen) => {
    expect(mutlakUrl(yol, KOK)).toBe(beklenen)
  })

  it('site kökünün sonundaki eğik çizgi çift çizgi üretmiyor', () => {
    expect(mutlakUrl('/a.webp', 'https://istanbulevenakliyat.com/')).toBe(
      'https://istanbulevenakliyat.com/a.webp'
    )
    expect(mutlakUrl('/a.webp', 'https://istanbulevenakliyat.com///')).toBe(
      'https://istanbulevenakliyat.com/a.webp'
    )
  })

  it('yoldaki fazladan eğik çizgi çift çizgi üretmiyor', () => {
    // `//…` ile başlayan değer protokolsüz adres sayılıp korunuyor
    // (yukarıdaki blokta ölçülüyor); burada tek çizgiden fazlası
    // birleştirmede kırpılıyor.
    expect(mutlakUrl('/a.webp', KOK)).toBe('https://istanbulevenakliyat.com/a.webp')
    expect(mutlakUrl('a.webp', KOK)).toBe('https://istanbulevenakliyat.com/a.webp')
  })

  it('boşluklar kırpılıyor', () => {
    expect(mutlakUrl('  /a.webp  ', KOK)).toBe('https://istanbulevenakliyat.com/a.webp')
  })
})

describe('kendi başına çözülen adrese DOKUNULMUYOR', () => {
  it.each([
    'https://cdn.istanbulevenakliyat.com/a.webp',
    'http://ornek.com/a.webp',
    '//cdn.ornek.com/a.webp',
    'data:image/webp;base64,AAAA',
  ])('%s olduğu gibi dönüyor', (yol) => {
    expect(mutlakUrl(yol, KOK)).toBe(yol)
  })

  it('çift öneke yol açmıyor — iki kez uygulamak aynı sonucu veriyor', () => {
    const bir = mutlakUrl('/yuklemeler/a.webp', KOK)
    expect(mutlakUrl(bir, KOK)).toBe(bir)
  })
})

describe('boş ve geçersiz girdi', () => {
  it.each([[''], ['   '], [null], [undefined], [0], [false], [{}], [[]]])('%s → boş dize', (yol) => {
    expect(mutlakUrl(yol as unknown, KOK)).toBe('')
  })

  it('site kökü yoksa göreli yol OLDUĞU GİBİ dönüyor — uydurma alan adı yazılmıyor', () => {
    expect(mutlakUrl('/a.webp', '')).toBe('/a.webp')
    expect(mutlakUrl('/a.webp', null)).toBe('/a.webp')
  })
})
